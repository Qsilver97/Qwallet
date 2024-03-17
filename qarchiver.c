


#define QARCHIVER

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
#include "uthash.h"


#include "qshared/K12AndKeyUtil.h"
#include "qshared/qdefines.h"
#include "qshared/qstructs.h"

struct qubictx
{
    UT_hash_handle hh;
    uint8_t txid[32];
    int32_t txlen;
    uint8_t txdata[];
} *TXIDS;

struct RAM_Quorum
{
    Tick Quorum[NUMBER_OF_COMPUTORS];
    uint8_t qchain[32],spectrum[32];
    int32_t validated,count,pending,needtx;
} *RAMQ;

#include "qshared/qkeys.c"
#include "qshared/qhelpers.c"
#include "qshared/qtime.c"

#include "qconn.c"
#include "qpeers.c"

#define QUORUM_FETCHWT 100
#define TX_FETCHWT 300

pthread_mutex_t txid_mutex;


void _qubictxadd(uint8_t txid[32],uint8_t *txdata,int32_t txlen)
{
    struct qubictx *qtx;
    qtx = (struct qubictx *)calloc(1,sizeof(*qtx) + txlen);
    memcpy(qtx->txid,txid,sizeof(qtx->txid));
    qtx->txlen = txlen;
    memcpy(qtx->txdata,txdata,txlen);
    HASH_ADD_KEYPTR(hh,TXIDS,qtx->txid,sizeof(qtx->txid),qtx);
}

struct qubictx *qubictxhash(uint8_t txid[32],uint8_t *txdata,int32_t txlen)
{
    struct qubictx *qtx;
    pthread_mutex_lock(&txid_mutex);
    HASH_FIND(hh,TXIDS,txid,sizeof(qtx->txid),qtx);
    if ( qtx == 0 && txdata != 0 && txlen >= sizeof(Transaction) )
    {
        _qubictxadd(txid,txdata,txlen);
        HASH_FIND(hh,TXIDS,txid,sizeof(qtx->txid),qtx);
        if ( qtx == 0 )
            printf("FATAL HASH TABLE ERROR\n");
    }
    pthread_mutex_unlock(&txid_mutex);
    return(qtx);
}

void qpurge(int32_t tick)
{
    char fname[512];
    sprintf(fname,"epochs%c%d%c%d.T",dir_delim(),EPOCH,dir_delim(),tick);
    deletefile(fname);
    sprintf(fname,"epochs%c%d%c%d.Q",dir_delim(),EPOCH,dir_delim(),tick);
    deletefile(fname);
    sprintf(fname,"epochs%c%d%c%d",dir_delim(),EPOCH,dir_delim(),tick);
    deletefile(fname);
    if ( VALIDATED_TICK >= tick )
        VALIDATED_TICK = tick - 1;
    if ( HAVE_TXTICK >= tick )
        HAVE_TXTICK = tick - 1;
}

void qchaincalc(uint8_t prevhash[32],uint8_t qchain[32],Tick T)
{
    uint8_t digest[32];
    char hexstr[65];
    Qchain Q;
    memset(&Q,0,sizeof(Q));
    Q.epoch = T.epoch;
    Q.tick = T.tick;
    Q.millisecond = T.millisecond;
    Q.second = T.second;
    Q.minute = T.minute;
    Q.hour = T.hour;
    Q.day = T.day;
    Q.month = T.month;
    Q.year = T.year;
    Q.prevResourceTestingDigest = T.prevResourceTestingDigest;
    memcpy(Q.prevSpectrumDigest,T.prevSpectrumDigest,sizeof(Q.prevSpectrumDigest));
    memcpy(Q.prevUniverseDigest,T.prevUniverseDigest,sizeof(Q.prevUniverseDigest));
    memcpy(Q.prevComputerDigest,T.prevComputerDigest,sizeof(Q.prevComputerDigest));
    memcpy(Q.transactionDigest,T.transactionDigest,sizeof(Q.transactionDigest));
    memcpy(Q.prevqchain,prevhash,sizeof(Q.prevqchain));
    KangarooTwelve((uint8_t *)&Q,sizeof(Q),digest,32);
    byteToHex(digest,hexstr,sizeof(digest));
    if ( (T.tick % 1000) == 0 )
        printf("qchain.%-6d %s\n",T.tick,hexstr);
    memcpy(qchain,digest,sizeof(digest));
}

void incr_VALIDATE_TICK(int32_t tick,Tick T)
{
    FILE *fp;
    char fname[512];
    int32_t i;
    long offset;
    uint8_t prevhash[32],buf[64];
    offset = (tick - INITIAL_TICK);
    if ( offset >= 0 && offset < MAXTICKS )
    {
        if ( offset == 0 )
            memset(prevhash,0,sizeof(prevhash));
        else
        {
            memcpy(RAMQ[offset].spectrum,T.prevSpectrumDigest,sizeof(prevhash));
            memcpy(prevhash,RAMQ[offset-1].qchain,sizeof(prevhash));
        }
        qchaincalc(prevhash,RAMQ[offset].qchain,T);
        sprintf(fname,"epochs%c%d%cqchain",dir_delim(),EPOCH,dir_delim());
        if ( (fp= fopen(fname,"rb+")) == 0 )
        {
            if ( (fp= fopen(fname,"wb")) != 0 )
            {
                memset(buf,0,sizeof(buf));
                for (i=0; i<MAXTICKS; i++)
                    fwrite(buf,1,sizeof(buf),fp);
                fclose(fp);
            }
            fp = fopen(fname,"rb+");
        }
        if ( fp != 0 )
        {
            fseek(fp,offset * 64,SEEK_SET);
            memcpy(buf,RAMQ[offset].spectrum,32);
            memcpy(&buf[32],RAMQ[offset].qchain,32);
            fwrite(buf,1,sizeof(buf),fp);
            fclose(fp);
        }
    }
    VALIDATED_TICK = tick;
    PROGRESSTIME = LATEST_UTIME;
    EXITFLAG = 0;
}

int32_t update_validated(void)
{
    Tick T;
    TickData TD;
    uint8_t zeros[32],digest[32];
    FILE *fp;
    int32_t tick,n,haveQ=0,deleteflag,missed = 0;
    char fname[512];
    n = 0;
    
    for (tick=VALIDATED_TICK!=0?VALIDATED_TICK:INITIAL_TICK; tick<LATEST_TICK && missed<1000; tick++)
    {
        n++;
        haveQ = 0;
        //printf("validate %d missed.%d\n",tick,missed);
        sprintf(fname,"epochs%c%d%c%d.T",dir_delim(),EPOCH,dir_delim(),tick);
        if ( (fp= fopen(fname,"rb")) != 0 )
        {
            fclose(fp);
            sprintf(fname,"epochs%c%d%c%d.Q",dir_delim(),EPOCH,dir_delim(),tick);
            if ( (fp= fopen(fname,"rb")) != 0 )
            {
                while ( fread(&T,1,sizeof(T),fp) == sizeof(T) )
                {
                    if ( T.tick == tick )
                    {
                        haveQ = 1;
                        break;
                    }
                }
                fclose(fp);
                if ( haveQ != 0 )
                {
                    //printf("skip VALIDATED_TICK.%d\n",tick);
                    incr_VALIDATE_TICK(tick,T);
                    continue;
                }
            }
            //printf("haveT.%d tick.%d even with Qfile\n",haveT,tick);
        }
        sprintf(fname,"epochs%c%d%c%d.Q",dir_delim(),EPOCH,dir_delim(),tick);
        if ( (fp= fopen(fname,"rb")) != 0 )
        {
            while ( fread(&T,1,sizeof(T),fp) == sizeof(T) )
            {
                if ( T.tick == tick )
                {
                    haveQ = 1;
                    break;
                }
            }
            fclose(fp);
            deleteflag = 0;
            sprintf(fname,"epochs%c%d%c%d",dir_delim(),EPOCH,dir_delim(),tick);
            if ( (fp= fopen(fname,"rb")) != 0 )
            {
                fseek(fp,0,SEEK_END);
                if ( ftell(fp) == 32 )
                    memset(digest,0,sizeof(digest));
                else
                {
                    rewind(fp);
                    if ( fread(&TD,1,sizeof(TD),fp) == sizeof(TD) )
                        KangarooTwelve((uint8_t *)&TD,sizeof(TD),digest,32);
                    else deleteflag = 1;
                }
                fclose(fp);
                if ( deleteflag == 0 )
                {
                    if ( memcmp(digest,T.transactionDigest,sizeof(digest)) == 0 )
                    {
                        if ( missed == 0 && tick > VALIDATED_TICK )
                        {
                            //printf("VALIDATED_TICK.%d\n",tick);
                            incr_VALIDATE_TICK(tick,T);
                        }
                    }
                    else
                    {
                        deleteflag = 1;
                        char hex1[65],hex2[65];
                        byteToHex(digest,hex1,32);
                        byteToHex(T.transactionDigest,hex2,32);
                        printf("transactiondigest mismatch tick.%d %s vs %s\n",T.tick,hex1,hex2);
                    }
                }
                if ( deleteflag != 0 )
                {
                    printf("validate deletes %s\n",fname);
                    deletefile(fname);
                }
            }
            else
            {
                if ( haveQ != 0 )
                {
                    memset(zeros,0,sizeof(zeros));
                    if ( memcmp(zeros,T.transactionDigest,sizeof(zeros)) == 0 )
                    {
                        if ( (fp= fopen(fname,"wb")) != 0 )
                        {
                            fwrite(zeros,1,sizeof(zeros),fp);
                            fclose(fp);
                        }
                    }
                }
                missed++;
            }
        }
        else
        {
            missed++;
            //printf("%d missing\n",tick);
        }
    }
    if ( (rand() % 100) == 0 )
        printf("VALIDATED_TICK.%d missed.%d of %d\n",VALIDATED_TICK,missed,n);
    return(VALIDATED_TICK);
}

int32_t cmptick(Tick *a,Tick *b)
{
    if ( a->epoch != b->epoch )
        return(-1);
    if ( a->tick != b->tick )
        return(-2);
    if ( a->millisecond != b->millisecond )
        return(-3);
    if ( a->second != b->second )
        return(-4);
    if ( a->minute != b->minute )
        return(-5);
    if ( a->hour != b->hour )
        return(-6);
    if ( a->day != b->day )
        return(-7);
    if ( a->month != b->month )
        return(-8);
    if ( a->year != b->year )
        return(-9);
    if ( a->prevResourceTestingDigest != b->prevResourceTestingDigest )
        return(-10);
    //if ( a->saltedResourceTestingDigest != b->saltedResourceTestingDigest )
    //    return(-11);
    if ( memcmp(a->prevSpectrumDigest,b->prevSpectrumDigest,sizeof(a->prevSpectrumDigest)) != 0 )
        return(-12);
    if ( memcmp(a->prevUniverseDigest,b->prevUniverseDigest,sizeof(a->prevUniverseDigest)) != 0 )
        return(-13);
    if ( memcmp(a->prevComputerDigest,b->prevComputerDigest,sizeof(a->prevComputerDigest)) != 0 )
        return(-14);
    //if ( memcmp(a->saltedSpectrumDigest,b->saltedSpectrumDigest,sizeof(a->saltedSpectrumDigest)) != 0 )
    //    return(-15);
    //if ( memcmp(a->saltedUniverseDigest,b->saltedUniverseDigest,sizeof(a->saltedUniverseDigest)) != 0 )
    //    return(-16);
    //if ( memcmp(a->saltedComputerDigest,b->saltedComputerDigest,sizeof(a->saltedComputerDigest)) != 0 )
    //    return(-17);
    if ( memcmp(a->transactionDigest,b->transactionDigest,sizeof(a->transactionDigest)) != 0 )
        return(-18);
    //if ( memcmp(a->expectedNextTickTransactionDigest,b->expectedNextTickTransactionDigest,sizeof(a->expectedNextTickTransactionDigest)) != 0 )
    //    return(-19);
    return(0);
}

int32_t quorumsigverify(Computors *computors,Tick *T)
{
    int computorIndex = T->computorIndex;
    uint8_t digest[32],computorOfThisTick[32];
    T->computorIndex ^= BROADCAST_TICK;
    KangarooTwelve((uint8_t *)T,sizeof(*T) - SIGNATURE_SIZE,digest,32);
    memcpy(computorOfThisTick,computors->publicKeys[computorIndex],32);
    if ( verify(computorOfThisTick,digest,T->signature) != 0 )
    {
        T->computorIndex ^= BROADCAST_TICK;
        return(1);
    }
    T->computorIndex ^= BROADCAST_TICK;
    return(0);
}

void process_quorumdata(int32_t peerid,char *ipaddr,Tick *qdata,Computors *computors)
{
    FILE *fp;
    char fname[512];
    int32_t i,offset,firsti,matches,count,errors,err;
    offset = (qdata->tick - INITIAL_TICK);
    if ( qdata->epoch == EPOCH && qdata->tick != 0 && offset >= 0 && offset < MAXTICKS && RAMQ[offset].validated == 0 )
    {
        if ( qdata->computorIndex >= 0 && qdata->computorIndex < 676 && RAMQ[offset].Quorum[qdata->computorIndex].tick != qdata->tick && quorumsigverify(computors,qdata) == 1 )
        {
            RAMQ[offset].Quorum[qdata->computorIndex] = *qdata;
            RAMQ[offset].count++;
            if ( RAMQ[offset].count >= 451 )
            {
                for (count=i=0; i<676; i++)
                {
                    //printf("%d ",RAMQ[offset].Quorum[i].tick);
                    if ( RAMQ[offset].Quorum[i].tick != 0 )
                        count++;
                }
                if ( count != RAMQ[offset].count )
                {
                    if ( (rand() % 100) == 0 )
                        printf("set count %d -> %d\n",RAMQ[offset].count,count);
                    RAMQ[offset].count = count;
                }
                for (firsti=0; firsti<676; firsti++)
                    if ( RAMQ[offset].Quorum[firsti].epoch == EPOCH && RAMQ[offset].Quorum[firsti].tick == qdata->tick )
                        break;
                matches = 1;
                errors = 0;
                for (i=firsti+1; i<676; i++)
                {
                    if ( RAMQ[offset].Quorum[i].tick == 0 )
                       continue;
                    if ( (err= cmptick(&RAMQ[offset].Quorum[firsti],&RAMQ[offset].Quorum[i])) == 0 )
                        matches++;
                    else
                    {
                        errors++;
                        if ( err != -2 )
                            printf("E%d ",err);
                    }
                }
                if ( matches >= 451 )
                {
                    RAMQ[offset].validated = matches;
                    sprintf(fname,"epochs%c%d%c%d.Q",dir_delim(),EPOCH,dir_delim(),qdata->tick);
                    if ( (fp= fopen(fname,"wb")) != 0 )
                    {
                        fwrite(RAMQ[offset].Quorum,1,sizeof(RAMQ[offset].Quorum),fp);
                        fclose(fp);
                    }
                }
                //printf("tick.%d peerid.%d matches %d, firsti.%d errors.%d count.%d\n",qdata->tick,peerid,matches,firsti,errors,count);
            }
        }
    }
}

int32_t updateticktx(int32_t tick,char *ipaddr,int32_t sock)
{
    RequestedTickTransactions TX;
    struct quheader H;
    uint8_t reqbuf[sizeof(H) + sizeof(TX)];
    memset(&TX,0,sizeof(TX));
    memset(reqbuf,0,sizeof(reqbuf));
    H = quheaderset(REQUEST_TICK_TRANSACTIONS,sizeof(H) + sizeof(TX));
    memcpy(reqbuf,&H,sizeof(H));
    TX.tick = tick;
    memcpy(&reqbuf[sizeof(H)],&TX,sizeof(TX));
    //printf(">>>>>>>>>>> %s updateticktx %d\n",ipaddr,tick);
    return(socksend(ipaddr,sock,reqbuf,sizeof(H) + sizeof(TX)));
}

int32_t updatetick(int32_t *nump,int32_t tick,char *ipaddr,int32_t sock)
{
    FILE *fp;
    char fname[512];
    struct quheader H;
    RequestedQuorumTick R;
    int32_t offset;
    uint8_t reqbuf[sizeof(H) + sizeof(R) ];
    sprintf(fname,"epochs%c%d%c%d",dir_delim(),EPOCH,dir_delim(),tick);
    if ( (fp= fopen(fname,"rb")) == 0 )
    {
        sock = updateticktx(tick,ipaddr,sock);
        H = quheaderset(REQUEST_TICK_DATA,sizeof(H) + sizeof(tick));
        memcpy(reqbuf,&H,sizeof(H));
        memcpy(&reqbuf[sizeof(H)],&tick,sizeof(tick));
        sock = socksend(ipaddr,sock,reqbuf,sizeof(H) + sizeof(tick));
        (*nump)++;
    } else fclose(fp);
    sprintf(fname,"epochs%c%d%c%d.Q",dir_delim(),EPOCH,dir_delim(),tick);
    offset = (tick - INITIAL_TICK);
    if ( offset >= 0 && offset < MAXTICKS )//&& RAMQ[offset].pending < LATEST_TICK-1 )
    {
        if ( (fp= fopen(fname,"rb")) == 0 )
        {
            memset(&R,0,sizeof(R));
            memset(reqbuf,0,sizeof(reqbuf));
            H = quheaderset(REQUEST_QUORUMTICK,sizeof(H) + sizeof(R));
            memcpy(reqbuf,&H,sizeof(H));
            R.tick = tick;
            memcpy(&reqbuf[sizeof(H)],&R,sizeof(R));
            sock = socksend(ipaddr,sock,reqbuf,sizeof(H) + sizeof(R));
            RAMQ[offset].pending = LATEST_TICK;
            (*nump) += 2;
        } else fclose(fp);
    }
    return(sock);
}

void process_entity(int32_t peerid,char *ipaddr,RespondedEntity *E)
{
    printf("unexpected entity data in qarchiver\n");
}

int32_t process_transaction(int32_t *savedtxp,FILE *fp,int32_t peerid,char *ipaddr,Transaction *tx,int32_t txlen)
{
    static uint8_t txdata[MAXPEERS+1][4096],sigs[MAXPEERS+1][64]; // needs to be aligned or crashes in verify
    uint8_t digest[32],txid[32];
    char addr[64],txidstr[64];
    int32_t v = -1;
    if ( txlen < sizeof(txdata[peerid]) )
    {
        memcpy(txdata[peerid],tx,txlen);
        KangarooTwelve(txdata[peerid],txlen,txid,32);
        getTxHashFromDigest(txid,txidstr);
        txidstr[60] = 0;
        KangarooTwelve(txdata[peerid],txlen-64,digest,32);
        memcpy(sigs[peerid],&txdata[peerid][txlen-64],64);
        v = verify(txdata[peerid],digest,sigs[peerid]);
        pubkey2addr(tx->sourcePublicKey,addr);
        if ( v > 0 && fp != 0 )
        {
            fwrite(&txlen,1,sizeof(txlen),fp);
            fwrite(txid,1,sizeof(txid),fp);
            fwrite(tx,1,txlen,fp);
            qubictxhash(txid,(uint8_t *)tx,txlen);
            (*savedtxp)++;
        }
        //printf("process tx from tick.%d %s %s v.%d txlen.%d %p\n",tx->tick,txidstr,addr,v,txlen,qubictxhash(txid,(uint8_t *)tx,txlen));
    }
    return(v);
}

int32_t validate_computors(Computors *computors)
{
    uint8_t digest[32],arbPubkey[32];
    addr2pubkey(ARBITRATOR,arbPubkey);
    KangarooTwelve((uint8_t *)computors,sizeof(*computors) - SIGNATURE_SIZE,digest,32);
    return(verify(arbPubkey,digest,computors->signature));
}

int32_t has_computors(Computors *computors,char *ipaddr)
{
    FILE *fp;
    char fname[512];
    sprintf(fname,"epochs%c%d%ccomputors%c%s",dir_delim(),EPOCH,dir_delim(),dir_delim(),ipaddr);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        fread(computors,1,sizeof(*computors),fp);
        fclose(fp);
        return(validate_computors(computors));
    }
    return(-1);
}

void process_computors(int32_t peerid,char *ipaddr,Computors *computors)
{
    int32_t v;
    FILE *fp;
    char fname[512];
    v = validate_computors(computors);
    if ( v != 0 )
    {
        sprintf(fname,"epochs%c%d%ccomputors%c%s",dir_delim(),EPOCH,dir_delim(),dir_delim(),ipaddr);
        if ( (fp= fopen(fname,"rb")) == 0 )
        {
            if ( (fp= fopen(fname,"wb")) != 0 )
            {
                fwrite(computors,1,sizeof(*computors),fp);
                fclose(fp);
            }
        } else fclose(fp);
    }
    printf("peerid.%d computors.%d v.%d\n",peerid,EPOCH,v);
}

void process_tickdata(int32_t peerid,char *ipaddr,TickData *tickdata,Computors *computors)
{
    FILE *fp;
    char fname[512];
    uint8_t sigcheck[32],sig[64],pubkey[32];
    int32_t computorIndex = tickdata->computorIndex;
    tickdata->computorIndex ^= BROADCAST_FUTURE_TICK_DATA;
    KangarooTwelve((uint8_t *)tickdata,sizeof(*tickdata) - SIGNATURE_SIZE,sigcheck,32);
    tickdata->computorIndex ^= BROADCAST_FUTURE_TICK_DATA;
    memcpy(sig,tickdata->signature,sizeof(tickdata->signature));
    memcpy(pubkey,computors->publicKeys[computorIndex],sizeof(pubkey));
    if ( verify(pubkey,sigcheck,sig) != 0 )
    {
        //printf("process tickdata %d GOOD SIG! computor.%d\n",tickdata->tick,computorIndex);
        sprintf(fname,"epochs%c%d%c%d",dir_delim(),EPOCH,dir_delim(),tickdata->tick);
        if ( (fp= fopen(fname,"wb")) != 0 )
        {
            fwrite(tickdata,1,sizeof(*tickdata),fp);
            fclose(fp);
        }
    }
    //else printf("process tickdata %d sig error computor.%d\n",tickdata->tick,computorIndex);
}

void process_issued(int32_t peerid,char *ipaddr,RespondIssuedAssets *issued)
{
    
}

void process_owned(int32_t peerid,char *ipaddr,RespondOwnedAssets *owned)
{
    
}

void process_possessed(int32_t peerid,char *ipaddr,RespondPossessedAssets *possessed)
{
    
}

int32_t process_response(int32_t *savedtxp,FILE *fp,Computors *computors,int32_t peerid,char *ipaddr,struct quheader *H,void *data,int32_t datasize)
{
    switch ( H->_type )
    {
        case EXCHANGE_PUBLIC_PEERS:         if ( datasize != sizeof(ExchangePublicPeers) ) return(-1);
            process_publicpeers(peerid,ipaddr,(ExchangePublicPeers *)data);
            break;
        case BROADCAST_COMPUTORS:           if ( datasize != sizeof(Computors) ) return(-1);
            process_computors(peerid,ipaddr,(Computors *)data);
            break;
        case BROADCAST_TICK:                if ( datasize != sizeof(Tick) ) return(-1);
            process_quorumdata(peerid,ipaddr,(Tick *)data,computors);
            break;
        case BROADCAST_FUTURE_TICK_DATA:    if ( datasize > sizeof(TickData) ) return(-1);
            process_tickdata(peerid,ipaddr,(TickData *)data,computors);
            break;
        case BROADCAST_TRANSACTION:         if ( datasize < sizeof(Transaction) ) return(-1);
            process_transaction(savedtxp,fp,peerid,ipaddr,(Transaction *)data,datasize);
            break;
        case RESPOND_CURRENT_TICK_INFO:     if ( datasize != sizeof(CurrentTickInfo) ) return(-1);
            process_tickinfo(peerid,ipaddr,(CurrentTickInfo *)data);
            break;
        case RESPOND_ENTITY:                if ( datasize != sizeof(RespondedEntity) ) return(-1);
            process_entity(peerid,ipaddr,(RespondedEntity *)data);
            break;
        case RESPOND_ISSUED_ASSETS:         if ( datasize != sizeof(RespondIssuedAssets) ) return(-1);
            process_issued(peerid,ipaddr,(RespondIssuedAssets *)data);
            break;
        case RESPOND_OWNED_ASSETS:          if ( datasize != sizeof(RespondOwnedAssets) ) return(-1);
            process_owned(peerid,ipaddr,(RespondOwnedAssets *)data);
            break;
        case RESPOND_POSSESSED_ASSETS:      if ( datasize != sizeof(RespondPossessedAssets) ) return(-1);
            process_possessed(peerid,ipaddr,(RespondPossessedAssets *)data);
            break;
        case REQUEST_SYSTEM_INFO: // we are not server
            break;
        //case PROCESS_SPECIAL_COMMAND:       if ( datasize != sizeof() ) return(-1);
        default: printf("%s unknown type.%d sz.%d\n",ipaddr,H->_type,datasize);
            break;
    }
    //printf("peerid.%d got %d cmd.%d from %s\n",peerid,datasize,H->_type,ipaddr);
    return(0);
}

int32_t updateticks(char *ipaddr,int32_t sock)
{
    int32_t i,tick,n,numsent,firsttick,numticks,offset,ind;
    if ( Numpeers == 0 )
        return(sock);
    ind = (rand() % Numpeers);
    firsttick = (VALIDATED_TICK > INITIAL_TICK) ? VALIDATED_TICK : INITIAL_TICK-1;
    numticks = (LATEST_TICK - firsttick);
    n = 10 * numticks / Numpeers;
    if ( n < 676 )
        n = 676;
    numsent = 0;
    if ( VALIDATED_TICK == 0 )
        sock = updatetick(&numsent,INITIAL_TICK,ipaddr,sock);
    else sock = updatetick(&numsent,VALIDATED_TICK+1,ipaddr,sock);
    if ( HAVE_TXTICK == 0 )
        sock = updateticktx(INITIAL_TICK,ipaddr,sock);
    else
        sock = updateticktx(HAVE_TXTICK+1,ipaddr,sock);
    if ( LATEST_TICK - VALIDATED_TICK < 30 )
    {
        for (tick=VALIDATED_TICK+2; tick<=LATEST_TICK; tick++)
            sock = updatetick(&numsent,tick,ipaddr,sock);
    }
    else
    {
        for (i=0; i<n; i++)
        {
            tick = firsttick + i*Numpeers + ind + 1;
            if ( tick > LATEST_TICK+2 )
                break;
            sock = updatetick(&numsent,tick,ipaddr,sock);
            if ( numsent > QUORUM_FETCHWT )
                break;
        }
    }
    if ( numsent < TX_FETCHWT )
    {
        firsttick = (HAVE_TXTICK > INITIAL_TICK) ? HAVE_TXTICK : INITIAL_TICK-1;
        for (i=0; i<n && numsent<TX_FETCHWT; i++)
        {
            tick = firsttick + i*Numpeers + ind + 1;
            if ( tick > LATEST_TICK+2 )
                break;
            offset = (tick - INITIAL_TICK);
            if ( offset >= 0 && offset < MAXTICKS && RAMQ[offset].needtx != 0 )
            {
                sock = updateticktx(tick,ipaddr,sock);
                numsent++;
            }
        }
    }
    return(sock);
}

void peertxfname(char *fname,char *ipaddr)
{
    sprintf(fname,"epochs%c%d%ctx%c%s",dir_delim(),EPOCH,dir_delim(),dir_delim(),ipaddr);
}

void *peerthread(void *_ipaddr)
{
    char *ipaddr = _ipaddr;
    struct EntityRequest E;
    Computors computors;
    FILE *fp;
    char fname[512],addr[64];
    int32_t peerid,sock=-1,i,savedtx,ptr,sz,recvbyte,prevutime,prevtick,iter,bufsize,hascomputors;
    struct quheader H;
    struct addrhash *ap;
    uint8_t *buf;
    signal(SIGPIPE, SIG_IGN);
    bufsize = 4096 * 1024;
    buf = calloc(1,bufsize);
    peerid = prevutime = prevtick = iter = hascomputors = 0;
    while ( iter++ < 10 )
    {
        if ( (sock= myconnect(ipaddr,DEFAULT_NODE_PORT)) < 0 )
        {
            //printf("iter.%d peerthread error connecting to %s\n",iter,ipaddr);
        }
        else break;
    }
    if ( iter >= 10 )
        return(0);
    pthread_mutex_lock(&addpeer_mutex);
    if ( Numpeers < MAXPEERS-1 ) // nonzero peerid wastes a slot but no big loss
    {
        Numpeers++;
        peerid = Numpeers;
    }
    else
    {
        printf("maxpeers %d reached\n",Numpeers);
        pthread_mutex_unlock(&addpeer_mutex);
        return(0);
    }
    pthread_mutex_unlock(&addpeer_mutex);
    strcpy(Peertickinfo[peerid].ipaddr,ipaddr);
    peertxfname(fname,ipaddr);
    if ( (fp= fopen(fname,"rb+")) != 0 )
        fseek(fp,0,SEEK_END);
    else fp = fopen(fname,"wb");
    printf("connected.%d peerthread %s\n",Numpeers,ipaddr);
    H = quheaderset(REQUEST_CURRENT_TICK_INFO,sizeof(H));
    sock = socksend(ipaddr,sock,(uint8_t *)&H,sizeof(H));
    while ( 1 )
    {
        if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
            break;
        if ( hascomputors == 0 && has_computors(&computors,ipaddr) <= 0 )
        {
            H = quheaderset(REQUEST_COMPUTORS,sizeof(H));
            sock = socksend(ipaddr,sock,(uint8_t *)&H,sizeof(H));
        } else hascomputors = 1;
        savedtx = 0;
        while ( (recvbyte= receiveall(sock,buf,bufsize)) > 0 )
        {
            ptr = 0;
            sz = 1;
            while ( ptr < recvbyte && sz != 0 && sz < recvbyte )
            {
                memcpy(&H,&buf[ptr],sizeof(H));
                sz = ((H._size[2] << 16) + (H._size[1] << 8) + H._size[0]);
                //for (int j=0; j<sz; j++)
                //    printf("%02x",buf[ptr+j]);
                //printf(" %s received %d H.(%d %d bytes)\n",ipaddr,recvbyte,H._type,sz);
                if ( sz < 1 || sz > recvbyte-ptr )
                {
                    //printf("illegal sz.%d vs recv.%d ptr.%d type.%d\n",sz,recvbyte,ptr,H._type);
                    break;
                }
                if ( H._type == 35 && sz == sizeof(H) )
                {
                }
                else
                {
                    if ( process_response(&savedtx,fp,&computors,peerid,ipaddr,&H,&buf[ptr + sizeof(H)],sz - sizeof(H)) < 0 )
                    {
                        //printf("peerid.%d Error processing H.type %d size.%ld\n",peerid,H._type,sz - sizeof(H));
                    }
                }
                ptr += sz;
            }
        }
        if ( fp != 0 && savedtx != 0 )
            fflush(fp);
        if ( Peertickinfo[peerid].packetlen != 0 )
        {
            printf("%s sends packet[%d]\n",ipaddr,Peertickinfo[peerid].packetlen);
            sock = socksend(ipaddr,sock,Peertickinfo[peerid].packet,Peertickinfo[peerid].packetlen);
            Peertickinfo[peerid].packetlen = 0;
        }
        if ( EXITFLAG == 0 && LATEST_UTIME > prevutime )
        {
            if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
                break;
            prevutime = LATEST_UTIME;
            H = quheaderset(REQUEST_CURRENT_TICK_INFO,sizeof(H));
            sock = socksend(ipaddr,sock,(uint8_t *)&H,sizeof(H));
            sock = updateticks(ipaddr,sock);
        }
        if ( LATEST_TICK > prevtick )
        {
            prevtick = LATEST_TICK;
        } else usleep(5000);
    }
    if ( sock >= 0 )
        close(sock);
    if ( fp != 0 )
        fclose(fp);
    printf("%s exits thread\n",ipaddr);
    return(0);
}

int32_t loadqtx(long *fposp,FILE *fp)
{
    int32_t txlen,retval = -1;
    char txidstr[64];
    struct qubictx *qtx;
    uint8_t txid[32],cmptxid[32],txdata[MAX_INPUT_SIZE*2];
    if ( fread(&txlen,1,sizeof(txlen),fp) != sizeof(txlen) )
    {
        //printf("error reading txlen at pos %ld\n",*fposp);
    }
    else if ( txlen < sizeof(txdata) )
    {
        if ( fread(txid,1,sizeof(txid),fp) != sizeof(txid) )
        {
            //printf("error reading txid at pos %ld\n",*fposp);
        }
        else if ( fread(txdata,1,txlen,fp) != txlen )
        {
            //printf("error reading txdata at pos %ld\n",*fposp);
        }
        else
        {
            KangarooTwelve(txdata,txlen,cmptxid,32);
            getTxHashFromDigest(txid,txidstr);
            txidstr[60] = 0;
            if ( memcmp(txid,cmptxid,sizeof(txid)) == 0 )
            {
                *fposp = ftell(fp);
                HASH_FIND(hh,TXIDS,txid,sizeof(qtx->txid),qtx);
                if ( qtx == 0 )
                {
                    _qubictxadd(txid,txdata,txlen);
                    retval = 1;
                } else retval = 0;
            }
            //else printf("error comparing %s at pos %ld\n",txidstr,*fposp);
        }
    }
    //else
    //    printf("illegal txlen.%d pos %ld\n",txlen,*fposp);
    return(retval);
}

int32_t havealltx(int32_t tick) // negative means error, 0 means file exists, 1 means file created
{
    char fname[512],txidstr[64];
    uint8_t zero[32];
    FILE *fp;
    TickData TD;
    struct qubictx *qtx,*ptrs[NUMBER_OF_TRANSACTIONS_PER_TICK];
    int32_t i,sz,numtx,haveQ;
    Tick T;
    sprintf(fname,"epochs%c%d%c%d.T",dir_delim(),EPOCH,dir_delim(),tick);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        fclose(fp);
        return(0);
    }
    sprintf(fname,"epochs%c%d%c%d.Q",dir_delim(),EPOCH,dir_delim(),tick);
    haveQ = 0;
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        while ( fread(&T,1,sizeof(T),fp) == sizeof(T) )
        {
            if ( T.tick == tick )
            {
                haveQ = 1;
                break;
            }
        }
        fclose(fp);
        if ( haveQ != 0 )
        {
            memset(zero,0,sizeof(zero));
            if ( memcmp(T.transactionDigest,zero,32) == 0 )
            {
                //printf("empty tick.%d\n",tick);
                sprintf(fname,"epochs%c%d%c%d",dir_delim(),EPOCH,dir_delim(),tick);
                if ( (fp= fopen(fname,"wb")) != 0 )
                {
                    fwrite(zero,1,sizeof(zero),fp);
                    fclose(fp);
                }
                return(0);
            }
        }
    }
    sprintf(fname,"epochs%c%d%c%d",dir_delim(),EPOCH,dir_delim(),tick);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        if ( (sz= (int32_t)fread(&TD,1,sizeof(TD),fp)) == 32 ) // empty tick
        {
            fclose(fp);
            return(0);
        }
        fclose(fp);
        if ( sz == sizeof(TD) )
        {
            memset(ptrs,0,sizeof(ptrs));
            memset(zero,0,sizeof(zero));
            for (numtx=i=0; i<NUMBER_OF_TRANSACTIONS_PER_TICK; i++)
            {
                if ( memcmp(zero,TD.transactionDigests[i],sizeof(zero)) != 0 )
                {
                    qtx = qubictxhash(TD.transactionDigests[i],0,0);
                    if ( qtx != 0 )
                        ptrs[numtx++] = qtx;
                    else
                    {
                        getTxHashFromDigest(TD.transactionDigests[i],txidstr);
                        txidstr[60] = 0;
                        //printf("tick.%d missing txi.%d after numtx.%d %s\n",tick,i,numtx,txidstr);
                        return(-2);
                    }
                }
            }
            if ( numtx == 0 )
                return(0);
            sprintf(fname,"epochs%c%d%c%d.T",dir_delim(),EPOCH,dir_delim(),tick);
            if ( (fp= fopen(fname,"wb")) == 0 )
                return(-3);
            for (i=0; i<numtx; i++)
            {
                if ( (qtx= ptrs[i]) == 0 )
                    break;
                if ( fwrite(&qtx->txlen,1,sizeof(qtx->txlen),fp) != sizeof(qtx->txlen) )
                    break;
                if ( fwrite(qtx->txid,1,sizeof(qtx->txid),fp) != sizeof(qtx->txid) )
                    break;
                if ( fwrite(qtx->txdata,1,qtx->txlen,fp) != qtx->txlen )
                    break;
            }
            fclose(fp);
            if ( i != numtx )
            {
                deletefile(fname);
                return(-4);
            }
        }
        else
            return(-5);
    }
    return(-1);
}

int32_t init_txids(void)
{
    char fname[512],line[512],cmd[1024],*ptr;
    FILE *fp,*fp2;
    long fpos;
    int32_t retval,numfiles = 0,numadded = 0;
    sprintf(cmd,"ls -l epochs%c%d%ctx > txfiles",dir_delim(),EPOCH,dir_delim());
    //sprintf(cmd,"ls -w 16 epochs%c%d%ctx > txfiles",dir_delim(),EPOCH,dir_delim());
    system(cmd);
    printf("%s\n",cmd);
    if ( (fp= fopen("txfiles","r")) != 0 )
    {
        while ( fgets(line,sizeof(line),fp) != 0 )
        {
            ptr = &line[strlen(line)-1];
            *ptr = 0;
            while ( ptr > line && ptr[-1] != ' ' )
                ptr--;
            printf("(%s) [%s]\n",line,ptr);
            sprintf(fname,"epochs%c%d%ctx%c%s",dir_delim(),EPOCH,dir_delim(),dir_delim(),ptr);
            if ( (fp2= fopen(fname,"rb")) != 0 )
            {
                numfiles++;
                fpos = 0;
                while ( 1 )
                {
                    if ( (retval= loadqtx(&fpos,fp2)) < 0 )
                        break;
                    else numadded += (retval != 0);
                }
                fclose(fp2);
            }
        }
        fclose(fp);
    }
    printf("added %d txids from %d files\n",numadded,numfiles);
    return(numadded);
}

void update_txids(void) // single threaded
{
    int32_t offset,tick,retval,missed = 0;
    if ( HAVE_TXTICK < VALIDATED_TICK )
    {
        if ( HAVE_TXTICK == 0 )
            tick = INITIAL_TICK;
        else tick = HAVE_TXTICK+1;
        for (; tick<=VALIDATED_TICK; tick++)
        {
            if ( (retval= havealltx(tick)) >= 0 ) // negative means error, 0 means file exists, 1 means file created
            {
                if ( missed == 0 )
                {
                    PROGRESSTIME = LATEST_UTIME;
                    EXITFLAG = 0;
                    HAVE_TXTICK = tick;
                }
                //else printf("havealltx gap.%d\n",tick - HAVE_TXTICK);
            }
            else
            {
                offset = (tick - INITIAL_TICK);
                if ( offset >= 0 && offset < MAXTICKS )
                    RAMQ[offset].needtx = 1;
                missed++;
                //printf("retval.%d for tick.%d\n",retval,tick);
            }
        }
    }
}

void *dataloop(void *_ignore)
{
    uint32_t prevutime = 0;
    printf("dataloop STARTED\n");
    while ( 1 )
    {
        if ( LATEST_UTIME > prevutime )
        {
            prevutime = LATEST_UTIME;
            update_txids();
        }
        usleep(10000);
        if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
            break;
    }
    printf("dataloop exits\n");
    return(0);
}

void *validateloop(void *_ignore)
{
    int32_t latest = 0;
    printf("validateloop STARTED\n");
    while ( 1 )
    {
        if ( LATEST_TICK > latest )
        {
            latest = LATEST_TICK;
            update_validated();
        }
        sleep(1);
        if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
            break;
    }
    printf("validateloop exits\n");
    return(0);
}

int main(int argc, const char * argv[])
{
    pthread_t findpeers_thread,dataloop_thread,validate_thread;
    uint32_t utime,newepochflag = 0;
    int32_t year,month,day,seconds,latest = 0;
    signal(SIGPIPE, SIG_IGN);
    devurandom((uint8_t *)&utime,sizeof(utime));
    srand(utime);
    utime = set_current_ymd(&year,&month,&day,&seconds);
    EPOCH = utime_to_epoch(utime,&seconds);
    if ( argc == 2 )
        makevanity((char *)argv[1]);
    init_txids();
    makedir((char *)"epochs");
    makedir((char *)"subs");
    makedir((char *)"addrs");
    newepoch();
    RAMQ = (void *)calloc(MAXTICKS,sizeof(*RAMQ));
    //pthread_mutex_init(&conn_mutex,NULL);
    pthread_mutex_init(&txid_mutex,NULL);
    pthread_mutex_init(&addpeer_mutex,NULL);
    pthread_create(&findpeers_thread,NULL,&findpeers,0);
    pthread_create(&dataloop_thread,NULL,&dataloop,0);
    pthread_create(&validate_thread,NULL,&validateloop,0);
    while ( 1 )
    {
        if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
            break;
        usleep(100000);
        utime = set_current_ymd(&year,&month,&day,&seconds);
        if ( utime > LATEST_UTIME )
        {
            LATEST_UTIME = utime;
            if ( newepochflag != 0 && utime > newepochflag+90 && EXITFLAG == 0 )
                EXITFLAG = utime + 30;
        }
        if ( LATEST_TICK > latest )
        {
            latest = LATEST_TICK;
            printf("LATEST.%d, VALIDATED.%d HAVETX.%d lag.%d lagv.%d\n",latest,VALIDATED_TICK,HAVE_TXTICK,latest-HAVE_TXTICK,VALIDATED_TICK-HAVE_TXTICK);
            if ( newepochflag == 0 && utime_to_epoch(utime,&seconds) != EPOCH )
            {
                printf("EPOCH change detected %d -> %d\n",EPOCH,utime_to_epoch(utime,&seconds));
                newepoch();
                newepochflag = utime;
            }
            if ( EXITFLAG == 0 && VALIDATED_TICK != 0 && LATEST_UTIME > PROGRESSTIME+300 )
            {
                printf("tick.%d stuck for %d seconds, start exit %d\n",LATEST_TICK,LATEST_UTIME - PROGRESSTIME,EXITFLAG);
                EXITFLAG = LATEST_UTIME + 30;
                qpurge(VALIDATED_TICK+1);
                if ( HAVE_TXTICK != 0 )
                    qpurge(HAVE_TXTICK+1);
            }
        }
    }
    sleep(15);
    printf("qarchiver exiting\n");
}

