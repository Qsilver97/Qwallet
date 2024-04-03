

int32_t qpubreq_count(void)
{
    int32_t count;
    struct qpubreq *rp;
    pthread_mutex_lock(&qpubreq_mutex);
    DL_COUNT(REQS,rp,count);
    pthread_mutex_unlock(&qpubreq_mutex);
    return(count);
}

struct qpubreq *qpubreq_add(char *addr,uint8_t command)
{
    struct qpubreq *rp;
    rp = (struct qpubreq *)calloc(1,sizeof(*rp));
    rp->H = quheaderset(command,sizeof(rp->H) + sizeof(rp->pubkey));
    addr2pubkey(addr,rp->pubkey);
    pthread_mutex_lock(&qpubreq_mutex);
    DL_APPEND(REQS,rp);
    Totalreqs++;
    pthread_mutex_unlock(&qpubreq_mutex);
    return(rp);
}

int32_t qpubreq_poll(char *ipaddr,struct qpubreq *rps[],int32_t n)
{
    struct qpubreq *rp;
    int32_t i;
    pthread_mutex_lock(&qpubreq_mutex);
    for (i=0; i<n; i++)
    {
        if ( (rp= REQS) != 0 )
        {
            DL_DELETE(REQS,rp);
            rps[i] = rp;
        } else break;
    }
    pthread_mutex_unlock(&qpubreq_mutex);
    return(i);
}

void queue_entity(struct Entity *entity,int32_t tick,uint8_t merkleroot[32])
{
    struct qentity *rp;
    rp = (struct qentity *)calloc(1,sizeof(*rp));
    rp->E = *entity;
    rp->tick = tick;
    memcpy(rp->merkleroot,merkleroot,sizeof(rp->merkleroot));
    pthread_mutex_lock(&qentity_mutex);
    DL_APPEND(ENTITYQ,rp);
    pthread_mutex_unlock(&qentity_mutex);
}

void sandwich_add(int32_t tick,int32_t futuretick,char *addr)
{
    struct sandwich *sp;
    uint8_t pubkey[32];
    if ( strcmp(addr,(char *)"IZTNWDKXSFULQADTOLTMLUPHSCFCXLOJMQOUHPBSRGQZMMXZCJYQFTRDOGRE") == 0 ) // skip subscribers
        return;
    addr2pubkey(addr,pubkey);
    pthread_mutex_lock(&sandwich_mutex);
   //printf("<<<<<<<<<<<<<<<<< create %s future.%d\n",addr,futuretick);
    sp = (struct sandwich *)calloc(1,sizeof(*sp));
    memcpy(sp->pubkey,pubkey,32);
    sp->created = tick;
    sp->futuretick = futuretick;
    DL_APPEND(SANDWICHQ,sp);
    Totalsandwiches++;
    pthread_mutex_unlock(&sandwich_mutex);
}

void update_sandwiches(int32_t tick) // from mainloop
{
    char addr[64];
    int32_t count;
    struct sandwich *sp,*tmp;
    pthread_mutex_lock(&sandwich_mutex);
    DL_FOREACH_SAFE(SANDWICHQ,sp,tmp)
    {
        Addresshash(sp->pubkey,1);
        pubkey2addr(sp->pubkey,addr);
        if ( sp->beforetick == 0 && tick < sp->futuretick && tick >= sp->futuretick-3 )
        {
            //printf(">>>>>>>>>>>>> gap.%d request BEFORE %d latest.%d %s created.%d\n",sp->futuretick - tick,sp->futuretick,LATEST_TICK,addr,sp->created);
            qpubreq_add(addr,REQUEST_ENTITY);
            qpubreq_add(addr,REQUEST_ENTITY);
            qpubreq_add(addr,REQUEST_ENTITY);
        }
        else if ( sp->aftertick == 0 && tick >= sp->futuretick )
        {
            qpubreq_add(addr,REQUEST_ENTITY);
            //printf(">>>>>>>>>>>>>>>>>>>>>>> issue after REQUEST %s at tick.%d mod.%d\n",addr,tick,((sp->futuretick - tick) % 3));
        }
        else if ( tick > sp->futuretick+10 )
        {
            printf("????????? expired sandwich %s created.%d future.%d now.%d before.%d after.%d\n",addr,sp->created,sp->futuretick,tick,sp->beforetick,sp->aftertick);
            DL_DELETE(SANDWICHQ,sp);
            free(sp);
            Sandwicherror++;
        }
    }
    DL_COUNT(SANDWICHQ,sp,count);
    printf("numsandwiches %d: total.%d errors.%d good.%d avebefore %.1f aveafter %.1f\n",count,Totalsandwiches,Sandwicherror,Sandwichgood,(double)Sandwichbeforesum/(Sandwichgood==0?1:Sandwichgood),(double)Sandwichaftersum/(Sandwichgood==0?1:Sandwichgood));
    pthread_mutex_unlock(&sandwich_mutex);
}

int32_t update_entity(struct Entity *E,int32_t tick)
{
    int32_t changed = 0;
    struct addrhash *ap;
    struct sandwich *sp,*tmp;
    if ( (ap= Addresshash(E->publicKey,1)) != 0 && tick > ap->nexttick )
    {
        ap->nexttick = tick;
        if ( memcmp(E,&ap->entity,sizeof(ap->entity)) != 0 )
        {
            changed = 1;
            ap->entity = *E;
        }
        pthread_mutex_lock(&sandwich_mutex);
        DL_FOREACH_SAFE(SANDWICHQ,sp,tmp)
        {
            char addr[64];
            pubkey2addr(sp->pubkey,addr);
            //printf("tick.%d %s futuretick.%d created.%d before.%d after.%d\n",tick,addr,sp->futuretick,sp->created,sp->beforetick,sp->aftertick);
            if ( memcmp(sp->pubkey,E->publicKey,32) == 0 )
            {
                if ( tick-1 < sp->futuretick && sp->beforetick == 0 )
                {
                    sp->beforetick = tick; // wont correlate exactly 1:1 but in aggregate should be ok
                    break;
                }
                else if ( tick-1 >= sp->futuretick && sp->aftertick == 0 )
                {
                    sp->aftertick = tick;
                    printf("SANDWICH %s %s futuretick.%d created.%d before.%d after.%d\n",addr,sp->beforetick==0?"???????????":"!!!!!!!!!!",sp->futuretick,sp->created,sp->beforetick,sp->aftertick);
                    DL_DELETE(SANDWICHQ,sp);
                    free(sp);
                    if ( sp->beforetick != 0 )
                    {
                        Sandwichgood++;
                        Sandwichbeforesum += (sp->futuretick - sp->beforetick);
                        Sandwichaftersum += (sp->aftertick - sp->futuretick);
                    } else Sandwicherror++;
                }
            }
        }
        pthread_mutex_unlock(&sandwich_mutex);
    }
    return(changed);
}

void update_entities(int32_t tick,uint8_t merkleroot[32])
{
    int32_t count,chg;
    struct qentity *rp,*tmp;
    pthread_mutex_lock(&qentity_mutex);
    DL_FOREACH_SAFE(ENTITYQ,rp,tmp)
    {
        if ( memcmp(merkleroot,rp->merkleroot,32) == 0 )
        {
            DL_DELETE(ENTITYQ,rp);
            //if ( rp->tick != tick )
            //    printf("rp->tick.%d vs tick.%d: ",rp->tick,tick);
            rp->tick = tick;
            chg = update_entity(&rp->E,tick);
            char addr[64];
            pubkey2addr(rp->E.publicKey,addr);
            free(rp);
            if ( chg != 0 )
                printf("updated entity %s %s tick.%d changed.%d\n",addr,amountstr(ebalance(&rp->E)),tick,chg);
        }
        else if ( rp->tick < tick-10 )
        {
            DL_DELETE(ENTITYQ,rp);
            //printf("purge obsolete entity data tick.%d when %d\n",rp->tick,tick);
            free(rp);
        }
    }
    DL_COUNT(ENTITYQ,tmp,count);
    pthread_mutex_unlock(&qentity_mutex);
    printf("ENTITYQ %d remains at tick.%d\n",count,tick);
}

int32_t update_univowned(struct univhash *up,char *name,int64_t num,int32_t tick)
{
    int32_t i,retval = -1;
    uint64_t nameint = 0;
    strcpy((char *)&nameint,name);
    pthread_mutex_lock(&qentity_mutex);
    up->ownedtick = tick;
    for (i=0; i<sizeof(up->owned)/sizeof(*up->owned); i++)
    {
        if ( up->owned[i][0] == 0 )
        {
            up->owned[i][0] = nameint;
            up->owned[i][1] = num;
            retval = i;
            break;
        }
        else if ( up->owned[i][0] == nameint )
        {
            up->owned[i][1] = num;
            retval = i;
            break;
        }
    }
    pthread_mutex_unlock(&qentity_mutex);
    return(retval);
}

int64_t get_univowned(struct univhash *up,char *name)
{
    int32_t i;
    uint64_t retval = 0,nameint = 0;
    strcpy((char *)&nameint,name);
    pthread_mutex_lock(&qentity_mutex);
    for (i=0; i<sizeof(up->owned)/sizeof(*up->owned); i++)
    {
        if ( up->owned[i][0] == nameint )
        {
            retval = up->owned[i][1];
            break;
        }
    }
    pthread_mutex_unlock(&qentity_mutex);
    //char addr[64];
    //pubkey2addr(up->pubkey,addr);
    //printf("could not find %s for %s\n",name,addr);
    return(retval);
}

void *fifoloop(void *ignore)
{
    int32_t i,len,packetlen,tick,futuretick;
    uint8_t pubkey[32],pubkey2[32],packet[MAX_TX_SIZE],merkleroot[32];
    char line[8192*16];
    static char QUTIL_ADDR[64];
    if ( QUTIL_ADDR[0] == 0 )
    {
        memset(pubkey,0,sizeof(pubkey));
        *(uint32_t *)pubkey = QUTIL_CONTRACT_ID;
        pubkey2addr(pubkey,QUTIL_ADDR);
        printf("QUTIL_ADDR %s\n",QUTIL_ADDR);
    }
    while ( 1 )
    {
        FILE *fp = fopen("Qserver", "r");
        if ( fp != 0 )
        {
            if ( fgets(line,sizeof(line)-1,fp) != 0 )
            {
                len = (int32_t)strlen(line);
                if ( line[len-1] == '\n' )
                    line[--len] = 0;
                printf("FIFO.(%s)\n",line);
                if ( strncmp(line,"merkle ",7) == 0 )
                {
                    tick = atoi(line+7);
                    for (i=7; i<32; i++)
                        if ( line[i] == ' ' )
                            break;
                    if ( i < 32 && ishexstr(line+i+1) != 0 )
                    {
                        //printf("Got tick.%d merkle.(%s)\n",tick,line+i+1);
                        hexToByte(line+i+1,merkleroot,32);
                        update_entities(tick,merkleroot);
                    }
                }
                else if ( strncmp(line,"future ",7) == 0 )
                {
                    futuretick = atoi(line+7);
                    for (i=7; i<32; i++)
                        if ( line[i] == ' ' )
                            break;
                    if ( futuretick > LATEST_TICK && futuretick < LATEST_TICK+60 && addr2pubkey(line+i+1,pubkey) > 0 )
                    {
                        if ( addr2pubkey(line+i+62,pubkey2) > 0 )
                        {
                            char addr[64],dest[64];
                            pubkey2addr(pubkey,addr);
                            pubkey2addr(pubkey2,dest);
                            if ( strcmp(dest,QUTIL_ADDR) == 0 )
                                 printf("unexpected future sendmany from %s\n",addr);
                            else
                                sandwich_add(LATEST_TICK,futuretick,dest);
                            sandwich_add(LATEST_TICK,futuretick,addr);
                            printf("FUTURE.%d tick.%d %s -> %s\n",futuretick - LATEST_TICK,futuretick,addr,dest);
                        }
                    }
                }
                else if ( addr2pubkey(line,pubkey) > 0 )
                {
                    Addresshash(pubkey,1);
                    qpubreq_add(line,REQUEST_ENTITY);
                    qpubreq_add(line,REQUEST_ENTITY);
                }
                else if ( ishexstr(line) != 0 )
                {
                    packetlen = (int32_t)strlen(line)/2;
                    hexToByte(line,packet,packetlen);
                    peerbroadcast(packet,packetlen);
                }
                else printf("error %s\n",line);
            }
            fclose(fp);
        }
        if ( EXITFLAG != 0 && LATEST_UTIME > EXITFLAG )
            break;
        //usleep(100000);
    }
    printf("fifo loop exiting\n");
    return(0);
}

