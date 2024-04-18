

void process_entity(int32_t peerid,char *ipaddr,RespondedEntity *E)
{
    struct addrhash *ap,A;
    uint8_t zero[32],merkleroot[32];
    Entitydata++;
    if ( E->tick < INITIAL_TICK )
        return;
    memset(zero,0,sizeof(0));
    if ( (ap= Addresshash(E->entity.publicKey,0)) != 0 )
    {
        //for (int j=0; j<32; j++)
        //    printf("%02x",E->entity.publicKey[j]);
        if ( E->tick > ap->nexttick )
        {
            if ( E->entity.incomingAmount == 0 && E->entity.outgoingAmount == 0 && ap->entity.incomingAmount == 0 && ap->entity.outgoingAmount == 0 && memcmp(zero,E->siblings[0],sizeof(zero)) == 0 )
            {
                ap->nexttick = E->tick;
                //flushaddress(ap,&sent,&recv,&fpos);
            }
            else
            {
                memset(&A,0,sizeof(A));
                A.entity = E->entity;
                merkleRoot(SPECTRUM_DEPTH,E->spectrumIndex,(uint8_t *)&A.entity,sizeof(A.entity),&E->siblings[0][0],merkleroot);
                queue_entity(&E->entity,E->tick,merkleroot);
            }
        }
        Peertickinfo[peerid].numE++;
        if ( (0) )
        {
            char addr[64];
            pubkey2addr(E->entity.publicKey,addr);
            printf(" %s got entity.%d %s %s tick.%d vs %d LATEST.%d \n",ipaddr,Peertickinfo[peerid].numE,addr,amountstr(ebalance(&E->entity)),E->tick,ap->nexttick,LATEST_TICK);
        }
    }
    else
    {
        char addr[64];
        pubkey2addr(E->entity.publicKey,addr);
        printf("unexpected entity data without *ap %s?\n",addr);
    }
}

void process_owned(int32_t peerid,char *ipaddr,RespondOwnedAssets *owned)
{
    char name[8],addr[64];
    struct univhash *up;
    int64_t num;
    memset(name,0,sizeof(name));
    memcpy(name,owned->issuanceAsset.varStruct.issuance.name,7);
    pubkey2addr(owned->asset.varStruct.ownership.publicKey,addr);
    if ( (up= Univhash(owned->asset.varStruct.ownership.publicKey,0)) != 0 )
    {
        num = owned->asset.varStruct.ownership.numberOfUnits;
        if ( owned->tick > up->ownedtick )
        {
            if ( update_univowned(up,name,num,owned->tick) < 0 )
                printf("out of owned[] space for %s %s\n",name,addr);
        }
        //printf("process %s owned.(%s) type.%d units %ld tick.%d [%d %d %d %d] %d %s\n",addr,name,owned->issuanceAsset.varStruct.issuance.type,(long)num,ap->assetstick[0],ap->SCshares[1],ap->SCshares[2],ap->SCshares[3],ap->SCshares[4],ap->qftshares,amountstr(ap->qwalletshares));
    }
}

void process_possessed(int32_t peerid,char *ipaddr,RespondPossessedAssets *possessed)
{
    char name[8],addr[64];
    struct univhash *up;
    int64_t num;
    memset(name,0,sizeof(name));
    memcpy(name,possessed->issuanceAsset.varStruct.issuance.name,7);
    pubkey2addr(possessed->asset.varStruct.possession.publicKey,addr);
    if ( (up= Univhash(possessed->asset.varStruct.possession.publicKey,0)) != 0 )
    {
        num = possessed->asset.varStruct.ownership.numberOfUnits;
        if ( possessed->tick > up->possessedtick )
        {
            up->possessedtick = possessed->tick;
            if ( up->possessedtick >= up->ownedtick-10 )
            {
                if ( get_univowned(up,name) != num )
                    printf("%s %s owned %s vs possession %s\n",addr,name,amountstr(get_univowned(up,name)),amountstr2(num));
            }
        }
        //printf("process %s possessed.(%s) type.%d units %lld tick.%d\n",addr,name,possessed->issuanceAsset.varStruct.issuance.type,num,ap->assetstick[1]);
    }
}

void process_transaction(int32_t peerid,char *ipaddr,Transaction *tx,int32_t txlen)
{
    if ( tx->amount != 0 )
    {
        char addr[64],dest[64];
        pubkey2addr(tx->sourcePublicKey,addr);
        pubkey2addr(tx->destinationPublicKey,dest);
        printf("%s lag.%d %s amount %s -> %s\n",ipaddr,tx->tick - LATEST_TICK,addr,amountstr(tx->amount),dest);
    }
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
        case RESPOND_OWNED_ASSETS:                if ( datasize != sizeof(RespondOwnedAssets) ) return(-1);
            process_owned(peerid,ipaddr,(RespondOwnedAssets *)data);
            break;
        case RESPOND_POSSESSED_ASSETS:                if ( datasize != sizeof(RespondPossessedAssets) ) return(-1);
            process_possessed(peerid,ipaddr,(RespondPossessedAssets *)data);
            break;
        case RESPOND_CONTRACT_FUNCTION:
            process_contractresponse(H->_dejavu,peerid,ipaddr,data,datasize);
            break;
        case BROADCAST_TICK:
            break;
        case BROADCAST_FUTURE_TICK_DATA:
            break;
        case BROADCAST_TRANSACTION:
            process_transaction(peerid,ipaddr,(Transaction *)data,datasize);
            break;
        case REQUEST_TICK_DATA:
            break;
        case REQUEST_COMPUTORS:
            break;
        case REQUEST_QUORUMTICK:
            break;
        case REQUEST_TICK_TRANSACTIONS:
            break;
        case REQUEST_SYSTEM_INFO:
            break;
        case 1:
            break; // mystery
        default: printf("%s unknown type.%d sz.%d\n",ipaddr,H->_type,datasize);
            break;
    }
    //printf("peerid.%d got %d cmd.%d from %s\n",peerid,datasize,H->_type,ipaddr);
    return(0);
}

void *peerthread(void *_ipaddr)
{
    char *ipaddr = _ipaddr;
    Computors computors;
    FILE *fp = 0;
    struct qpubreq *rps[10];
    int32_t peerid,sock=-1,i,n,savedtx,ptr,sz,recvbyte,prevutime,prevtick,iter,bufsize;
    struct quheader H;
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
    printf("connected.%d peerthread %s sock.%d\n",Numpeers,ipaddr,sock);
    
    while ( 1 )
    {
        //printf("%d TOP of loop peerthread %s\n",peerid,ipaddr);
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
                    //if ( H._type == EXCHANGE_PUBLIC_PEERS )
                    //    sock = socksend(ipaddr,sock,(uint8_t *)&H,sz);
                }
                ptr += sz;
            }
        }
        //printf("%d AFTER recvloop peerthread %s\n",peerid,ipaddr);
        if ( Peertickinfo[peerid].packetlen != 0 )
        {
            printf("%s sends packet[%d]\n",ipaddr,Peertickinfo[peerid].packetlen);
            sock = socksend(ipaddr,sock,Peertickinfo[peerid].packet,Peertickinfo[peerid].packetlen);
            Peertickinfo[peerid].packetlen = 0;
        }
        else if ( Peertickinfo[peerid].info.tick > LATEST_TICK-60 )
        {
            memset(rps,0,sizeof(rps));
            n = qpubreq_poll(ipaddr,rps,sizeof(rps)/sizeof(*rps));
            for (i=0; i<n; i++)
            {
                //char addr[64];
                //pubkey2addr(rps[i]->pubkey,addr);
                //printf("%s REQ %s\n",ipaddr,addr);
                sock = socksend(ipaddr,sock,(uint8_t *)&rps[i]->H,sizeof(rps[i]->H) + sizeof(rps[i]->pubkey));
                free(rps[i]);
            }
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
#ifdef TESTNET
            for (i=0; i<NUMASSETS; i++)
            {
                if ( ((LATEST_TICK + i) % (Numpeers/2 + 1)) == (peerid/2) )
                {
                    printf("%s %s tick.%d\n",ipaddr,ASSETS[i].name,LATEST_TICK);
                    if ( ASKvu[peerid][i] == 0 || LATEST_TICK > ASKvutick[peerid][i]+QUOTEVU_TIMEOUT )
                    {
                        sock = qxGetAssetAskOrder(&ASKvu[peerid][i],ipaddr,sock,ASSETS[i].name,0);
                        ASKvutick[peerid][i] = LATEST_TICK;
                    }
                    if ( BIDvu[peerid][i] == 0 || LATEST_TICK > BIDvutick[peerid][i]+QUOTEVU_TIMEOUT )
                    {
                        sock = qxGetAssetBidOrder(&BIDvu[peerid][i],ipaddr,sock,ASSETS[i].name,0);
                        BIDvutick[peerid][i] = LATEST_TICK;
                    }
                }
            }
#endif
        } else usleep(10000);
    }
    if ( sock >= 0 )
        close(sock);
    printf("%s exits thread\n",ipaddr);
    return(0);
}
