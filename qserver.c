


#define QSERVER

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

#include "qshared/K12AndKeyUtil.h"
#include "qshared/qdefines.h"
#include "qshared/qstructs.h"
#include "qshared/qkeys.c"
#include "qshared/qhelpers.c"
#include "qshared/qtime.c"

#include "qconn.c"
#include "qpeers.c"

struct addrhash *Addresses;
pthread_mutex_t qpubreq_mutex;
struct qpubreq *REQS;

struct qpubreq *qpubreq_add(char *addr)
{
    uint8_t pubkey[32];
    struct qpubreq *rp;
    rp = (struct qpubreq *)calloc(1,sizeof(*rp));
    rp->H = quheaderset(REQUEST_ENTITY,sizeof(rp->H) + sizeof(rp->pubkey));
    addr2pubkey(addr,rp->pubkey);
    pthread_mutex_lock(&qpubreq_mutex);
    DL_APPEND(REQS,rp);
    pthread_mutex_unlock(&qpubreq_mutex);
    return(rp);
}

struct qpubreq *qpubreq_poll(char *ipaddr,char *prevaddr)
{
    struct qpubreq *rp;
    char addr[64];
    pthread_mutex_lock(&qpubreq_mutex);
    if ( (rp= REQS) != 0 )
    {
        pubkey2addr(rp->pubkey,addr);
        if ( strcmp(prevaddr,addr) != 0 )
        {
            DL_DELETE(REQS,rp);
            strcpy(prevaddr,addr);
        }
        else rp = 0;
    }
    pthread_mutex_unlock(&qpubreq_mutex);
    return(rp);
}

int32_t flushaddress(struct addrhash *ap,int64_t *sentp,int64_t *recvp,long *fposp)
{
    FILE *fp;
    int32_t firstflag,retval = 0;
    char fname[512],addr[64];
    *sentp = *recvp = 0;
    *fposp = -1;
    if ( ap->flushtick < ap->tick || *(uint64_t *)ap->merkleroot != ap->flushmerkle64 || ap->prevsent != ap->entity.outgoingAmount || ap->prevrecv != ap->entity.incomingAmount )
    {
        pubkey2addr(ap->entity.publicKey,addr);
        sprintf(fname,"addrs%c%s",dir_delim(),addr);
        if ( (fp= fopen(fname,"rb+")) != 0 )
            fseek(fp,0,SEEK_END);
        else fp = fopen(fname,"wb");
        if ( fp != 0 )
        {
            *fposp = ftell(fp);
            fwrite(ap,1,sizeof(ap->entity)+40,fp);
            fclose(fp);
            if ( ap->flushtick == 0 )
                firstflag = 1;
            else firstflag = 0;
            ap->flushtick = ap->tick;
            ap->flushmerkle64 = *(uint64_t *)ap->merkleroot;
            if ( ap->prevrecv != ap->entity.incomingAmount )
            {
                if ( firstflag == 0 )
                {
                    retval |= 2;
                    *recvp = (ap->entity.incomingAmount - ap->prevrecv);
                    printf("%s received %s\n",addr,amountstr(ap->entity.incomingAmount - ap->prevrecv));
                }
                ap->prevrecv = ap->entity.incomingAmount;
            }
            if ( ap->prevsent != ap->entity.outgoingAmount )
            {
                if ( firstflag == 0 )
                {
                    retval |= 4;
                    *sentp = (ap->entity.outgoingAmount - ap->prevsent);
                    printf("%s sent %s\n",addr,amountstr(ap->entity.outgoingAmount - ap->prevsent));
                }
                ap->prevsent = ap->entity.outgoingAmount;
            }
            return(retval | 1);
        }
    }
    return(0);
}

struct addrhash *Addresshash(uint8_t pubkey[32],uint32_t utime)
{
    uint64_t hashi;
    int32_t i;
    uint8_t zero[32];
    struct addrhash *ap;
    hashi = *(uint64_t *)&pubkey[8] % MAXADDRESSES;
    memset(zero,0,sizeof(zero));
    for (i=0; i<MAXADDRESSES; i++)
    {
        ap = &Addresses[(hashi + i) % MAXADDRESSES];
        if ( memcmp(ap->entity.publicKey,pubkey,32) == 0 )
            return(ap);
        if ( ap->tick == 0 )
        {
            memcpy(ap->entity.publicKey,pubkey,32);
            ap->tick = 1;
            return(ap);
        }
    }
    printf("hash table full\n");
    return(0);
}

void process_entity(int32_t peerid,char *ipaddr,RespondedEntity *E)
{
    struct addrhash *ap;
    long fpos;
    int64_t sent,recv;
    if ( (ap= Addresshash(E->entity.publicKey,0)) != 0 )
    {
        char addr[64];
        pubkey2addr(E->entity.publicKey,addr);
        //for (int j=0; j<32; j++)
        //    printf("%02x",E->entity.publicKey[j]);
        sent = recv = 0;
        if ( E->tick > ap->tick )
        {
            memcpy(&ap->entity,&E->entity,sizeof(ap->entity));
            ap->tick = E->tick;
            merkleRoot(SPECTRUM_DEPTH,E->spectrumIndex,(uint8_t *)&ap->entity,sizeof(ap->entity),&E->siblings[0][0],ap->merkleroot);
            flushaddress(ap,&sent,&recv,&fpos);
        }
        printf(" %s got entity %s %s tick.%d vs %d LATEST.%d sent %s recv %s\n",ipaddr,addr,amountstr(E->entity.incomingAmount - E->entity.outgoingAmount),E->tick,ap->tick,LATEST_TICK,amountstr2(sent),amountstr3(recv));
    } else printf("unexpected entity data without address?\n");
}

int32_t process_response(int32_t *savedtxp,FILE *fp,Computors *computors,int32_t peerid,char *ipaddr,struct quheader *H,void *data,int32_t datasize)
{
    switch ( H->_type )
    {
        case EXCHANGE_PUBLIC_PEERS:         if ( datasize != sizeof(ExchangePublicPeers) ) return(-1);
            process_publicpeers(peerid,ipaddr,(ExchangePublicPeers *)data);
            break;
        case RESPOND_CURRENT_TICK_INFO:     if ( datasize != sizeof(CurrentTickInfo) ) return(-1);
            process_tickinfo(peerid,ipaddr,(CurrentTickInfo *)data);
            break;
        case RESPOND_ENTITY:                if ( datasize != sizeof(RespondedEntity) ) return(-1);
            process_entity(peerid,ipaddr,(RespondedEntity *)data);
            break;
        default: printf("%s unknown type.%d sz.%d\n",ipaddr,H->_type,datasize);
            break;
    }
    //printf("peerid.%d got %d cmd.%d from %s\n",peerid,datasize,H->_type,ipaddr);
    return(0);
}

void *peerthread(void *_ipaddr)
{
    char *ipaddr = _ipaddr;
    struct EntityRequest E;
    Computors computors;
    FILE *fp = 0;
    struct qpubreq *rp;
    char fname[512],addr[64],prevaddr[64];
    int32_t peerid,sock=-1,i,savedtx,ptr,sz,recvbyte,prevutime,prevtick,iter,bufsize;
    struct quheader H;
    struct addrhash *ap;
    uint8_t *buf;
    signal(SIGPIPE, SIG_IGN);
    bufsize = 4096 * 1024;
    buf = calloc(1,bufsize);
    peerid = prevutime = prevtick = iter = 0;
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
    printf("connected.%d peerthread %s\n",Numpeers,ipaddr);
    while ( 1 )
    {
        if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
            break;
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
        if ( Peertickinfo[peerid].packetlen != 0 )
        {
            printf("%s sends packet[%d]\n",ipaddr,Peertickinfo[peerid].packetlen);
            sock = socksend(ipaddr,sock,Peertickinfo[peerid].packet,Peertickinfo[peerid].packetlen);
            Peertickinfo[peerid].packetlen = 0;
        }
        else if ( Peertickinfo[peerid].info.tick > LATEST_TICK-60 && (rp= qpubreq_poll(ipaddr,prevaddr)) != 0 )
        {
            sock = socksend(ipaddr,sock,(uint8_t *)&rp->H,sizeof(rp->H) + sizeof(rp->pubkey));
            free(rp);
        }
        if ( EXITFLAG == 0 && LATEST_UTIME > prevutime )
        {
            if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
                break;
            prevutime = LATEST_UTIME;
            H = quheaderset(REQUEST_CURRENT_TICK_INFO,sizeof(H));
            sock = socksend(ipaddr,sock,(uint8_t *)&H,sizeof(H));
        }
        if ( LATEST_TICK > prevtick )
        {
            prevtick = LATEST_TICK;
        } else usleep(10000);
    }
    if ( sock >= 0 )
        close(sock);
    printf("%s exits thread\n",ipaddr);
    return(0);
}

void *fifoloop(void *ignore)
{
    FILE *fp;
    int32_t len,packetlen;
    uint8_t pubkey[32],packet[MAX_INPUT_SIZE*2];
    char line[8192*16];
    while ( 1 )
    {
        FILE *fp = fopen("Qserver", "r");
        if ( fp != 0 )
        {
            if ( fgets(line,sizeof(line)-1,fp) != 0 )
            {
                len = strlen(line);
                if ( line[len-1] == '\n' )
                    line[--len] = 0;
                if ( addr2pubkey(line,pubkey) > 0 )
                {
                    qpubreq_add(line);
                }
                else if ( ishexstr(line) != 0 )
                {
                    packetlen = strlen(line)/2;
                    hexToByte(line,packet,packetlen);
                    peerbroadcast(packet,packetlen);
                }
                else printf("error %s\n",line);
            }
            fclose(fp);
        }
        if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
            break;
        usleep(100000);
    }
    printf("fifo loop exiting\n");
    return(0);
}

int32_t scansub(char *subaddr)
{
    FILE *fp;
    char fname[512],addr[64];
    int32_t n,index;
    uint8_t subpubs[MAX_INDEX][32],zero[32];
    memset(zero,0,sizeof(zero));
    sprintf(fname,"subs%c%s",dir_delim(),subaddr);
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
                qpubreq_add(addr);
                n++;
            }
        }
    }
    return(n);
}

int32_t scansubs(void)
{
    int32_t i,n = 0;
    char cmd[512],line[512],*ptr;
    FILE *fp;
    system("ls -l subs > subscribers");
    if ( (fp= fopen("subscribers","r")) != 0 )
    {
        while ( fgets(line,sizeof(line),fp) != 0 )
        {
            ptr = &line[strlen(line)-1];
            *ptr = 0;
            while ( ptr > line && ptr[-1] != ' ' )
                ptr--;
            printf("(%s) [%s]\n",line,ptr);
            n += scansub(ptr);
        }
        fclose(fp);
    }
    return(n);
}

int main(int argc, const char * argv[])
{
    pthread_t findpeers_thread,fifoloop_thread;
    uint32_t utime = 0;
    int32_t year,month,day,seconds,newepochflag = 0,latest = 0;
    devurandom((uint8_t *)&utime,sizeof(utime));
    srand(utime);
    makedir((char *)"subs");
    makedir((char *)"addrs");
    signal(SIGPIPE, SIG_IGN);
    Addresses = (struct addrhash *)calloc(MAXADDRESSES,sizeof(*Addresses));
    pthread_mutex_init(&qpubreq_mutex,NULL);
    pthread_mutex_init(&addpeer_mutex,NULL);
    
    pthread_create(&findpeers_thread,NULL,&findpeers,0);
    pthread_create(&fifoloop_thread,NULL,&fifoloop,0);
    latest = 0;
    while ( 1 )
    {
        if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
            break;
        utime = set_current_ymd(&year,&month,&day,&seconds);
        if ( EPOCH == 0 )
            EPOCH = utime_to_epoch(utime,&seconds);
        if ( utime > LATEST_UTIME )
        {
            LATEST_UTIME = utime;
            if ( newepochflag != 0 && utime > newepochflag+90 && EXITFLAG == 0 )
                EXITFLAG = utime + 30;
        }
        if ( LATEST_TICK > latest )
        {
            latest = LATEST_TICK;
            scansubs();
            if ( newepochflag == 0 && utime_to_epoch(utime,&seconds) != EPOCH )
            {
                printf("EPOCH change detected %d -> %d\n",EPOCH,utime_to_epoch(utime,&seconds));
                newepoch();
                newepochflag = utime;
            }
        }
        usleep(100000);
    }
    sleep(15);
    printf("qserver exiting\n");
}

