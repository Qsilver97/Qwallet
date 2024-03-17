
char Newpeers[64][16];
int32_t Numnewpeers,Numpeers;
pthread_mutex_t addpeer_mutex;
struct qpeer Peertickinfo[MAXPEERS];

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
    FILE *fp;
    int32_t vals[5];
    Peertickinfo[peerid].info = *I;
    if ( I->tick > LATEST_TICK )
    {
        LATEST_TICK = I->tick;
#ifdef QARCHIVER
        if ( (fp= fopen("latest","wb")) != 0 )
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
        printf("%s epoch.%d tick.%d LATEST.%d lag.%d, INITIAL_TICK.%d\n",ipaddr,EPOCH,I->tick,LATEST_TICK,LATEST_TICK - I->tick,INITIAL_TICK);
    }
}
