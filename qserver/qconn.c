
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <errno.h>


char Newpeers[64][16];
int32_t Numnewpeers,Numpeers,Entitydata;
pthread_mutex_t addpeer_mutex;
struct qpeer Peertickinfo[MAXPEERS];
uint32_t BIDvu[MAXPEERS][NUMASSETS],ASKvu[MAXPEERS][NUMASSETS];
int32_t BIDvutick[MAXPEERS][NUMASSETS],ASKvutick[MAXPEERS][NUMASSETS];
#define QUOTEVU_TIMEOUT 30  // number of ticks after BID/ASKvutick to reissue


int myconnect(const char *nodeIp,int nodePort)
{
    int serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    struct timeval tv;
    tv.tv_sec = 0;
    tv.tv_usec = 300000;
    setsockopt(serverSocket, SOL_SOCKET, SO_RCVTIMEO, (const char *)&tv, sizeof tv);
    tv.tv_sec = 1;
    tv.tv_usec = 0;
    setsockopt(serverSocket, SOL_SOCKET, SO_SNDTIMEO, (const char *)&tv, sizeof tv);
    struct sockaddr_in addr;
    memset((char*)&addr,0,sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(nodePort);
    if ( inet_pton(AF_INET,nodeIp,&addr.sin_addr) <= 0 )
    {
        printf("Error translating command line ip address to usable one. (%s)",nodeIp);
        return -1;
    }
    //pthread_mutex_lock(&conn_mutex);
    if ( connect(serverSocket,(const struct sockaddr *)&addr,sizeof(addr)) < 0 )
    {
        //pthread_mutex_unlock(&conn_mutex);
        //LOG("Failed to connect %s\n", nodeIp);
        return -1;
    }
    //pthread_mutex_unlock(&conn_mutex);
    return(serverSocket);
}

int32_t receiveall(int32_t sock,uint8_t *recvbuf,int32_t maxsize)
{
    uint8_t tmp[4096];
    int32_t received=0,recvbyte;
    recvbyte = (int32_t)recv(sock,(char *)tmp,sizeof(tmp),0);
    while ( recvbyte > 0 )
    {
        if ( received + recvbyte > maxsize )
        {
            //printf("receiveall past maxsize.%d received.%d + recvbyte.%d\n",maxsize,received,recvbyte);
            memcpy(&recvbuf[received],tmp,maxsize-received);
            return(maxsize);
        }
        memcpy(&recvbuf[received],tmp,recvbyte);
        received += recvbyte;
        recvbyte = (int32_t)recv(sock,(char *)tmp,sizeof(tmp),0);
    }
    return(received);
}

int32_t sendbuffer(int32_t sock,uint8_t *buffer,int sz)
{
    int size = sz;
    int numberOfBytes;
    if ( sz <= 0 )
        return(sz);
    while ( size )
    {
        if ( (numberOfBytes= (int32_t)send(sock,(char*)buffer,size,0)) <= 0 )
        {
            //printf("error sending %d bytes errno.%d\n",sz,errno);
            return(numberOfBytes);
        }
        //for (int i=0; i<sz; i++)
        //    printf("%02x",buffer[i]);
        //printf(" send %d of %d\n",numberOfBytes,sz);
        buffer += numberOfBytes;
        size -= numberOfBytes;
    }
    return(sz - size);
}

void *reqresponse(uint8_t *recvbuf,int32_t recvsize,int32_t sock,int32_t type,uint8_t *request,int32_t reqlen,int32_t resptype)
{
    struct quheader H;
    int32_t sendvu,sz,recvbyte,ptr = 0;
    *(struct quheader *)request = quheaderset(type,reqlen);
    sendbuffer(sock,request,reqlen);
    memset(recvbuf,0,recvsize);
    sendvu = ((struct quheader *)request)->_dejavu;
    if ( (recvbyte= receiveall(sock,recvbuf,recvsize)) > 0 )
    {
        while ( ptr < recvbyte )
        {
            memcpy(&H,&recvbuf[ptr],sizeof(H));
            sz = ((H._size[2] << 16) + (H._size[1] << 8) + H._size[0]);
            //printf("%x received %d, size.%d type.%d\n",H._dejavu,recvbyte,sz,H._type);
            if ( H._dejavu == sendvu )//H._type == resptype )
            {
                return(&recvbuf[ptr + sizeof(H)]);
            }
            ptr += sz;
        }
    }
    return(0);
}

int32_t socksend(char *ipaddr,int32_t sock,uint8_t *buf,int32_t len)
{
    int32_t retval;
    if ( (retval= sendbuffer(sock,buf,len)) <= 0 )
    {
        if ( errno != 32 )
            printf("%s error %d from socket %d, get new one errno.%d\n",ipaddr,retval,sock,errno);
        close(sock);
        while ( (sock= myconnect(ipaddr,DEFAULT_NODE_PORT)) < 0 )
            sleep(5);
        //printf("%s got new sock.%d\n",ipaddr,sock);
        if ( (retval= sendbuffer(sock,buf,len)) <= 0 )
        {
            printf("second error %d socksend errno.%d\n",retval,errno);
        }
    }
    return(sock);
}

void addnewpeer(char *ipaddr)
{
    int32_t i,flag = 0;
    pthread_mutex_lock(&addpeer_mutex);
    for (i=0; i<(sizeof(Peers)/sizeof(*Peers)); i++)
        if ( strcmp(ipaddr,Peers[i]) == 0 )
        {
            flag = 1;
            break;
        }
    for (i=0; i<Numnewpeers; i++)
        if ( strcmp(ipaddr,Newpeers[i]) == 0 )
        {
            flag = 1;
            break;
        }
    if ( flag == 0 )
    {
        strcpy(Newpeers[i],ipaddr);
        //printf("Newpeer.%d %s\n",Numnewpeers,ipaddr);
        Numnewpeers++;
    }
    pthread_mutex_unlock(&addpeer_mutex);
}

int32_t peerbroadcast(uint8_t *packet,int32_t packetlen)
{
    int32_t peerid,n = 0;
    for (peerid=0; peerid<Numpeers; peerid++)
    {
        if ( Peertickinfo[peerid].info.tick > LATEST_TICK-100 && Peertickinfo[peerid].packetlen == 0 )
        {
            memcpy(Peertickinfo[peerid].packet,packet,packetlen);
            Peertickinfo[peerid].packetlen = packetlen;
            n++;
        }
    }
    return(n);
}

void *peerthread(void *);

void *findpeers(void *args)
{
    pthread_t peer_threads[sizeof(Peers)/sizeof(*Peers)];
    pthread_t newpeer_threads[sizeof(Newpeers)/sizeof(*Newpeers)];
    int32_t i,num;
    for (i=0; i<(sizeof(Peers)/sizeof(*Peers)); i++)
        pthread_create(&peer_threads[i],NULL,&peerthread,(void *)Peers[i]);
    while ( Numnewpeers < (sizeof(Newpeers)/sizeof(*Newpeers)) )
    {
        num = Numnewpeers;
        while ( Numnewpeers == num )
            sleep(1);
        for (i=num; i<Numnewpeers && i<(sizeof(Newpeers)/sizeof(*Newpeers)); i++)
            pthread_create(&newpeer_threads[i],NULL,&peerthread,(void *)Newpeers[i]);
        if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
            break;
    }
    printf("find peers thread finished\n");
    return(0);
}

void process_publicpeers(int32_t peerid,char *ipaddr,ExchangePublicPeers *peers)
{
    int32_t i,j;
    char peeraddr[64];
    for (i=0; i<4; i++)
    {
        peeraddr[0] = 0;
        for (j=0; j<4; j++)
            sprintf(peeraddr + strlen(peeraddr),"%d%c",peers->peers[i][j],j<3?'.':0);
        addnewpeer(peeraddr);
    }
}

void process_tickinfo(int32_t peerid,char *ipaddr,CurrentTickInfo *I)
{
    Peertickinfo[peerid].info = *I;
    if ( I->tick > LATEST_TICK || (I->epoch != 0 && EPOCH == 0) || (INITIAL_TICK == 0 && I->initialTick != 0) )
    {
        LATEST_TICK = I->tick;
        if ( I->initialTick > INITIAL_TICK )
        {
            if ( INITIAL_TICK != 0 )
            {
#ifdef QARCHIVER
                memset(RAMQ,0,sizeof(*RAMQ) * MAXTICKS);
#endif
                VALIDATED_TICK = 0;
                HAVE_TXTICK = 0;
            }
            INITIAL_TICK = I->initialTick;
        }
        if ( I->epoch > EPOCH )
            EPOCH = I->epoch;
#ifdef QARCHIVER
        FILE *fp;
        int vals[5];
        char fname[512];
        sprintf(fname,"%s%clatest",DATADIR,dir_delim());
        if ( (fp= fopen(fname,"wb")) != 0 )
        {
            vals[0] = LATEST_TICK;
            vals[1] = VALIDATED_TICK;
            vals[2] = HAVE_TXTICK;
            vals[3] = EPOCH;
            vals[4] = INITIAL_TICK;
            fwrite(vals,1,sizeof(vals),fp);
            fclose(fp);
        }
#endif
        printf("%s epoch.%d tick.%d LATEST.%d lag.%d, INITIAL_TICK.%d\n",ipaddr,EPOCH,I->tick,LATEST_TICK,LATEST_TICK - I->tick,INITIAL_TICK);
    }
}

CurrentTickInfo getTickInfoFromNode(const char *nodeIp,int32_t nodePort)
{
    struct quheader R;
    CurrentTickInfo result,*rp;
    int32_t sock;
    uint8_t buf[4096];
    memset(&result,0,sizeof(result));
    if ( (sock= myconnect(nodeIp,nodePort)) < 0 )
        return(result);
    if ( (rp= reqresponse(buf,sizeof(buf),sock,REQUEST_CURRENT_TICK_INFO,(uint8_t *)&R,sizeof(R),RESPOND_CURRENT_TICK_INFO)) != 0 )
    {
        memcpy(&result,rp,sizeof(result));
        //printf("tick.%d initial.%d\n",rp->tick,rp->initialTick);
    }
    close(sock);
    return result;
}

RespondedEntity getBalance(const char *nodeIp,const int nodePort,const uint8_t *pubkey,uint8_t *merkleroot)
{
    struct EntityRequest ER;
    RespondedEntity result,*rp;
    int32_t sock;
    uint8_t buf[4096];
    memset(&result,0,sizeof(result));
    if ( (sock= myconnect(nodeIp,nodePort)) < 0 )
        return(result);
    memcpy(ER.pubkey,pubkey,sizeof(ER.pubkey));
    if ( merkleroot != 0 )
        memset(merkleroot,0,32);
    if ( (rp= reqresponse(buf,sizeof(buf),sock,REQUEST_ENTITY,(uint8_t *)&ER,sizeof(ER),RESPOND_ENTITY)) != 0 )
    {
        memcpy(&result,rp,sizeof(result));
        if ( merkleroot != 0 )
        {
            memset(merkleroot,0,32);
            merkleRoot(SPECTRUM_DEPTH,rp->spectrumIndex,(uint8_t *)&rp->entity,sizeof(rp->entity),&rp->siblings[0][0],merkleroot);
            char hexstr[65];
            byteToHex(merkleroot,hexstr,32);
            hexstr[64] = 0;
            //printf("getBalance tick.%d merkle.%s\n",rp->tick,hexstr);
        }
    }
    close(sock);
    return result;
}

int32_t getAssets(RespondOwnedAssets *assets,int32_t max,const char *nodeIp,const int nodePort,const uint8_t *pubkey)
{
    struct EntityRequest ER;
    struct quheader H;
    int32_t sock,sendvu,sz,n,recvbyte,ptr = 0;
    uint8_t recvbuf[4096];
    if ( (sock= myconnect(nodeIp,nodePort)) < 0 )
        return(0);
    memcpy(ER.pubkey,pubkey,sizeof(ER.pubkey));
    ER.H = quheaderset(REQUEST_OWNED_ASSETS,sizeof(ER));
    sendbuffer(sock,(uint8_t *)&ER,sizeof(ER));
    memset(recvbuf,0,sizeof(recvbuf));
    sendvu = ER.H._dejavu;
    n = 0;
    if ( (recvbyte= receiveall(sock,recvbuf,sizeof(recvbuf))) > 0 )
    {
        while ( ptr < recvbyte )
        {
            memcpy(&H,&recvbuf[ptr],sizeof(H));
            sz = ((H._size[2] << 16) + (H._size[1] << 8) + H._size[0]);
            printf("sendvu.%x %x received %d, size.%d type.%d\n",sendvu,H._dejavu,recvbyte,sz,H._type);
            if ( H._dejavu == sendvu && H._type == RESPOND_OWNED_ASSETS )
            {
                memcpy(&assets[n++],&recvbuf[ptr + sizeof(H)],sizeof(*assets));
                if ( n == max )
                    break;
            }
            ptr += sz;
        }
    }
    close(sock);
    return(n);
}

void sendrawtransaction(const char *ipaddr,uint16_t port,const char *rawhex)
{
    int32_t sock,datalen;
    uint8_t reqbuf[4096];//,buf[4096],*rp;
    if ( (sock= myconnect(ipaddr,port)) < 0 )
    {
        printf("Error getting connection %s for sendrawtransaction\n",ipaddr);
        return;
    }
    datalen = (int32_t)strlen(rawhex) / 2;
    hexToByte(rawhex,&reqbuf[sizeof(struct quheader)],datalen);
    *(struct quheader *)reqbuf = quheaderset(BROADCAST_TRANSACTION,datalen+sizeof(struct quheader));
    sendbuffer(sock,reqbuf,datalen+sizeof(struct quheader));

    /*if ( (rp= reqresponse(buf,sizeof(buf),sock,BROADCAST_TRANSACTION,reqbuf,datalen+sizeof(struct quheader),EXCHANGE_PUBLIC_PEERS)) != 0 )
    {
        //for (int i=0; i<16; i++)
        //    printf("%02x",rp[i]);
        //printf(" respnse\n");
    }*/
    close(sock);
    return;
}
