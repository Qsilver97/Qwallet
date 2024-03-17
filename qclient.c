

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
 
    logintx hex         -> creates subscription from wasm logintx hex value, call after starting websockets with <address>
    broadcasttx         -> broadcasts tx to network
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

int32_t Subscriber,Numaddrs,Broadcasttxtick,Histogram[4];
char Firstaddr[64];
uint8_t Subpubs[MAX_INDEX][32];
uint32_t Subshash,Firstutime;
int64_t Subsbalances[MAX_INDEX],Firstbalance;
struct addrhash Subsdata[MAX_INDEX][2],Firstdata[2];

// wasm:1 json needs to also have command field

int32_t Qserver_msg(char *msg)
{
    int fd,len;
    char buf[8192];
    len = strlen(msg);
    strncpy(buf,msg,sizeof(buf)-1);
    if ( buf[len - 1] != '\n' )
        buf[len++] = '\n';
    buf[len] = 0;
    fd = open("Qserver", O_WRONLY);
    if ( fd > 0 )
    {
        write(fd,buf,len);
        close(fd);
        return(0);
    } else return(-1);
}

void loginjson(void)
{
    printf("{\"numaddrs\":%d,\"subshash\":\"%x\",\"subscriber\":\"%s\"}\n",Numaddrs,Subshash,Firstaddr);
}

void latestjson(int32_t subscriber)
{
    if ( subscriber == 0 )
        printf("{\"tick\":%d,\"wasm\":1,\"command\":\"CurrentTickInfo\"}\n",LATEST_TICK);
    else
        printf("{\"tick\":%d,\"validated\":%d,\"havetx\":%d,\"numaddrs\":%d,\"subshash\":\"%x\",\"wasm\":1,\"command\":\"CurrentTickInfo\"}\n",LATEST_TICK,VALIDATED_TICK,HAVE_TXTICK,Numaddrs,Subshash);
}

void qchainjson(int32_t tick,uint8_t spectrum[32],uint8_t qchain[32])
{
    char spectrumstr[65],qchainstr[65];
    byteToHex(spectrum,spectrumstr,32);
    byteToHex(qchain,qchainstr,32);
    printf("{\"tick\":%d,\"spectrum\":\"%s\",\"qchain\":\"%s\"}\n",tick,spectrumstr,qchainstr);
}

void txjson(char *txidstr,uint8_t txdata[MAX_INPUT_SIZE*2],int32_t txlen)
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
    printf("{\"txid\":\"%s\",\"tick\":%d,\"included\":%d,\"src\":\"%s\",\"dest\":\"%s\",\"amount\":\"%s\",\"type\":%d,\"extralen\":%d,\"extra\":\"%s\",\"command\":\"txidrequest\",\"wasm\":1}\n",txidstr,tx.tick,txlen>0,srcstr,deststr,amountstr(tx.amount),tx.inputType,tx.inputSize,extrastr);
}

void entityjson(char *addr,struct Entity E,int32_t tick,int32_t stick,uint8_t merkle[32],int64_t sent,int64_t recv)
{
    char merklestr[65];
    byteToHex(merkle,merklestr,32);
    printf("{\"histo\":[%d,%d,%d,%d],\"address\":\"%s\",\"balance\":\"%s\",\"sent\":\"%s\",\"received\":\"%s\",\"tick\":%d,\"stick\":%d,\"spectrum\":\"%s\",\"numin\":%d,\"totalincoming\":\"%s\",\"latestin\":%d,\"numout\":%d,\"totaloutgoing\":\"%s\",\"latestout\":%d,\"command\":\"EntityInfo\",\"wasm\":1}\n",Histogram[0],Histogram[1],Histogram[2],Histogram[3],addr,amountstr(E.incomingAmount - E.outgoingAmount),amountstr2(sent),amountstr3(recv),tick,stick,merklestr,E.numberOfIncomingTransfers,amountstr4(E.incomingAmount),E.latestIncomingTransferTick,E.numberOfOutgoingTransfers,amountstr5(E.outgoingAmount),E.latestOutgoingTransferTick);
}

void addrhashjson(char *addr,struct addrhash data[2])
{
    struct addrhash *ap;
    if ( data[1].flushtick == 0 )
        ap = &data[0];
    else ap = &data[1];
    entityjson(addr,ap->entity,ap->tick,ap->flushtick,ap->merkleroot,0,0);
}

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
    sprintf(fname,"subs%c%s",dir_delim(),subaddr);
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

void subsjson(char *subaddr)
{
    int32_t i;
    int64_t total = 0;
    uint8_t zero[32];
    char addr[64];
    memset(zero,0,sizeof(zero));
    Numaddrs = Qclientsubs(&Subshash,Subpubs,Firstaddr,-1,0);
    for (i=0; i<MAX_INDEX; i++)
        total += Subsbalances[i];
    printf("{\"numaddrs\":%d,\"subshash\":\"%x\",\"total\":\"%s\",\"addresses\":[",Numaddrs,Subshash,amountstr(total));
    for (i=0; i<MAX_INDEX; i++)
    {
        if ( memcmp(zero,Subpubs[i],32) != 0 )
        {
            pubkey2addr(Subpubs[i],addr);
            printf("%s[%d, \"%s\", \"%s\"]",i>0?",":"",i,addr,amountstr(Subsbalances[i]));
        }
    }
    printf("]}\n");
}

void subsbalancesjson(void)
{
    int32_t i;
    uint8_t zero[32];
    int64_t total = 0;
    memset(zero,0,sizeof(zero));
    for (i=0; i<MAX_INDEX; i++)
        total += Subsbalances[i];
    printf("{\"numaddrs\":%d,\"subshash\":\"%x\",\"total\":\"%s\",\"balances\":[",Numaddrs,Subshash,amountstr(total));
    for (i=0; i<MAX_INDEX; i++)
    {
        if ( memcmp(zero,Subpubs[i],32) != 0 )
            printf("%s[%d, \"%s\"]",i>0?",":"",i,amountstr(Subsbalances[i]));
    }
    printf("]}\n");
}

int32_t spectrumtick(int32_t tick,uint8_t refspectrum[32])
{
    char fname[512];
    FILE *fp;
    long offset;
    int32_t i,stick = 0;
    uint8_t spectrum[32];
    if ( tick-1 >= INITIAL_TICK && tick < INITIAL_TICK+MAXTICKS )
    {
        sprintf(fname,"epochs%c%d%cqchain",dir_delim(),EPOCH,dir_delim());
        offset = (tick-1) - INITIAL_TICK;
        if ( (fp= fopen(fname,"rb")) != 0 )
        {
            for (i=0; i<4; i++)
            {
                fseek(fp,offset * 32 * 2,SEEK_SET);
                fread(spectrum,1,32,fp);
                if ( memcmp(spectrum,refspectrum,32) == 0 )
                {
                    Histogram[i]++;
                    stick = offset + INITIAL_TICK;
                }
                offset++;
            }
            fclose(fp);
        }
    }
    return(stick);
}

int64_t addrhashdata(char *addr,struct addrhash data[2])
{
    FILE *fp;
    char fname[512];
    long fpos,newpos;
    struct addrhash A;
    int32_t incrsize,stick;
    int64_t balance = 0;
    memset(&A,0,sizeof(A));
    sprintf(fname,"addrs%c%s",dir_delim(),addr);
    memset(data,0,sizeof(*data)*2);
    incrsize = (int32_t)(sizeof(data[0].entity) + 40);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        fseek(fp,0,SEEK_END);
        fpos = ftell(fp);
        newpos = fpos - (incrsize*5);
        if ( newpos < 0 )
            newpos = 0;
        fseek(fp,newpos,SEEK_SET);
        while ( ftell(fp) < fpos )
        {
            if ( fread(&A,1,incrsize,fp) == incrsize )
            {
                if ( A.tick != 0 )
                {
                    stick = spectrumtick(A.tick,A.merkleroot);
                    if ( A.tick > data[1].tick || stick > data[1].flushtick )
                    {
                        A.flushtick = stick; // repurpose to cache spectrumtick
                        if ( stick != 0 )
                            memcpy(&data[0],&A,sizeof(A));
                        memcpy(&data[1],&A,sizeof(A));
                        balance = (A.entity.incomingAmount - A.entity.outgoingAmount);
                        //printf("tick.%d stick.%d balance %s\n",A.tick,stick,amountstr(balance));
                    }
                }
            }
        }
        fclose(fp);
    }

    return(balance);
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
        if ( utime > Firstutime+30 )
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

void addressdata(int32_t subscriber,char *addr)
{
    int32_t i;
    struct addrhash data[2];
    uint8_t zero[32],pubkey[32];
    if ( subscriber == 0 )
    {
        if ( strcmp(addr,Firstaddr) == 0 )
            addrhashjson(addr,Firstdata);
    }
    else
    {
        addr2pubkey(addr,pubkey);
        for (i=0; i<MAX_INDEX; i++)
        {
            if ( memcmp(pubkey,Subpubs[i],32) == 0 )
            {
                addrhashjson(addr,Subsdata[i]);
                return;
            }
        }
        if ( addrhashdata(addr,data) != 0 )
        {
            addrhashjson(addr,data);
            return;
        }
        printf("{\"error\":\"no data for %s\"}\n",addr);
    }
}

void *toQwallet(void *)
{
    int64_t prevBalances[MAX_INDEX];
    memset(prevBalances,0,sizeof(prevBalances));
    while ( 1 )
    {
        if ( update_latest() != 0 )
        {
            latestjson(Subscriber);
            update_subs(Subscriber);
            if ( Subscriber != 0 )
            {
                if ( memcmp(prevBalances,Subsbalances,sizeof(prevBalances)) != 0 )
                {
                    subsbalancesjson();
                    memcpy(prevBalances,Subsbalances,sizeof(prevBalances));
                }
            }
        }
        usleep(100000);
    }
    return(0);
}

int32_t islogintx(Transaction *tx)
{
    if ( memcmp(tx->sourcePublicKey,tx->destinationPublicKey,32) == 0 )
        return(1);
    else return(0);
}

int32_t tickfindtxid(int32_t tick,char txidstr[32],uint8_t txdata[MAX_INPUT_SIZE*2])
{
    FILE *fp;
    char fname[512];
    TickData TD;
    Transaction T;
    int32_t i,j,txlen=0,n=0;
    uint8_t zero[32],txid[32],tmptxid[32];
    txid2digest(txidstr,txid);
    sprintf(fname,"epochs%c%d%c%d",dir_delim(),EPOCH,dir_delim(),tick);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        fread(&TD,1,sizeof(TD),fp);
        fclose(fp);
        memset(zero,0,sizeof(zero));
        for (i=0; i<NUMBER_OF_TRANSACTIONS_PER_TICK; i++)
        {
            if ( memcmp(TD.transactionDigests[i],zero,sizeof(zero)) == 0 )
                break;
            n++;
            if ( memcmp(TD.transactionDigests[i],txid,sizeof(txid)) == 0 )
            {
                sprintf(fname,"epochs%c%d%c%d.T",dir_delim(),EPOCH,dir_delim(),tick);
                if ( (fp= fopen(fname,"rb")) != 0 )
                {
                    for (j=0; j<n; j++)
                    {
                        if ( fread(&txlen,1,sizeof(txlen),fp) != sizeof(txlen) || txlen < sizeof(T) || txlen > sizeof(T)+MAX_INPUT_SIZE+SIGNATURE_SIZE )
                            break;
                        if ( fread(tmptxid,1,sizeof(tmptxid),fp) != sizeof(tmptxid) )
                            break;
                        if ( fread(txdata,1,txlen,fp) != txlen )
                            break;
                    }
                    fclose(fp);
                    if ( j != n || memcmp(tmptxid,txid,32) != 0 )
                    {
                        printf("j.%d != n.%d\n",j,n);
                        txlen = 1;
                    }
                } else txlen = 1;
                printf("tick %d has %d tx\n",tick,n);
                return(txlen);
            }
        }
    }
    return(0);
}

void ticksummary(int32_t tick)
{
    FILE *fp;
    long offset;
    char fname[512];
    uint8_t spectrum[32],qchain[32];
    if ( tick >= INITIAL_TICK && tick < INITIAL_TICK+MAXTICKS )
    {
        offset = tick - INITIAL_TICK;
        sprintf(fname,"epochs%c%d%cqchain",dir_delim(),EPOCH,dir_delim());
        memset(spectrum,0,sizeof(spectrum));
        memset(qchain,0,sizeof(qchain));
        if ( (fp= fopen(fname,"rb")) != 0 )
        {
            fseek(fp,offset * 32 * 2,SEEK_SET);
            fread(spectrum,1,32,fp);
            fread(qchain,1,32,fp);
            fclose(fp);
        }
        qchainjson(tick,spectrum,qchain);
    }
    else printf("{\"error\":\"tick.%d outside of epoch\"}\n",tick);
}

int main()
{
    pthread_t toQwallet_thread;
    struct quheader H;
    Transaction tx;
    uint8_t pubkey[32],txdata[MAX_INPUT_SIZE*2 + sizeof(H)],firstpub[32],zero[32];
    char line[4096],txid[64],first60[61];
    int offset,index,type,len,txlen,tick;
    memset(zero,0,sizeof(zero));
    setbuf(stdout,NULL);
    while ( 1 )
    {
        if ( fgets(line,sizeof(line)-1,stdin) != 0 )
        {
            len = strlen(line);
            if ( line[len-1] == '\n' )
                line[--len] = 0;
            memcpy(first60,line,60);
            first60[60] = 0;
            if ( strcmp(line,(char *)"list") == 0 )
            {
                if ( Subscriber != 0 )
                    subsjson(Firstaddr);
                else printf("{\"error\":\"must have subscription to get list\"}\n");
            }
            else if ( strcmp(line,(char *)"clearderived") == 0 )
            {
                if ( Subscriber != 0 )
                {
                    for (index=1; index<MAX_INDEX; index++)
                        Numaddrs = Qclientsubs(&Subshash,Subpubs,Firstaddr,index,zero);
                    subsjson(Firstaddr);
                }
                else printf("{\"error\":\"must have subscription to clearderived\"}\n");
            }
            else if ( istxid(first60) == 1 )
            {
                if ( Subscriber != 0 )
                {
                    if ( (tick= atoi(line+61)) == 0 )
                        tick = Broadcasttxtick;
                    txjson(txid,txdata,tickfindtxid(tick,line,txdata));
                }
                else printf("{\"error\":\"must have subscription to get txid data\"}\n");
            }
            else if ( ishexstr(line) == 1 )
            {
                if ( (txlen= validaterawhex(line,&txdata[sizeof(H)],txid)) >= sizeof(Transaction) )
                {
                    memcpy(&tx,&txdata[sizeof(H)],sizeof(tx));
                    if ( islogintx(&tx) == 1 )
                    {
                        if ( memcmp(firstpub,tx.sourcePublicKey,sizeof(firstpub)) == 0 )
                        {
                            Subscriber = 1;
                            Numaddrs = Qclientsubs(&Subshash,Subpubs,Firstaddr,-1,0);
                            loginjson();
                        } else printf("{\"error\":\"logintx mismatch\"}\n");
                    }
                    else
                    {
                        printf("got tx to broadcast txtick.%d\n",tx.tick);
                        Broadcasttxtick = tx.tick;
                        H = quheaderset(BROADCAST_TRANSACTION,sizeof(H) + txlen);
                        memcpy(txdata,&H,sizeof(H));
                        byteToHex(txdata,line,sizeof(H) + txlen);
                        Qserver_msg(line);
                    }
                }
                else
                {
                    tick = atoi(line);
                    if ( Subscriber > 0 )
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
                        memcpy(firstpub,pubkey,32);
                        Numaddrs = Qclientsubs(&Subshash,Subpubs,Firstaddr,-1,0);
                        pthread_create(&toQwallet_thread,NULL,&toQwallet,0);
                    }
                    if ( type != 0 )
                    {
                        if ( Subscriber == 0 )
                            printf("{\"error\":\"must be subscriber to get more than one address\"}\n");
                        else
                        {
                            Numaddrs = Qclientsubs(&Subshash,Subpubs,Firstaddr,-1,0);
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
                            if ( strcmp(line+offset,Firstaddr) == 0 )
                                addressdata(Subscriber,line+offset);
                            else printf("{\"error\":\"need to be subscriber to query different address %s\"}\n",line+offset);
                        }
                        else
                        {
                            Qserver_msg(line+offset);
                            addressdata(Subscriber,line+offset);
                        }
                    }
                } else printf("{\"error\":\"error with.(%s)\"}\n",line);
            }
        }
    }
    return(0);
}
