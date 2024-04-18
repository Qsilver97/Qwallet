    

#define TESTNET
#define QSERVER
// https://www.tecmint.com/increase-set-open-file-limits-in-linux/#:~:text=You%20can%20increase%20the%20limit,configure%20kernel%20parameters%20at%20runtime.
// https://unix.stackexchange.com/questions/307046/real-time-file-synchronization
// https://github.com/lsyncd/lsyncd/issues/394
// set timezone! timedatectl set-timezone UTC

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdarg.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <pthread.h>
#include <signal.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include "utlist.h"

#ifdef __APPLE__
#include "../qshared/K12AndKeyUtil.h"
#include "../qshared/qdefines.h"
#include "../qshared/qstructs.h"
#include "../qshared/qexterns.h"
#include "../qshared/qkeys.c"
#include "../qshared/qhelpers.c"
#include "../qshared/qtime.c"
#include "../qshared/json.h"
#include "../qshared/json.c"
#include "../qshared/qtx.c"
#else
#include "qshared/K12AndKeyUtil.h"
#include "qshared/qdefines.h"
#include "qshared/qstructs.h"
#include "qshared/qexterns.h"
#include "qshared/qkeys.c"
#include "qshared/qhelpers.c"
#include "qshared/qtime.c"
#include "qshared/json.h"
#include "qshared/json.c"
#include "qshared/qtx.c"
#endif

#define VIP_TOKENLEVEL 350000000
#define RICHLIST_THRESHOLD 1

struct addrhash *Addresses;
struct univhash *Universe;
pthread_mutex_t qpubreq_mutex,qentity_mutex,sandwich_mutex;
struct qpubreq *REQS;
struct sandwich *SANDWICHQ;
int32_t Totalreqs,Totaladdress,Totaluniv,Numassets,Totalsandwiches,Sandwicherror,Sandwichgood,Sandwichbeforesum,Sandwichaftersum;
int64_t SPECTRUM_SUPPLY;

struct qentity
{
    struct qentity *prev,*next;
    uint8_t merkleroot[32];
    struct Entity E;
    int32_t tick;
} *ENTITYQ;

struct assetname
{
    char name[8];
    int64_t supply;
    int32_t index,extra;
} *Assetnames;

#ifdef __APPLE__
#include "../qshared/qconn.c"
#else
#include "qshared/qconn.c"
#endif
#include "qx.c"
#include "qmutex.c"
#include "qpeers.c"
#include "qhtml.c"

struct addrhash *Addresshash(uint8_t pubkey[32],int32_t createflag) // only create from single thread to avoid needing mutex
{
    uint64_t hashi;
    int32_t i;
    uint8_t zero[32];
    struct addrhash *ap;
    hashi = addrhashi(pubkey);
    memset(zero,0,sizeof(zero));
    for (i=0; i<MAXADDRESSES; i++)
    {
        ap = &Addresses[(hashi + i) % MAXADDRESSES];
        if ( memcmp(ap->entity.publicKey,pubkey,32) == 0 )
            return(ap);
        if ( memcmp(ap->entity.publicKey,zero,32) == 0 )
        {
            if ( createflag != 0 )
            {
                memset(ap,0,sizeof(*ap));
                memcpy(ap->entity.publicKey,pubkey,32);
                Totaladdress++;
                ap->nexttick = 1;
                return(ap);
            }
            return(0);
        }
    }
    printf("hash table full\n");
    return(0);
}

struct univhash *Univhash(uint8_t pubkey[32],int32_t createflag)
{
    uint64_t hashi;
    int32_t i;
    uint8_t zero[32];
    struct univhash *up;
    hashi = addrhashi(pubkey);
    memset(zero,0,sizeof(zero));
    for (i=0; i<MAXADDRESSES; i++)
    {
        up = &Universe[(hashi + i) % MAXADDRESSES];
        if ( memcmp(up->pubkey,pubkey,32) == 0 )
            return(up);
        if ( memcmp(up->pubkey,zero,32) == 0 )
        {
            if ( createflag != 0 )
            {
                memset(up,0,sizeof(*up));
                memcpy(up->pubkey,pubkey,32);
                Totaluniv++;
                up->ownedtick = up->possessedtick = 1;
                return(up);
            }
            return(0);
        }
    }
    printf("hash table full\n");
    return(0);
}

int32_t qsublevel(struct addrhash *ap,struct univhash *up,int32_t index)
{
    char name[8];
    memset(name,0,sizeof(name));
    strcpy(name,(char *)"QWALLET");
    if ( get_univowned(up,name) >= VIP_TOKENLEVEL )
        return(100);
    else if ( index == 0 || (LATEST_TICK % 100) == 0 )
        return(2);
    else if ( LATEST_TICK > ap->nexttick+index/10 )        // linear decay, probably need steeper, better to make it adaptive
        return(1);
    else return(0);
}

int32_t scansub(char *subaddr)
{
    FILE *fp;
    char fname[512],addr[64];
    int32_t n,index,level;
    struct univhash *up;
    struct addrhash *ap;
    uint8_t subpubs[MAX_INDEX][32],zero[32];
    memset(zero,0,sizeof(zero));
    sprintf(fname,"%s%csubs%c%s",DATADIR,dir_delim(),dir_delim(),subaddr);
    n = 0;
    if ( (fp= fopen(fname,"rb+")) != 0 )
    {
        fread(subpubs,MAX_INDEX,32,fp);
        fclose(fp);
        for (index=0; index<MAX_INDEX; index++)
        {
            if ( memcmp(subpubs[index],zero,32) != 0 )
            {
                pubkey2addr(subpubs[index],addr);
                if ( (ap= Addresshash(subpubs[index],1)) != 0 && (up= Univhash(subpubs[index],1)) != 0 && (level= qsublevel(ap,up,index)) > 0 )
                {
                    qpubreq_add(addr,REQUEST_ENTITY);
                    if ( level > 1 && (LATEST_TICK % 100) == 0 )
                    {
                        qpubreq_add(addr,REQUEST_OWNED_ASSETS);
                        qpubreq_add(addr,REQUEST_POSSESSED_ASSETS);
                        n += 2;
                    }
                    n++;
                }
            }
        }
    }
    return(n);
}

int32_t scansubs(void)
{
    int32_t m,n;
    char line[512],fname[512],cmd[1024],*ptr;
    FILE *fp;
    sprintf(cmd,"ls -l %s/subs > /tmp/subscribers",DATADIR);
    system(cmd);
    m = n = 0;
    sprintf(fname,"/tmp/subscribers");
    if ( (fp= fopen(fname,"r")) != 0 )
    {
        while ( fgets(line,sizeof(line),fp) != 0 )
        {
            ptr = &line[strlen(line)-1];
            *ptr = 0;
            while ( ptr > line && ptr[-1] != ' ' )
                ptr--;
            //printf("(%s) [%s]\n",line,ptr);
            m += scansub(ptr);
            n++;
        }
        fclose(fp);
    }
    //printf("subscribers %d, numaddrs.%d\n",n,m);
    return(m);
}

int32_t init_spectrum(int32_t epoch,int32_t tick)
{
    char fname[512];
    FILE *fp;
    struct Entity E;
    int32_t numE = 0;
    uint8_t zero[32];
    int64_t supply = 0;
    struct addrhash *ap;
    memset(zero,0,sizeof(zero));
    sprintf(fname,"%sspectrum.%03d",epochdirname(epoch),epoch);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        while ( fread(&E,1,sizeof(E),fp) == sizeof(E) )
        {
            if ( memcmp(zero,E.publicKey,sizeof(zero)) != 0 )
            {
                supply += E.incomingAmount - E.outgoingAmount;
                if ( (ap= Addresshash(E.publicKey,1)) != 0 )
                {
                    ap->entity = E;
                    ap->nexttick = tick;
                }
                numE++;
            }
        }
        fclose(fp);
        SPECTRUM_SUPPLY = supply;
    }
    return(numE);
}

int32_t issueasset(char name[8],int32_t index)
{
    Assetnames = (struct assetname *)realloc(Assetnames,sizeof(*Assetnames) * (Numassets+1));
    memset(&Assetnames[Numassets],0,sizeof(Assetnames[Numassets]));
    memcpy(Assetnames[Numassets].name,name,sizeof(Assetnames[Numassets].name));
    Assetnames[Numassets].index = index;
    Numassets++;
    return(Numassets);
}

struct assetname *findasset(char name[8])
{
    int32_t i;
    for (i=0; i<Numassets; i++)
        if ( strcmp(name,Assetnames[i].name) == 0 )
            return(&Assetnames[i]);
    return(0);
}

struct assetname *findassetindex(int32_t index)
{
    int32_t i;
    for (i=0; i<Numassets; i++)
        if ( index == Assetnames[i].index )
            return(&Assetnames[i]);
    return(0);
}

int32_t init_universe(int32_t epoch,int32_t tick)
{
    char fname[512],name[8],addr[64];
    FILE *fp;
    struct Asset A;
    struct assetname *sp;
    int32_t index,owned,issued,possessed,iter;
    uint8_t zero[32];
    struct univhash *up;
    memset(zero,0,sizeof(zero));
    index = owned = possessed = issued = 0;
    sprintf(fname,"%suniverse.%03d",epochdirname(epoch),epoch);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        for (iter=0; iter<2; iter++)
        {
            rewind(fp);
            index = 0;
            while ( fread(&A,1,sizeof(A),fp) == sizeof(A) )
            {
                if ( iter == 0 )
                {
                    if ( A.varStruct.issuance.type == ISSUANCE )
                    {
                        memset(name,0,sizeof(name));
                        memcpy(name,A.varStruct.issuance.name,sizeof(A.varStruct.issuance.name));
                        issueasset(name,index);
                        printf("Issued %s index.%d %s\n",name,index,addr);
                        issued++;
                    }
                    index++;
                    continue;
                }
                memset(name,0,sizeof(name));
                switch ( A.varStruct.issuance.type )
                {
                    case ISSUANCE:
                        break;
                    case OWNERSHIP:
                        if ( (up= Univhash(A.varStruct.ownership.publicKey,1)) != 0 )
                        {
                            if ( (sp= findassetindex(A.varStruct.ownership.issuanceIndex)) != 0 )
                            {
                                strcpy(name,sp->name);
                                sp->supply += A.varStruct.ownership.numberOfUnits;
                                //printf("ADDSUPPLY %s %s\n",amountstr(A.varStruct.ownership.numberOfUnits),name);
                            } else printf("Cannot find asset with index.%d\n",A.varStruct.ownership.issuanceIndex);
                            if ( (0) )
                            {
                                pubkey2addr(A.varStruct.issuance.publicKey,addr);
                                printf("%s owns %s of index.%d (%s)\n",addr,amountstr(A.varStruct.ownership.numberOfUnits),A.varStruct.ownership.issuanceIndex,name);
                            }
                            update_univowned(up,name,A.varStruct.ownership.numberOfUnits,tick);
                            owned++;
                        }
                        break;
                    case POSSESSION:
                        if ( (up= Univhash(A.varStruct.possession.publicKey,1)) != 0 )
                        {
                            possessed++;
                        }
                        break;
                    default:
                        break;
                }
                index++;
            }
        }
        fclose(fp);
    }
    for (int i=0; i<Numassets; i++)
        printf("%-6d %s supply.%s\n",Assetnames[i].index,Assetnames[i].name,amountstr(Assetnames[i].supply));
    printf("issued.%d owned.%d possessed.%d\n",issued,owned,possessed);
    return(owned);
}

void addrchangelog(struct addrhash *ap,uint8_t changeflag)
{
    FILE *fp;
    char fname[512],addr[64];
    pubkey2addr(ap->entity.publicKey,addr);
    sprintf(fname,"%s%caddrs%c%s",DATADIR,dir_delim(),dir_delim(),addr);
    if ( (fp= fopen(fname,"rb+")) != 0 )
    {
        fseek(fp,0,SEEK_END);
        fwrite(&changeflag,1,1,fp);
        if ( (changeflag & 0xc) != 0 )
        {
            //printf("%d big update %s %d %d\n",changeflag,addr,ap->tick,ap->rank);
            fwrite(&((uint8_t *)ap)[32],1,sizeof(*ap) - 32,fp);
        }
        else
        {
            //printf("%d small update %s %d %d\n",changeflag,addr,ap->tick,ap->rank);
            fwrite(&ap->nexttick,1,sizeof(ap->nexttick),fp);
            fwrite(&ap->rank,1,sizeof(ap->rank),fp);
        }
        fclose(fp);
    }
    else if ( (fp= fopen(fname,"wb")) != 0 )
    {
        //printf("create %s\n",fname);
        changeflag = 0xf;
        fwrite(&changeflag,1,1,fp);
        fwrite(&((uint8_t *)ap)[32],1,sizeof(*ap) - 32,fp);
        fclose(fp);
    }
}

int32_t flushaddrs(int32_t createflag)
{
    FILE *fp;
    uint8_t changeflag,zero[32];
    int32_t i,dispflag,ranks[2],upd = 0;
    struct addrhash A;
    dispflag = 0;
    char fname[512];
    memset(zero,0,sizeof(zero));
    sprintf(fname,"%s%caddrhash",DATADIR,dir_delim());
    if ( createflag != 0 )
    {
        if ( (fp= fopen(fname,"rb+")) == 0 )
        {
            if ( (fp= fopen(fname,"wb")) != 0 )
            {
                fwrite(Addresses,MAXADDRESSES,sizeof(*Addresses),fp);
                fclose(fp);
                for (i=0; i<MAXADDRESSES; i++)
                    addrchangelog(&Addresses[i],0xf);
                upd = MAXADDRESSES;
            }
        }
        else
        {
            fread(Addresses,MAXADDRESSES,sizeof(*Addresses),fp);
            fclose(fp);
            upd = MAXADDRESSES;
        }
    }
    else
    {
        if ( (fp= fopen(fname,"rb+")) == 0 )
        {
            printf("%s file missing?\n",fname);
        }
        else
        {
            i = 0;
            while ( fread(&A,1,sizeof(A),fp) == sizeof(A) )
            {
                if ( memcmp(&Addresses[i].entity.publicKey,zero,32) == 0 || Addresses[i].nexttick == 0 || Addresses[i].nexttick < A.nexttick )
                {
                    i++;
                    continue;
                }
                ranks[0] = A.rank;
                ranks[1] = Addresses[i].rank;
                A.rank = Addresses[i].rank = 0; // ignore rank when generating events
                if ( memcmp(&A,&Addresses[i],sizeof(A)) != 0 )
                {
                    char addr[64];
                    changeflag = 0;
                    pubkey2addr(Addresses[i].entity.publicKey,addr);
                    if ( A.nexttick != Addresses[i].nexttick )
                    {
                        if ( dispflag < 3 )
                        {
                            printf("%s tick %d -> %d, i.%d\n",addr,A.nexttick,Addresses[i].nexttick,i);
                            dispflag++;
                        }
                        changeflag |= 1;
                    }
                    if ( ranks[0] != ranks[1] )
                    {
                        if ( dispflag < 10 )
                        {
                            printf("%s rank %d -> %d\n",addr,ranks[0],ranks[1]);
                            dispflag++;
                        }
                        changeflag |= 2;
                    }
                    if ( memcmp(&A.entity,&Addresses[i].entity,sizeof(A.entity)) != 0 )
                    {
                        if ( dispflag < 100 )
                        {
                            printf("%s tick %d entity changed! balance %s -> %s\n",addr,Addresses[i].nexttick,amountstr(ebalance(&A.entity)),amountstr2(ebalance(&Addresses[i].entity)));
                            dispflag++;
                        }
                        changeflag |= 4;
                    }
                    if ( changeflag == 0 )
                        changeflag |= 8;
                    Addresses[i].rank = ranks[1];
                    A = Addresses[i];
                    addrchangelog(&A,changeflag);
                    fseek(fp,i * sizeof(A),SEEK_SET);
                    fwrite(&A,1,sizeof(A),fp);
                    upd++;
                }
                Addresses[i].rank = ranks[1];
                i++;
            }
            fclose(fp);
        }
    }
    //printf("finished flushaddrs updated.%d\n",upd);
    return(upd);
}

void univchangelog(struct univhash *up,int32_t changeflag)
{
    FILE *fp;
    char fname[512],addr[64];
    pubkey2addr(up->pubkey,addr);
    sprintf(fname,"%s%cuniv%c%s",DATADIR,dir_delim(),dir_delim(),addr);
    if ( (fp= fopen(fname,"rb+")) != 0 )
    {
        fseek(fp,0,SEEK_END);
        if ( changeflag == 2 )
            fwrite(&((uint8_t *)up)[32],1,sizeof(*up) - 32,fp);
        else
        {
            fwrite(&up->ownedtick,1,sizeof(up->ownedtick),fp);
            fwrite(&up->possessedtick,1,sizeof(up->possessedtick),fp);
        }
        fclose(fp);
    }
    else if ( (fp= fopen(fname,"wb")) != 0 )
    {
        //printf("create %s\n",fname);
        fwrite(&((uint8_t *)up)[32],1,sizeof(*up) - 32,fp);
        fclose(fp);
    }
}

int32_t flushuniv(int32_t createflag)
{
    FILE *fp;
    int32_t i,changeflag,upd = 0;
    struct univhash U,Utmp,Utmp2;
    char fname[512],addr[64];
    sprintf(fname,"%s%cunivhash",DATADIR,dir_delim());
    if ( createflag != 0 )
    {
        if ( (fp= fopen(fname,"rb+")) == 0 )
        {
            if ( (fp= fopen(fname,"wb")) != 0 )
            {
                fwrite(Universe,MAXADDRESSES,sizeof(*Universe),fp);
                fclose(fp);
                for (i=0; i<MAXADDRESSES; i++)
                    univchangelog(&Universe[i],2);
                upd = MAXADDRESSES;
            }
        }
        else
        {
            fread(Universe,MAXADDRESSES,sizeof(*Universe),fp);
            fclose(fp);
            upd = MAXADDRESSES;
        }
    }
    else
    {
        if ( (fp= fopen(fname,"rb+")) == 0 )
            printf("univhash file missing?\n");
        else
        {
            i = 0;
            while ( fread(&U,1,sizeof(U),fp) == sizeof(U) )
            {
                if ( memcmp(&U,&Universe[i],sizeof(U)) != 0 )
                {
                    Utmp = U;
                    Utmp2 = Universe[i];
                    pubkey2addr(Universe[i].pubkey,addr);
                    Utmp.ownedtick = Utmp.possessedtick = Utmp2.ownedtick = Utmp2.possessedtick = 0;
                    if ( memcmp(&Utmp,&Utmp2,sizeof(Utmp)) != 0 )
                    {
                        printf("%s univ updated token balance\n",addr);
                        changeflag = 2;
                    }
                    else
                    {
                        changeflag = 1;
                        printf("%s univ ticks %d %d -> %d %d\n",addr,U.ownedtick,U.possessedtick,Universe[i].ownedtick,Universe[i].possessedtick);
                    }
                    U = Universe[i];
                    univchangelog(&U,changeflag);
                    fseek(fp,i * sizeof(U),SEEK_SET);
                    fwrite(&U,1,sizeof(U),fp);
                    upd++;
                }
                i++;
            }
            fclose(fp);
        }
    }
    if ( upd != 0 )
        printf("finished flushuniv updated.%d\n",upd);
    return(upd);
}

void disp_asset(struct Asset *issued,struct Asset *owned)
{
    char name[8],issuer[64],owner[64];
    memset(name,0,sizeof(name));
    memcpy(name,issued->varStruct.issuance.name,7);
    pubkey2addr(owned->varStruct.ownership.publicKey,owner);
    pubkey2addr(issued->varStruct.ownership.publicKey,issuer);
    printf("name.(%s) %s %s %s\n",name,amountstr(owned->varStruct.ownership.numberOfUnits),issuer,owner);
}

void emit_quote(FILE *fp,int32_t commaflag,struct Orders_Output *quote)
{
    char addr[64];
    pubkey2addr(quote->pubkey,addr);
    fprintf(fp,"%s[\"%s\",\"%s\",\"%s\"]",commaflag!=0?",":"",addr,amountstr(quote->numberOfShares),amountstr2(quote->price));
}

void emit_quotes(FILE *fp,char *arrayname,struct Orders_Output *quotes,int32_t n)
{
    int32_t i,m = 0;
    fprintf(fp,",\"%s\":[",arrayname);
    for (i=0; i<n; i++)
    {
        if ( quotes[i].price != 0 )
        {
            emit_quote(fp,m>0,&quotes[i]);
            m++;
            //printf("i.%d m.%d %s\n",i,m,amountstr(quotes[i].price));
        }
    }
    fprintf(fp,"]");
}

void emit_orderbook(struct issuerpub *asset)
{
    FILE *fp;
    uint8_t zero[32];
    char fname[512],issuer[64];
    sprintf(fname,"%s%corders%c%s",DATADIR,dir_delim(),dir_delim(),asset->name);
    if ( (fp= fopen(fname,"w")) != 0 )
    {
        memset(zero,0,sizeof(zero));
        if ( memcmp(zero,asset->pubkey,32) == 0 )
            strcpy(issuer,"QubicSmartContract");
        else
            pubkey2addr(asset->pubkey,issuer);
        fprintf(fp,"{\"name\":\"%s\",\"issuer\":\"%s\"",asset->name,issuer);
        emit_quotes(fp,"bids",asset->bids,sizeof(asset->bids)/sizeof(*asset->bids));
        emit_quotes(fp,"asks",asset->asks,sizeof(asset->asks)/sizeof(*asset->asks));
        fprintf(fp,"}");
        fclose(fp);
    }
}

void tests(int32_t tick)
{
#ifdef TESTNET
    int32_t i,n,txtick;
    struct QxFees_output fees;
    char rawhex[4096],txidstr[64],addr[64],checkaddr[64];
    RespondOwnedAssets assets[16];
    uint8_t merkleroot[32],digest[32],extraseed[64],subseed[32],privkey[32],pubkey[32];
    FILE *fp;
    if ( (fp= fopen("subseed","rb")) != 0 )
    {
        fread(extraseed,1,32,fp);
        fclose(fp);
    } else printf("error creating file\n");
    memcpy(subseed,extraseed,32);
    KangarooTwelve((uint8_t *)"Z",(int32_t)strlen("Z"),&extraseed[32],32);
    KangarooTwelve(extraseed,sizeof(extraseed),subseed,32);
    getPrivateKeyFromSubSeed(subseed,privkey);
    getPublicKeyFromPrivateKey(privkey,pubkey);
    getIdentityFromPublicKey(pubkey,addr,false);
    CurrentTickInfo I = getTickInfoFromNode(DEFAULT_NODE_IP,DEFAULT_NODE_PORT);
    if ( I.tick > LATEST_TICK )
        LATEST_TICK = I.tick;
    INITIAL_TICK = I.initialTick;
    //if ( tick == 0 )
    {
        printf("sendmany %s\n",amountstr(getFees((char *)"91.210.226.133",&fees)));
        printf("sendmany %s\n",amountstr(getFees((char *)"91.210.226.146",&fees)));
        //printf("sendmany %s\n",amountstr(getFees((char *)"194.158.200.8",&fees)));
        printf("sendmany %s\n",amountstr(getFees(DEFAULT_NODE_IP,&fees)));
        pubkey2addr(pubkey,checkaddr);
        RespondedEntity E = getBalance(DEFAULT_NODE_IP,DEFAULT_NODE_PORT,pubkey,merkleroot);
        n = getAssets(assets,sizeof(assets)/sizeof(*assets),DEFAULT_NODE_IP,DEFAULT_NODE_PORT,pubkey);
        for (i=0; i<n; i++)
            disp_asset(&assets[i].issuanceAsset,&assets[i].asset);
        printf("%s balance %s tick.%d\n",checkaddr,amountstr(ebalance(&E.entity)),E.tick);
        addr2pubkey((char *)"EOKXREPZIQRTTDHZUTVDGBUBIWVATNGUGCTOUWAJWBAVQWQZESDHQSTAVGQN",pubkey);
        n = getAssets(assets,sizeof(assets)/sizeof(*assets),DEFAULT_NODE_IP,DEFAULT_NODE_PORT,pubkey);
        for (i=0; i<n; i++)
            disp_asset(&assets[i].issuanceAsset,&assets[i].asset);
        printf("assets for %s\n","EOKXREPZIQRTTDHZUTVDGBUBIWVATNGUGCTOUWAJWBAVQWQZESDHQSTAVGQN");
        //txtick = qxIssueAsset(rawhex,txidstr,digest,subseed,"TEST","",100000000,0,0);
        //sendrawtransaction(DEFAULT_NODE_IP,DEFAULT_NODE_PORT,rawhex);
        txtick = qxTransferAsset(rawhex,txidstr,digest,subseed,"TEST",(char *)"EOKXREPZIQRTTDHZUTVDGBUBIWVATNGUGCTOUWAJWBAVQWQZESDHQSTAVGQN",1,0);
        sendrawtransaction(DEFAULT_NODE_IP,DEFAULT_NODE_PORT,rawhex);
        printf("rawhex %s tick.%d\n",rawhex,txtick);
        //sleep(10);
    }
    //else
    {
        printf("get QX orderbooks\n"); //193934887
        for (i=0; i<NUMASSETS; i++)
        {
            qxGetAssetAskOrder(&ASKvu[0][i],DEFAULT_NODE_IP,-1,ASSETS[i].name,0);
            qxGetAssetBidOrder(&BIDvu[0][i],DEFAULT_NODE_IP,-1,ASSETS[i].name,0);
        }
        txtick = qxAddToAskOrder(rawhex,txidstr,digest,subseed,"QX",1000 + (rand() % 10000),1,0);
        sendrawtransaction(DEFAULT_NODE_IP,DEFAULT_NODE_PORT,rawhex);
        txtick = qxRemoveToBidOrder(rawhex,txidstr,digest,subseed,"QX",4444422,3,0);
        sendrawtransaction(DEFAULT_NODE_IP,DEFAULT_NODE_PORT,rawhex);
        txtick = qxAddToBidOrder(rawhex,txidstr,digest,subseed,"QX",1000 + (rand() % 10000),1,0);
        sendrawtransaction(DEFAULT_NODE_IP,DEFAULT_NODE_PORT,rawhex);
      printf("rawhex %s tick.%d\n",rawhex,txtick);
    }
    for (i=0; i<NUMASSETS; i++)
        emit_orderbook(&ASSETS[i]);

#endif
}

#ifdef __APPLE__
int servermain(int argc, const char * argv[])
#else
int main(int argc, const char * argv[])
#endif
{
    pthread_t findpeers_thread,fifoloop_thread;
    uint32_t utime = 0;
    int32_t i,firsttick = 0,year,numflush,numsub,month,day,seconds,newepochflag = 0,latest = 0;
    //mutualexclusion("qserver",1);
    devurandom((uint8_t *)&utime,sizeof(utime));
    srand(utime);
    utime = set_current_ymd(&year,&month,&day,&seconds);
    EPOCH = utime_to_epoch(utime,&seconds);
    init_dirs();
    signal(SIGPIPE,SIG_IGN);
    pthread_mutex_init(&sandwich_mutex,NULL);
    pthread_mutex_init(&qpubreq_mutex,NULL);
    pthread_mutex_init(&qentity_mutex,NULL);
    pthread_mutex_init(&addpeer_mutex,NULL);
    Addresses = (struct addrhash *)calloc(MAXADDRESSES,sizeof(*Addresses));
    memset(Addresses,0,sizeof(*Addresses) * MAXADDRESSES);
    Universe = (struct univhash *)calloc(MAXADDRESSES,sizeof(*Universe));
    memset(Universe,0,sizeof(*Universe) * MAXADDRESSES);
    pthread_create(&fifoloop_thread,NULL,&fifoloop,0);
//#ifndef TESTNET
    pthread_create(&findpeers_thread,NULL,&findpeers,0);
//#endif
    tests(0);
    latest = 0;
    while ( 1 )
    {
        if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
            break;
        utime = set_current_ymd(&year,&month,&day,&seconds);
        if ( utime > LATEST_UTIME )
        {
            tests(LATEST_TICK);
            LATEST_UTIME = utime;
            if ( newepochflag != 0 && utime > newepochflag+90 && EXITFLAG == 0 )
                EXITFLAG = utime + 30;
            if ( newepochflag == 0 && utime_to_epoch(utime,&seconds) != EPOCH )
            {
                printf("EPOCH change detected %d -> %d\n",EPOCH,utime_to_epoch(utime,&seconds));
                newepoch();
                newepochflag = utime;
            }
            if ( EPOCH != 0 && (utime % 60) == 0 )
                update_html(EPOCH);
#ifdef TESTNET
            CurrentTickInfo I = getTickInfoFromNode(DEFAULT_NODE_IP,DEFAULT_NODE_PORT);
            if ( I.tick > LATEST_TICK )
                LATEST_TICK = I.tick;
            INITIAL_TICK = I.initialTick;
#endif
        }
        if ( LATEST_TICK > latest && INITIAL_TICK != 0 )
        {
            tests(LATEST_TICK);
            numflush = numsub = 0;
            if ( LATEST_TICK == latest+1 )
            {
                if ( firsttick == 0 )
                {
                    firsttick = LATEST_TICK;
                    init_spectrum(EPOCH,INITIAL_TICK);
                    init_universe(EPOCH,INITIAL_TICK);
                    richlist((char *)"");
                    numflush = flushaddrs(1);
                    flushuniv(1);
                }
                else
                {
                    numflush = flushaddrs(0);
                    flushuniv(0);
                }
                numsub = scansubs();
                update_sandwiches(LATEST_TICK);
            }
            latest = LATEST_TICK;
            for (i=0; i<NUMASSETS; i++)
                emit_orderbook(&ASSETS[i]);
            printf("LATEST_TICK.%d REQ count.%d totalreq.%d Entitydata.%d numflush.%d numsub.%d\n",LATEST_TICK,qpubreq_count(),Totalreqs,Entitydata,numflush,numsub);
            if ( firsttick != 0 && EPOCH != 0 && (LATEST_TICK % 10) == 0 )
            {
                richlist((char *)"");
                if ( (LATEST_TICK % 100) == 0 )
                {
                    for (i=0; i<NUMASSETS; i++)
                        richlist((char *)ASSETS[i].name);
                    /*richlist((char *)"QX");
                    richlist((char *)"QTRY");
                    richlist((char *)"RANDOM");
                    richlist((char *)"QUTIL");
                    richlist((char *)"QFT");
                    richlist((char *)"QWALLET");*/
                }
            }
            fflush(stdout);
        }
        usleep(10000);
    }
    sleep(15);
    //mutualexclusion("qserver",-1);
    printf("qserver exiting\n");
    return(0);
}

// richlist REST
// orderbook history
// ASSETA <-> N*ASSETB+QU trading -> also needs parallel tx
// myorders support can be done via orders files

// testnet verify tx creation (-issue, -transfer, -bid/ask, cancel bid/ask)
// verify orderbooks
// verify resend of all txtypes
// imported seed entropy calculator


// minimize qclient footprint
// sendmany txids?

// weekly: update EPOCHS, spectrum/universe, verify supply, relaunches

    
