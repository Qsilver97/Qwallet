

#define QCLIENT

#include <stdio.h>
#include <string.h>
#include <stdint.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/ipc.h>
#include <sys/msg.h>

#include "qshared/K12AndKeyUtil.h"
#include "qshared/qdefines.h"
#include "qshared/qstructs.h"
#include "qshared/qkeys.c"
#include "qshared/qhelpers.c"
#include "qshared/qtime.c"

/*
 commands:
    <address>           -> must be first and use address from seed (index 0), will return entity data
    list                -> returns all the addresses in the subscription account
    +<index> <address>  -> adds address to index if index is empty
    -<index> <address>  -> removes address from index if it matches
    clearderived        -> clears all except the index 0 address
 
    <logintx hex>       -> creates subscription from wasm logintx hex value, call after starting websockets with <address>
    <broadcasttx>       -> broadcasts tx to network
    <txid> [tick]       -> searches tick for txid, uses tick of broadcasttx if no tick specified
 
 Right after opening the websocket, send address of the seed (index 0)
 this should start sending tick data
 call wasm logintx and submit that to start subscription. this will send just an array of balances when it changes
 +index addresses to match the addresses in the wasm login. this just needs to be done when new index are created
 -index address when address is deleted
 
 you can verify that all addresses are there and in the right slot using subshash, that wasm will also return
 
 after sending a normal tx for broadcasting, the wasm will poll with <address> to get the entity data
 
 If subshash from wasm does not match from server, then do a clearderived to websockets, list password to wasm
 v1request will now return a lot of "+n addr" requests, so as long as it is doing that submit to websockets in a tight loop
 no need to wait 1 sec between. then after it is done updating the server, the subshash should match
 */

void helplines()
{
    printf("Websockets server for Qwallet\n \
           <address>                    -> must be first and use address from seed (index 0), will return entity data. after first time should have valid entity data\n \
           <logintx hex>                -> creates subscription from wasm logintx hex value, call after starting websockets with  <address>\n \
           list [noaddrs]               -> returns all the addresses in the subscription account\n \
           +<index> <address>           -> adds address to index if index is empty\n \
           -<index> <address>           -> removes address from index if it matches\n \
           clearderived                 -> clears all except the index 0 address\n \
           balances                     -> returns array of balances\n \
           <broadcasttx>                -> broadcasts tx to network\n \
           <txid> [tick]                -> searches tick for txid, uses tick of broadcasttx if no tick specified\n \
           tokenlist                    -> returns list of tokens to trade in QX\n \
           tokenissuer <name>           -> returns issuer of a specific token\n \
           orders <name>                -> returns orders for a specific token\n \
           myorders                     -> returns orders for account trading address\n \
           richlist[.tok] [start [num]] -> richlist for token (defaults to QU), start rank, number (defaults to 100)\n \
           history <address> [start]    -> returns all tx in archive for address [optional from start tick]\n \
           ");
}

int32_t Subscriber,Numaddrs,Histogram[4],PENDINGTXTICK;
char Firstaddr[64],PENDINGTXID[64],PENDINGTXADDR[64];
uint8_t Subpubs[MAX_INDEX][32],Firstpub[32];
uint32_t Subshash,Firstutime;
int64_t Subsbalances[MAX_INDEX],Firstbalance;
struct addrhash Subsdata[MAX_INDEX][2],Firstdata[2];
pthread_mutex_t command_mutex;

// wasm:1 json needs to also have command field

int32_t subpubshash(uint32_t *subshashp,uint8_t subpubs[MAX_INDEX][32])
{
    int32_t i,j,n = 0;
    uint8_t zero[32],hash[32],subshash[32];
    memset(zero,0,sizeof(zero));
    memset(hash,0,sizeof(hash));
    for (i=0; i<MAX_INDEX; i++)
    {
        if ( memcmp(zero,subpubs[i],32) != 0 )
        {
            for (j=0; j<32; j++)
                hash[j] ^= subpubs[i][j];
            n++;
        }
    }
    KangarooTwelve(hash,32,subshash,32);
    memcpy(subshashp,subshash,sizeof(*subshashp));
    return(n);
}

int32_t calc_subshash(uint32_t *subshashp,uint8_t subpubs[MAX_INDEX][32],char *subaddr)
{
    FILE *fp;
    char fname[512];
    *subshashp = 0;
    sprintf(fname,"%s%csubs%c%s",DATADIR,dir_delim(),dir_delim(),subaddr);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        if ( fread(subpubs,1,MAX_INDEX * 32,fp) != MAX_INDEX * 32 )
            printf("read error for subs %s\n",fname);
        fclose(fp);
        return(subpubshash(subshashp,subpubs));
    } else return(0);
}

int32_t Qclientsubs(uint32_t *subshashp,uint8_t subpubs[MAX_INDEX][32],char *subaddr,int32_t index,uint8_t indexpub[32])
{
    int32_t i,errflag,n = 0;
    FILE *fp = 0;
    uint8_t zero[32];
    char fname[512];
    memset(subpubs,0,MAX_INDEX * 32);
    memset(zero,0,32);
    *subshashp = 0;
    if ( indexpub != 0 && (index <= 0 || index >= MAX_INDEX) )
        return(-1);
    sprintf(fname,"%s%csubs%c%s",DATADIR,dir_delim(),dir_delim(),subaddr);
    if ( (fp= fopen(fname,"rb+")) != 0 )
    {
        fread(subpubs,MAX_INDEX,32,fp);
        if ( index > 0 && indexpub != 0 )
        {
            errflag = 0;
            if ( memcmp(zero,indexpub,32) != 0 )
            {
                for (i=0; i<MAX_INDEX; i++)
                    if ( memcmp(subpubs[i],indexpub,32) == 0 )
                    {
                        printf("cannot add duplicate pubkey\n");
                        errflag = 1;
                        break;
                    }
            }
            if ( errflag == 0 )
            {
                memcpy(subpubs[index],indexpub,32);
                rewind(fp);
                fwrite(subpubs,MAX_INDEX,32,fp);
            }
        }
    }
    else
    {
        addr2pubkey(subaddr,subpubs[0]);
        if ( (fp= fopen(fname,"wb")) != 0 )
             fwrite(subpubs,MAX_INDEX,32,fp);
    }
    if ( fp != 0 )
        fclose(fp);
    n = subpubshash(subshashp,subpubs);
    return(n);
}

void loginjson(void)
{
    printf("{\"numaddrs\":%d,\"subshash\":\"%x\",\"subscriber\":\"%s\"}\n",Numaddrs,Subshash,Firstaddr);
}

void latestjson(int32_t subscriber)
{
    uint32_t utime;
    int32_t year,month,day,seconds;
    utime = set_current_ymd(&year,&month,&day,&seconds);
    if ( subscriber == 0 )
        printf("{\"tick\":%d,\"wasm\":1,\"command\":\"CurrentTickInfo\",\"utc\":%u}\n",LATEST_TICK,utime);
    else
    {
        Numaddrs = calc_subshash(&Subshash,Subpubs,Firstaddr);
        printf("{\"tick\":%d,\"validated\":%d,\"havetx\":%d,\"numaddrs\":%d,\"subshash\":\"%x\",\"wasm\":1,\"command\":\"CurrentTickInfo\",\"utc\":%u}\n",LATEST_TICK,VALIDATED_TICK,HAVE_TXTICK,Numaddrs,Subshash,utime);
    }
}

void txjson(char *jsonstr,char *txidstr,uint8_t txdata[MAX_TX_SIZE],int32_t txlen,int32_t wasmflag)
{
    Transaction tx;
    char srcstr[64],deststr[64],extrastr[MAX_INPUT_SIZE*2+1];
    extrastr[0] = 0;
    if ( txlen >= sizeof(tx) )
    {
        memcpy(&tx,txdata,sizeof(tx));
        pubkey2addr(tx.sourcePublicKey,srcstr);
        pubkey2addr(tx.destinationPublicKey,deststr);
        if ( tx.inputSize <= MAX_INPUT_SIZE )
            byteToHex(&txdata[sizeof(tx)],extrastr,tx.inputSize);
    }
    else
    {
        memset(&tx,0,sizeof(tx));
        srcstr[0] = deststr[0] = 0;
    }
    sprintf(jsonstr,"{\"txid\":\"%s\",\"tick\":%d,\"src\":\"%s\",\"dest\":\"%s\",\"amount\":\"%s\",\"type\":%d,\"extralen\":%d,\"extra\":\"%s\",\"command\":\"txidrequest\"%s}",txidstr,tx.tick,srcstr,deststr,amountstr(tx.amount),tx.inputType,tx.inputSize,extrastr,wasmflag!=0?",\"wasm\":1":"");
}

int32_t tickstxjson(int32_t epoch,int32_t tick,char *spectrumstr,char *qchainstr)
{
    FILE *fp;
    Transaction tx;
    uint8_t txid[32],txdata[MAX_TX_SIZE];
    char fname[512],jsonstr[8192],txidstr[64];
    int32_t i,txlen;
    printf("{\"tick\":%d,\"spectrum\":\"%s\",\"qchain\":\"%s\",\"tx\":[",tick,spectrumstr,qchainstr);
    epochfname(fname,epoch,tick,".T");
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        for (i=0; i<NUMBER_OF_TRANSACTIONS_PER_TICK; i++)
        {
            if ( fread(&txlen,1,sizeof(txlen),fp) != sizeof(txlen) || txlen < sizeof(tx) || txlen > sizeof(tx)+MAX_INPUT_SIZE+SIGNATURE_SIZE )
                break;
            if ( fread(txid,1,sizeof(txid),fp) != sizeof(txid) )
                break;
            if ( fread(txdata,1,txlen,fp) != txlen )
                break;
            memcpy(&tx,txdata,sizeof(tx));
            digest2txid(txid,txidstr);
            txjson(jsonstr,txidstr,txdata,txlen,0);
            printf("%s%s",i>0?",":"",jsonstr);
        }
        fclose(fp);
    }
    printf("]}\n");
    return(-1);
}

int32_t scanfortxid(char *txidstr)
{
    FILE *fp;
    int32_t n = 0;
    char fname[512];
    Transaction tx;
    uint8_t txid[32],reftxid[32];
    txid2digest(txidstr,reftxid);
    //printf("search for %s\n",txidstr);
    sprintf(fname,"%s%carchive",DATADIR,dir_delim());
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        while ( 1 )
        {
            if ( fread(txid,1,sizeof(txid),fp) != sizeof(txid) )
            {
                //printf("error reading %dth txid\n",n);
                break;
            }
            if ( fread(&tx,1,sizeof(tx),fp) != sizeof(tx) )
            {
                //printf("error reading %dth tx\n",n);
                break;
            }
            if ( memcmp(reftxid,txid,32) == 0 )
            {
                //printf("found %s at tick.%d\n",txidstr,tx.tick);
                fclose(fp);
                return(tx.tick);
            }
            n++;
        }
    }
    fclose(fp);
    return(0);
}


void ticksummary(int32_t tick)
{
    FILE *fp;
    long offset;
    char fname[512],spectrumstr[65],qchainstr[65];
    int32_t epoch,initial_tick;
    uint8_t spectrum[32],qchain[32];
    epoch = tick2epoch(tick);
    if ( epoch != 0 )
    {
        initial_tick = epochstart(epoch);
        offset = tick - initial_tick;
        //printf("ticksummary %d epoch.%d initial_tick.%d offset.%ld\n",tick,epoch,initial_tick,offset);
        sprintf(fname,"%s%cqchain.%d",DATADIR,dir_delim(),EPOCH);
        memset(spectrum,0,sizeof(spectrum));
        memset(qchain,0,sizeof(qchain));
        if ( (fp= fopen(fname,"rb")) != 0 )
        {
            fseek(fp,(long)offset * 32 * 2,SEEK_SET);
            fread(spectrum,1,32,fp);
            fread(qchain,1,32,fp);
            fclose(fp);
        } else printf("could not open %s\n",fname);
        byteToHex(spectrum,spectrumstr,32);
        byteToHex(qchain,qchainstr,32);
        tickstxjson(epoch,tick,spectrumstr,qchainstr);
    }
    else printf("{\"error\":\"tick.%d outside of epochs\"}\n",tick);
}

void entityjson(char *addr,int32_t rank,struct Entity E,int32_t tick,char *beforetxid,struct univhash *up)
{
    char beforestr[512],univstr[4096],name[8];
    int32_t i;
    if ( up != 0 )
    {
        sprintf(univstr,",\"ownedtick\":%d,\"tokens\":[",up->ownedtick);
        for (i=0; i<sizeof(up->owned)/sizeof(*up->owned); i++)
        {
            if ( up->owned[i][0] != 0 )
            {
                memset(name,0,sizeof(name));
                memcpy(name,&up->owned[i][0],7);
                sprintf(univstr+strlen(univstr),"%s[\"%s\",\"%s\"]",i>0?",":"",name,amountstr(up->owned[i][1]));
            }
        }
        sprintf(univstr+strlen(univstr),"]");
    }
    else
        univstr[0] = 0;
    sprintf(beforestr,"\"before\":\"%s\",",beforetxid);
    printf("{\"rank\":%d,%s\"address\":\"%s\",\"balance\":\"%s\",\"tick\":%d,\"pending\":%d,\"numin\":%d,\"totalincoming\":\"%s\",\"latestin\":%d,\"numout\":%d,\"totaloutgoing\":\"%s\",\"latestout\":%d,\"command\":\"EntityInfo\",\"wasm\":1%s}\n",rank,beforetxid[0]==0?"":beforestr,addr,amountstr(E.incomingAmount - E.outgoingAmount),tick,PENDINGTXTICK,E.numberOfIncomingTransfers,amountstr4(E.incomingAmount),E.latestIncomingTransferTick,E.numberOfOutgoingTransfers,amountstr5(E.outgoingAmount),E.latestOutgoingTransferTick,univstr);
}

int64_t addrhashdata(char *addr,struct addrhash data[2])
{
    FILE *fp;
    uint8_t pubkey[32],zero[32];
    struct addrhash A;
    char fname[512];
    int64_t i,hashi,balance = 0;
    if ( addr2pubkey(addr,pubkey) <= 0 )
        return(0);
    memset(&A,0,sizeof(A));
    memset(data,0,sizeof(*data)*2);
    memset(zero,0,sizeof(zero));
    hashi = addrhashi(pubkey);
    sprintf(fname,"%s%caddrhash",DATADIR,dir_delim());
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        for (i=0; i<MAXADDRESSES; i++)
        {
            fseek(fp,sizeof(A) * ((hashi + i) % MAXADDRESSES),SEEK_SET);
            if ( fread(&A,1,sizeof(A),fp) == sizeof(A) )
            {
                if ( memcmp(A.entity.publicKey,zero,32) == 0 )
                    break;
                else if ( memcmp(A.entity.publicKey,pubkey,32) == 0 )
                {
                    balance = (A.entity.incomingAmount - A.entity.outgoingAmount);
                    data[0] = data[1] = A;
                    break;
                }
            } else break;
        }
        fclose(fp);
    }
    return(balance);
}

int32_t univhashdata(char *addr,struct univhash *up)
{
    FILE *fp;
    uint8_t pubkey[32],zero[32];
    struct univhash U;
    char fname[512];
    int64_t i,hashi,retval = 0;
    if ( addr2pubkey(addr,pubkey) <= 0 )
        return(0);
    memset(&U,0,sizeof(U));
    memset(up,0,sizeof(*up));
    memset(zero,0,sizeof(zero));
    hashi = addrhashi(pubkey);
    sprintf(fname,"%s%cunivhash",DATADIR,dir_delim());
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        for (i=0; i<MAXADDRESSES; i++)
        {
            fseek(fp,sizeof(U) * ((hashi + i) % MAXADDRESSES),SEEK_SET);
            if ( fread(&U,1,sizeof(U),fp) == sizeof(U) )
            {
                if ( memcmp(U.pubkey,zero,32) == 0 )
                    break;
                else if ( memcmp(U.pubkey,pubkey,32) == 0 )
                {
                    *up = U;
                    retval = 1;
                    break;
                }
            } else break;
        }
        fclose(fp);
    }
    return(retval);
}

void addrhashjson(char *addr,struct addrhash data[2],char *beforetxid)
{
    struct addrhash *ap;
    struct univhash U,*up;
    ap = &data[0];
    if ( univhashdata(addr,&U) > 0 )
        up = &U;
    else up = 0;
    entityjson(addr,ap->rank,ap->entity,ap->nexttick-1,beforetxid,up);
}

void subsjson(char *subaddr,char *arg)
{
    int32_t i,noaddrs = 0;
    int64_t total = 0;
    uint8_t zero[32];
    char addr[64];
    if ( arg != 0 && arg[0] == ' ' && atoi(arg+1) == 1 )
        noaddrs = 1;
    memset(zero,0,sizeof(zero));
    Numaddrs = calc_subshash(&Subshash,Subpubs,Firstaddr);
    for (i=0; i<MAX_INDEX; i++)
        total += Subsbalances[i];
    printf("{\"subscriber\":\"%s\",\"tick\":%d,\"numaddrs\":%d,\"subshash\":\"%x\",\"total\":\"%s\",\"%s\":[",Firstaddr,LATEST_TICK,Numaddrs,Subshash,amountstr(total),noaddrs==0?"addresses":"balances");
    for (i=0; i<MAX_INDEX; i++)
    {
        if ( memcmp(zero,Subpubs[i],32) != 0 )
        {
            if ( noaddrs == 0 )
            {
                pubkey2addr(Subpubs[i],addr);
                printf("%s[%d,\"%s\",\"%s\"]",i>0?",":"",i,addr,amountstr(Subsbalances[i]));
            }
            else printf("%s[%d,\"%s\"]",i>0?",":"",i,amountstr(Subsbalances[i]));
        }
    }
    printf("]}\n");
}

void subsbalancesjson(void)
{
    subsjson(Firstaddr,(char *)" 1");
}

void update_subs(int32_t subscriber)
{
    int32_t i,year,month,day,seconds;
    uint32_t utime;
    char addr[64];
    uint8_t zero[32];
    if ( subscriber == 0 ) // single address per Qwallet will not saturate Qserver, number of threads will maxout first
    {
        utime = set_current_ymd(&year,&month,&day,&seconds);
        if ( utime > Firstutime+60 )
        {
            Qserver_msg(Firstaddr);
            Firstutime = utime;
        }
        Firstbalance = addrhashdata(Firstaddr,Firstdata);
    }
    else
    {
        for (i=0; i<MAX_INDEX; i++)
        {
            if ( memcmp(zero,Subpubs[i],32) != 0 )
            {
                pubkey2addr(Subpubs[i],addr);
                Subsbalances[i] = addrhashdata(addr,Subsdata[i]);
            } else Subsbalances[i] = 0;
        }
    }
}

void addressdata(int32_t subscriber,char *addr,char *beforetxid)
{
    int32_t i;
    struct addrhash data[2];
    uint8_t zero[32],pubkey[32];
    if ( subscriber == -1 ) // auto search
    {
        if ( strcmp(Firstaddr,addr) == 0 )
        {
            Firstbalance = addrhashdata(Firstaddr,Firstdata);
            addrhashjson(addr,Firstdata,beforetxid);
        }
        else
        {
            addr2pubkey(addr,pubkey);
            for (i=0; i<MAX_INDEX; i++)
                if ( memcmp(pubkey,Subpubs[i],32) == 0 )
                {
                    Subsbalances[i] = addrhashdata(addr,Subsdata[i]);
                    addrhashjson(addr,Subsdata[i],beforetxid);
                    break;
                }
        }
        return; // no "before" balance message if not valid address
    }
    if ( subscriber == 0 )
    {
        if ( strcmp(addr,Firstaddr) == 0 )
        {
            Firstbalance = addrhashdata(Firstaddr,Firstdata);
            addrhashjson(addr,Firstdata,beforetxid);
        }
        else if ( addrhashdata(addr,data) != 0 )
        {
            addrhashjson(addr,data,beforetxid);
            return;
        }
    }
    else
    {
        addr2pubkey(addr,pubkey);
        for (i=0; i<MAX_INDEX; i++)
        {
            if ( memcmp(pubkey,Subpubs[i],32) == 0 )
            {
                Subsbalances[i] = addrhashdata(addr,Subsdata[i]);
                addrhashjson(addr,Subsdata[i],beforetxid);
                return;
            }
        }
        if ( addrhashdata(addr,data) != 0 )
        {
            addrhashjson(addr,data,beforetxid);
            return;
        }
        printf("{\"error\":\"no data for %s\"}\n",addr);
    }
}

int32_t islogintx(Transaction *tx)
{
    if ( memcmp(tx->sourcePublicKey,tx->destinationPublicKey,32) == 0 )
        return(1);
    else return(0);
}

struct txentry *address_txids(int32_t *nump,char *addr,int32_t firsttick)
{
    char fname[512];
    FILE *fp;
    long fsize,fpos;
    int32_t size,n = 0;
    struct txentry TE,*txs = 0;
    uint8_t pubkey[32],txid[32 + sizeof(Transaction)];
    sprintf(fname,"%s%chistory/%s",DATADIR,dir_delim(),addr);
    *nump = 0;
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        fseek(fp,0,SEEK_END);
        fsize = ftell(fp);
        rewind(fp);
        //printf("%s opened size.%ld\n",fname,fsize);
        while ( fread(&TE,1,sizeof(TE),fp) == sizeof(TE) )
        {
            if ( TE.tx.tick < firsttick )
                continue;
            if ( txs == 0 )
            {
                fpos = ftell(fp);
                size = (int32_t)(fsize - fpos + sizeof(TE));
                txs = (struct txentry *)calloc(1,size);
                *nump = (size / sizeof(TE));
                if ( (size % sizeof(TE)) != 0 )
                    printf("ERROR unexpected remainder %d for %s from %ld\n",size,fname,fpos);
                txs[0] = TE;
                n = 1;
            }
            else txs[n++] = TE;
        }
        fclose(fp);
    }
    if ( *nump != n )
        printf("ERROR unexpected n.%d != num.%d for %s\n",n,*nump,fname);
    return(txs);
}

int32_t txs_findgroup(int32_t *groupstartp,struct txentry *txs,int32_t numtx,int32_t beforetick,int32_t lasttick)
{
    int32_t i,tick,n = 0;
    *groupstartp = -1;
    for (i=0; i<numtx; i++)
    {
        tick = txs[i].tx.tick;
        if ( tick <= beforetick )
            continue;
        else if ( tick > lasttick )
            break;
        if ( *groupstartp == -1 )
            *groupstartp = i;
        n++;
    }
    //printf("find group before.%d last.%d n.%d of numtx.%d\n",beforetick,lasttick,n,numtx);
    return(n);
}

void historyjson(char *addr,FILE *outfp,int32_t starttick)
{
    FILE *fp;
    char fname[512];
    char txidstr[72],src[64],dest[64],other[64];
    int32_t n = 0;
    int64_t polarity;
    uint8_t pubkey[32],txid[32 + sizeof(Transaction)];
    Transaction tx;
    sprintf(fname,"%s%chistory%c%s",DATADIR,dir_delim(),dir_delim(),addr);
    fprintf(outfp,"{\"address\":\"%s\",\"rawhistory\":[",addr);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        while ( fread(txid,1,32 + sizeof(Transaction),fp) == 32 + sizeof(Transaction) )
        {
            memcpy(&tx,&txid[32],sizeof(tx));
            if ( tx.tick < starttick )
                continue;
            if ( tx.inputType >= (QUTIL_CONTRACT_ID << 5) )
            {
                if ( tickfindsender(tx.tick,tx.sourcePublicKey,txidstr) < 0 )
                    strcpy(txidstr,"sendmany output");
                sprintf(txidstr+strlen(txidstr),".%d",tx.inputType & 0x1f);
            }
            else digest2txid(txid,txidstr);
            pubkey2addr(tx.sourcePublicKey,src);
            pubkey2addr(tx.destinationPublicKey,dest);
            if ( strcmp(src,addr) == 0 )
            {
                strcpy(other,dest);
                polarity = -1;
            }
            else if ( strcmp(dest,addr) == 0 )
            {
                strcpy(other,src);
                polarity = 1;
            }
            else
            {
                fprintf(outfp,"error src.%s dest.%s does not match %s\n",src,dest,addr);
                polarity = 0;
            }
            fprintf(outfp,"%s[\"%d\",\"%s\",\"%s\",\"%s\"]",n>0?",":"",tx.tick,txidstr,other,amountstr(polarity * tx.amount));
            n++;
        }
        fclose(fp);
    } else fprintf(outfp,"could not open %s\n",addr);
    fprintf(outfp,"],\"num\":%d}\n",n);
}

int32_t balance_history(char *addr,FILE *outfp,int32_t starttick)
{
    char fname[512],txidstr[512],other[64],status[1024];
    FILE *fp;
    uint8_t pubkey[32];
    Transaction tx;
    struct txentry *txs = 0;
    int64_t insum,outsum,amount;
    int32_t z,c,errflag,tick,rank,i,n,numin,numout,counter,polarity,groupsize,groupstart,sendmanytick,firsttick = 0;
    struct addrhash A,prevA;
    memset(&A,0,sizeof(A));
    memset(&prevA,0,sizeof(prevA));
    prevA = A;
    counter = 0;
    addr2pubkey(addr,pubkey);
    sprintf(fname,"%s%caddrs/%s",DATADIR,dir_delim(),addr);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        fprintf(outfp,"{\"address\":\"%s\",\"starttick\":%d,\"changes\":[",addr,starttick);
        sendmanytick = errflag = z = 0;
        while ( (c= fgetc(fp)) != EOF )
        {
            z++;
            if ( (c & 0xc) != 0 )
            {
                if ( fread(&((uint8_t *)&A)[32],1,sizeof(A)-32,fp) == sizeof(A)-32 )
                {
                    if ( A.nexttick <= prevA.nexttick || A.nexttick <= 1 )
                    {
                        //printf("skip backwards A %d vs %d\n",A.nexttick,prevA.nexttick);
                        continue;
                    }
                    counter++;
                    if ( firsttick == 0 || A.nexttick-1 >= starttick )
                        fprintf(outfp,"%s{\"tick\":%d,\"rank\":%d,\"balance\":\"%s\",\"in\":[%d,%d,\"%s\"],\"out\":[%d,%d,\"%s\"]",firsttick>0?",":"",A.nexttick-1,A.rank,amountstr(A.entity.incomingAmount-A.entity.outgoingAmount),A.entity.numberOfIncomingTransfers,A.entity.latestIncomingTransferTick,amountstr2(A.entity.incomingAmount),A.entity.numberOfOutgoingTransfers,A.entity.latestOutgoingTransferTick,amountstr3(A.entity.outgoingAmount));
                    if ( firsttick == 0 )
                    {
                        firsttick = A.nexttick - 1;
                        txs = address_txids(&n,(char *)addr,0);
                        for (i=0; i<n; i++)
                        {
                            //printf("%d ",txs[i].tx.tick);
                            //if ( i > 0 && txs[i].tx.tick < txs[i-1].tx.tick )
                            //    printf("%d of %d: nonmonotonic ticks %d %d\n",i,n,txs[i].tx.tick,txs[i-1].tx.tick);
                        }
                        //printf("ticks for %d txs\n",n);
                    }
                    if ( z > 0 )
                    {
                        groupsize = txs_findgroup(&groupstart,txs,n,counter==2?0:prevA.nexttick-1,A.nexttick-1);
                        insum = outsum = 0;
                        numin = numout = 0;
                        if ( A.nexttick-1 >= starttick )
                            fprintf(outfp,",\"txids\":[");
                        else continue;
                        for (i=0; i<groupsize; i++)
                        {
                            if ( i >= n || groupstart < 0 )
                                break;
                            tx = txs[groupstart + i].tx;
                            amount = tx.amount;
                            memset(txidstr,0,sizeof(txidstr));
                            sprintf(txidstr,"%s[%d,\"",i>0?",":"",tx.tick);
                            polarity = 1;
                            strcpy(other,"error");
                            if ( tx.inputType >= (QUTIL_CONTRACT_ID << 5) )
                            {
                                int err;
                                if ( (err= tickfindsender(tx.tick,tx.sourcePublicKey,txidstr+strlen(txidstr))) < 0 )
                                {
                                    char tmpstr[64];
                                    pubkey2addr(tx.sourcePublicKey,tmpstr);
                                    sprintf(txidstr+strlen(txidstr),"sender.%s tick.%d",tmpstr,tx.tick);
                                }
                                sprintf(txidstr+strlen(txidstr),".%d",tx.inputType & 0x1f);
                            }
                            else
                            {
                                digest2txid(txs[groupstart + i].txid,txidstr+strlen(txidstr));
                            }
                            if ( memcmp(pubkey,tx.sourcePublicKey,32) == 0 )
                            {
                                if ( tx.inputType >= (QUTIL_CONTRACT_ID << 5) )
                                {
                                    if ( sendmanytick != tx.tick )
                                    {
                                        sendmanytick = tx.tick;
                                        numout++;
                                        outsum += SENDMANYFEE;
                                    }
                                }
                                else numout++;
                                outsum += amount;
                                polarity = -1;
                                pubkey2addr(tx.destinationPublicKey,other);
                            }
                            else if ( memcmp(pubkey,tx.destinationPublicKey,32) == 0 )
                            {
                                if ( tx.inputType >= (QUTIL_CONTRACT_ID << 5) )
                                {
                                }
                                numin++;
                                insum += amount;
                                pubkey2addr(tx.sourcePublicKey,other);
                            }
                            else
                            {
                                //printf("ERROR %d of %d: pubkey does not match src or dest\n",i,n);
                            }
                            sprintf(txidstr+strlen(txidstr),"\",\"%s\",\"%s\"]",other,amountstr(amount * polarity));
                            if ( A.nexttick-1 >= starttick )
                                fprintf(outfp,"%s",txidstr);
                        }
                        fprintf(outfp,"],\"newin\":[%d,\"%s\"],\"newout\":[%d,\"%s\"]",numin,amountstr(insum),numout,amountstr2(outsum));
                        if ( numin == (A.entity.numberOfIncomingTransfers - prevA.entity.numberOfIncomingTransfers) &&
                            numout == (A.entity.numberOfOutgoingTransfers - prevA.entity.numberOfOutgoingTransfers) &&
                            insum == (A.entity.incomingAmount - prevA.entity.incomingAmount) &&
                            outsum == (A.entity.outgoingAmount - prevA.entity.outgoingAmount) )
                        {
                             sprintf(status,"reconciled txs %d to %d",groupstart,groupstart+groupsize-1);
                        }
                        else
                        {
                            status[0] = 0;
                            if ( A.nexttick < 11950000 )
                                sprintf(status+strlen(status),"Pre-quorum approved archive: missing data possible. ");
                            if ( numin != (A.entity.numberOfIncomingTransfers - prevA.entity.numberOfIncomingTransfers) ||
                                insum != (A.entity.incomingAmount - prevA.entity.incomingAmount) )
                            {
                                if ( insum == (A.entity.incomingAmount - prevA.entity.incomingAmount) )
                                    sprintf(status+strlen(status),"Harmless mismatch of numin tx due to 0 val tx. ");
                                else if ( numin == 1 && (A.entity.incomingAmount - prevA.entity.incomingAmount) == 0 )
                                {
                                    char hexstr[64];
                                    hexstr[0] = 0;
                                    digest2txid(txs[groupstart].txid,hexstr);
                                    sprintf(status+strlen(status),"Failed tx.%d %s ",groupstart,hexstr);
                                }
                                else errflag++;
                                sprintf(status+strlen(status),"input mismatch TX %d %ld vs BAL %d %s ",numin,insum,A.entity.numberOfIncomingTransfers - prevA.entity.numberOfIncomingTransfers,amountstr(A.entity.incomingAmount - prevA.entity.incomingAmount));
                            }
                            if ( numout != (A.entity.numberOfOutgoingTransfers - prevA.entity.numberOfOutgoingTransfers) || outsum != (A.entity.outgoingAmount - prevA.entity.outgoingAmount) )
                            {
                                if ( outsum == (A.entity.outgoingAmount - prevA.entity.outgoingAmount) )
                                    sprintf(status+strlen(status),"Harmless mismatch of numout ts due to 0 val tx. ");
                                else if ( numout == 1 && (A.entity.outgoingAmount - prevA.entity.outgoingAmount) == 0 )
                                {
                                    char hexstr[64];
                                    hexstr[0] = 0;
                                    digest2txid(txs[groupstart].txid,hexstr);
                                    sprintf(status+strlen(status),"Failed tx.%d %s ",groupstart,hexstr);
                                }
                                else errflag++;
                                sprintf(status+strlen(status),"output mismatch TX %d %ld vs BAL %d %s",numout,outsum,A.entity.numberOfOutgoingTransfers - prevA.entity.numberOfOutgoingTransfers,amountstr(A.entity.outgoingAmount - prevA.entity.outgoingAmount));
                            }
                        }
                        //if ( errflag != 0 )
                        //    printf("%s\n",status);
                        fprintf(outfp,",\"status\":\"%s\"",status);
                    }
                    fprintf(outfp,"}");
                }
                else
                {
                    //printf("error reading A at %ld\n",ftell(fp));
                    break;
                }
            }
            else
            {
                if ( fread(&tick,1,sizeof(tick),fp) != sizeof(tick) || fread(&rank,1,sizeof(rank),fp) != sizeof(rank) )
                {
                    //printf("error reading tick+rank at %ld\n",ftell(fp));
                    break;
                }
                A.nexttick = tick;
                if ( rank > 0 )
                    A.rank = rank;
                //printf("updated tick.%d balance %lld rank.%d\n",A.nexttick-1,(A.entity.incomingAmount-A.entity.outgoingAmount),A.rank);
            }
            prevA = A;
        }
        fclose(fp);
        if ( txs != 0 )
            free(txs);
        fprintf(outfp,"]}\n");
    }
    else
    {
        historyjson(addr,outfp,starttick);
    }
    return(errflag);
}

void tokenlist()
{
    FILE *fp;
    char line[512],fname[512];
    memset(line,0,sizeof(line));
    sprintf(fname,"%s%ctokenlist",DATADIR,dir_delim());
    if ( (fp= fopen(fname,"r")) != 0 )
    {
        fread(line,1,sizeof(line),fp);
        fclose(fp);
        printf("%s\n",line);
    } else printf("{\"error\":\"tokenlist not found\"}\n");
}

void tokenissuer(char *name)
{
    FILE *fp;
    int32_t len,scind,flag = 0;
    char line[512],addr[64],fname[512];
    uint8_t pubkey[32];
    memset(line,0,sizeof(line));
    sprintf(fname,"%s%ctokenissuer",DATADIR,dir_delim());
    if ( (fp= fopen(fname,"r")) != 0 )
    {
        while ( fgets(line,sizeof(line)-1,fp) != 0 )
        {
            len = strlen(line);
            if ( line[len-1] == '\n' )
                line[--len] = 0;
            if ( strncmp(name,line,strlen(name)) == 0 && line[strlen(name)] == ' ' )
            {
                scind = atoi(line + strlen(name)+1);
                if ( scind >= 1 && scind < 5 )
                    printf("{\"issuer\":\"QubicSmartContract\",\"contractid\":\"%d\"}\n",scind);
                else
                {
                    hexToByte(line + strlen(name)+1,pubkey,32);
                    pubkey2addr(pubkey,addr);
                    printf("{\"issuer\":\"%s\",\"address\":\"%s\"}\n",line + strlen(name)+1,addr);
                }
                flag = 1;
                break;
            }
        }
        fclose(fp);
        if ( flag == 0 )
            printf("{\"error\":\"token %s not found\"}\n",name);
    } else printf("{\"error\":\"tokenissuer not found\"}\n");
}

void orders(char *name)
{
    FILE *fp;
    int32_t len,scind,flag = 0;
    char line[65536],addr[64],fname[512];
    uint8_t pubkey[32];
    memset(line,0,sizeof(line));
    sprintf(fname,"%s%corders%c%s",DATADIR,dir_delim(),dir_delim(),name);
    if ( (fp= fopen(fname,"r")) != 0 )
    {
        fread(line,1,sizeof(line),fp);
        fclose(fp);
        printf("%s\n",line);
    } else printf("{\"error\":\"orders not found for %s\"}\n",fname);
}

void myorders()
{
    FILE *fp;
    char line[65536],fname[512];
    sprintf(fname,"%s%corders%c%s",DATADIR,dir_delim(),dir_delim(),Firstaddr);
    if ( (fp= fopen(fname,"r")) != 0 )
    {
        fread(line,1,sizeof(line),fp);
        fclose(fp);
        printf("%s\n",line);
    } else printf("{\"error\":\"orders not found for %s\"}\n",Firstaddr);
}

void *toQwallet(void *ignore)
{
    int64_t prevBalances[MAX_INDEX],prevBalance;
    int32_t i,prevhavetx = 0;
    uint8_t txdata[MAX_TX_SIZE];
    char addr[64],jsonstr[4096];
    prevBalance = 0;
    memset(prevBalances,0,sizeof(prevBalances));
    while ( 1 )
    {
        if ( update_latest() != 0 )
        {
            update_subs(Subscriber);
            pthread_mutex_lock(&command_mutex);
            latestjson(Subscriber);
            if ( Subscriber != 0 )
            {
                if ( memcmp(prevBalances,Subsbalances,sizeof(prevBalances)) != 0 )
                {
                    for (i=0; i<MAX_INDEX; i++)
                    {
                        if ( prevBalances[i] != Subsbalances[i] )
                        {
                            pubkey2addr(Subpubs[i],addr);
                            addressdata(Subscriber,addr,"");
                        }
                    }
                    subsbalancesjson();
                    memcpy(prevBalances,Subsbalances,sizeof(prevBalances));
                }
                if ( PENDINGTXADDR[0] != 0 && HAVE_TXTICK < PENDINGTXTICK+10 )
                    addressdata(-1,PENDINGTXADDR,"");
            }
            else
            {
                if ( prevBalance != Firstbalance )
                {
                    addressdata(0,Firstaddr,"");
                    prevBalance = Firstbalance;
                }
            }
            if ( HAVE_TXTICK > prevhavetx )
            {
                if ( PENDINGTXTICK != 0 && HAVE_TXTICK > PENDINGTXTICK && PENDINGTXID[0] != 0 )
                {
                    txjson(jsonstr,PENDINGTXID,txdata,tickfindtxid(PENDINGTXTICK,PENDINGTXID,txdata),1);
                    printf("%s\n",jsonstr);
                    addressdata(-1,PENDINGTXADDR,"");
                    //PENDINGTXTICK = 0;
                    memset(PENDINGTXID,0,sizeof(PENDINGTXID));
                }
                prevhavetx = HAVE_TXTICK;
            }
            pthread_mutex_unlock(&command_mutex);
        }
        usleep(100000);
    }
    return(0);
}

void richlist(char *line)
{
    FILE *fp;
    int64_t prevbalance,total = 0;
    int32_t lastB,i = 0,starti = 0,num = 0;
    char addr[64],name[64],fname[512];
    struct richlist_entry R;
    name[0] = 0;
    if ( line[0] == '.' )
    {
        line++;
        sscanf(line,"%s %d %d",name,&starti,&num);
        line += strlen(name);
        sprintf(fname,"%s%crichlist.%s",DATADIR,dir_delim(),name);
    }
    else
    {
        sscanf(line,"%d %d",&starti,&num);
        sprintf(fname,"%s%crichlist",DATADIR,dir_delim());
    }
    if ( starti <= 0 )
        starti = 1;
    if ( num <= 0 )
        num = 128;
    lastB = prevbalance = 0;
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        while ( 1 )
        {
            if ( fread(&R,1,sizeof(R),fp) != sizeof(R) )
                break;
            pubkey2addr(R.pubkey,addr);
            if ( prevbalance >= 1000000000 && R.balance < 1000000000 )
                lastB = i;
            prevbalance = R.balance;
            if ( i+1 >= starti && i+1 < starti+num )
            {
                printf("%-3d  %s %s\n",i+1,addr,amountstr(R.balance));
                total += R.balance;
            }
            i++;
        }
        fclose(fp);
    }
    printf("richlist start.%d num.%d balances %s, allentities.%d, lastbillion %d\n",starti,num,amountstr(total),i,lastB);
}

void history(char *line)
{
    FILE *outfp;
    char fname[512],jsonstr[512];
    int32_t starttick;
    uint8_t pubkey[32];
    char *historydir = (char *)"/var/www/html/history";
    if ( line[0] == '2' )
    {
        if ( line[1] == ' ' )
        {
            sprintf(fname,"%s/%s",historydir,line+2);
            if ( (outfp= fopen(fname,"w")) == 0 )
            {
                printf("{\"error\":\"history2 could not create http history file\"}\n");
                return;
            }
        }
        else
        {
            printf("{\"error\":\"usage: history2 <address>\"}\n");
            return;
        }
        line++;
    } else outfp = stdout;
    if ( line[0] == ' ' && addr2pubkey(line+1,pubkey) > 0 )
    {
        starttick = atoi(line+1+60);
        line[61] = 0;
        balance_history(line+1,outfp,starttick);
    }
    else printf("{\"error\":\"bad history address (%s)\"}\n",line+1);
    if ( outfp != stdout )
    {
        sprintf(jsonstr,"{\"result\":\"created http history file\",\"url\":\"qsilver.org/history/%s\"}",line+1);
        printf("%s\n",jsonstr);
        fclose(outfp);
    }
}

int main()
{
    pthread_t toQwallet_thread;
    struct quheader H;
    Transaction tx;
    uint8_t pubkey[32],txdata[MAX_TX_SIZE],zero[32],digest[32];
    char *line,_line[4096],txid[64],first60[61],addr[64],jsonstr[4096],tag[512];
    int i,offset,index,type,len,txlen,tick;
    pthread_mutex_init(&command_mutex,NULL);
    memset(zero,0,sizeof(zero));
    setbuf(stdout,NULL);
    update_latest();
    while ( 1 )
    {
        usleep(10000);
        line = _line;
        memset(tag,0,sizeof(tag));
        if ( fgets(_line,sizeof(_line)-1,stdin) != 0 )
        {
            pthread_mutex_lock(&command_mutex);
            if ( _line[0] == '#' )
            {
                for (i=0; i<sizeof(tag)-1; i++)
                {
                    if ( line[i] == ' ' )
                        break;
                    tag[i] = line[i];
                }
                tag[i] = 0;
                line += (i + 1);
                printf("%s ",tag);
            }
            len = strlen(line);
            if ( line[len-1] == '\n' )
                line[--len] = 0;
            memcpy(first60,line,60);
            first60[60] = 0;
            if ( strcmp(line,(char *)"help") == 0 )
                helplines();
            else if ( strncmp(line,(char *)"history",strlen((char *)"history")) == 0 )
            {
                history(line + strlen((char *)"history"));
            }
            else if ( strncmp(line,(char *)"richlist",strlen((char *)"richlist")) == 0 )
            {
                richlist(line + strlen((char *)"richlist"));
            }
            else if ( strcmp(line,(char *)"tokenlist") == 0 )
            {
                tokenlist();
            }
            else if ( strcmp(line,(char *)"balances") == 0 )
            {
                if ( Subscriber != 0 )
                    subsbalancesjson();
                else printf("{\"error\":\"must have subscription to get balances\"}\n");
            }
            else if ( strcmp(line,(char *)"myorders") == 0 )
            {
                myorders();
            }
            else if ( strncmp(line,(char *)"tokenissuer ",strlen("tokenissuer ")) == 0 )
            {
                tokenissuer(line + strlen("tokenissuer "));
            }
            else if ( strncmp(line,(char *)"orders ",strlen("orders ")) == 0 )
            {
                orders(line + strlen("orders "));
            }
            else if ( strncmp(line,(char *)"list",4) == 0 )
            {
                if ( Subscriber != 0 )
                    subsjson(Firstaddr,line + 4);
                else printf("{\"error\":\"must have subscription to get list\"}\n");
            }
            else if ( strcmp(line,(char *)"clearderived") == 0 )
            {
                if ( Subscriber != 0 )
                {
                    for (index=1; index<MAX_INDEX; index++)
                        Numaddrs = Qclientsubs(&Subshash,Subpubs,Firstaddr,index,zero);
                    subsjson(Firstaddr,"");
                }
                else printf("{\"error\":\"must have subscription to clearderived\"}\n");
            }
            else if ( istxid(first60) == 1 )
            {
                //if ( Subscriber != 0 )
                {
                    int32_t txlen;
                    if ( (tick= atoi(line+61)) == 0 )
                        tick = scanfortxid(line);
                    txlen = tickfindtxid(tick,line,txdata);
                    txjson(jsonstr,txid,txdata,txlen,1);
                    printf("%s\n",jsonstr);
                }
                //else printf("{\"error\":\"must have subscription to get txid data\"}\n");
            }
            else if ( ishexstr(line) == 1 )
            {
                if ( (txlen= validaterawhex(line,&txdata[sizeof(H)],txid)) >= sizeof(Transaction) )
                {
                    memcpy(&tx,&txdata[sizeof(H)],sizeof(tx));
                    if ( islogintx(&tx) == 1 )
                    {
                        if ( memcmp(Firstpub,tx.sourcePublicKey,sizeof(Firstpub)) == 0 )
                        {
                            Subscriber = 1;
                            pubkey2addr(Firstpub,Firstaddr);
                            Numaddrs = calc_subshash(&Subshash,Subpubs,Firstaddr);
                            loginjson();
                        } else printf("{\"error\":\"logintx mismatch\"}\n");
                    }
                    else
                    {
                        KangarooTwelve(&txdata[sizeof(H)],txlen,digest,32);
                        digest2txid(digest,PENDINGTXID);
                        pubkey2addr(tx.sourcePublicKey,addr);
                        strcpy(PENDINGTXADDR,addr);
                        addressdata(-1,addr,PENDINGTXID);
                        PENDINGTXTICK = tx.tick;
                        //printf("got %s %s broadcast txtick.%d\n",addr,PENDINGTXID,tx.tick);
                        H = quheaderset(BROADCAST_TRANSACTION,sizeof(H) + txlen);
                        memcpy(txdata,&H,sizeof(H));
                        byteToHex(txdata,line,sizeof(H) + txlen);
                        Qserver_msg(line);
                    }
                }
                else
                {
                    tick = atoi(line);
                    //if ( Subscriber > 0 )
                        ticksummary(tick);
                }
            }
            else
            {
                offset = index = type = 0;
                if ( line[0] == '+' )
                    type = 1;
                else if ( line[0] == '-' )
                    type = -1;
                if ( type != 0 )
                {
                    index = atoi(line+1);
                    for (offset=1; line[offset]!=' '; offset++)
                        if ( offset > 5 )
                            break;
                    if ( index <= 0 || index >= MAX_INDEX || line[offset] != ' ' )
                    {
                        printf("{\"error\":\"type.%d error.(%s)\"}\n",type,line);
                        pthread_mutex_unlock(&command_mutex);
                        continue;
                    }
                    offset++;
                }
                if ( addr2pubkey(line+offset,pubkey) > 0 )
                {
                    //printf("type.%d index.%d %s existing.(%s) subscriber.%d addrshash.%x numaddrs.%d\n",type,index,line+offset,Firstaddr,Subscriber,Subshash,Numaddrs);
                    if ( Firstaddr[0] == 0 )
                    {
                        strcpy(Firstaddr,line+offset);
                        memcpy(Firstpub,pubkey,32);
                        Numaddrs = calc_subshash(&Subshash,Subpubs,Firstaddr);
                        update_subs(Subscriber);
                        pthread_create(&toQwallet_thread,NULL,&toQwallet,0);
                    }
                    if ( type != 0 )
                    {
                        if ( Subscriber == 0 )
                            printf("{\"error\":\"must be subscriber to get more than one address\"}\n");
                        else
                        {
                            Numaddrs = calc_subshash(&Subshash,Subpubs,Firstaddr);
                            if ( type < 0 )
                            {
                                if ( memcmp(pubkey,Subpubs[index],32) != 0 )
                                    printf("{\"error\":\"-index.%d %s does not match existing address\"}\n",index,line+offset);
                                else
                                {
                                    Numaddrs = Qclientsubs(&Subshash,Subpubs,Firstaddr,index,zero);
                                    loginjson();
                                }
                            }
                            else //if ( type > 0 )
                            {
                                if ( memcmp(zero,Subpubs[index],32) != 0 )
                                    printf("{\"error\":\"+index.%d %s does not have empty slot\"}\n",index,line+offset);
                                else
                                {
                                    Numaddrs = Qclientsubs(&Subshash,Subpubs,Firstaddr,index,pubkey);
                                    loginjson();
                                }
                            }
                        }
                    }
                    else
                    {
                        if ( Subscriber == 0 )
                        {
                            //if ( strcmp(line+offset,Firstaddr) == 0 )
                            {
                                Qserver_msg(line+offset);
                                addressdata(Subscriber,line+offset,"");
                            }
                            //else printf("{\"error\":\"need to be subscriber to query different address %s\"}\n",line+offset);
                        }
                        else
                        {
                            Qserver_msg(line+offset);
                            addressdata(Subscriber,line+offset,"");
                        }
                    }
                } else printf("{\"error\":\"error with.(%s)\"}\n",line);
            }
            pthread_mutex_unlock(&command_mutex);
        }
    }
    return(0);
}

// orderbooks!
// remote file access
