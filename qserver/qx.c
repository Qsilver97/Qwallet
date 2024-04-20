


int32_t qxIssueAsset(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t subseed[32],char *assetname,char *unitsname,int64_t numberOfUnits,char numberofDecimals,int32_t txtick)
{
    int32_t i;
    char assetNameS1[8],UoMS1[8];
    uint8_t privkey[32],destpub[32],senderpub[32];
    struct IssueAsset_input IA;
    memset(assetNameS1,0,sizeof(assetNameS1));
    memset(UoMS1,0,sizeof(UoMS1));
    strncpy(assetNameS1,assetname,8);
    for (i=0; i<7; i++)
    {
        if ( unitsname[i] == 0 )
            break;
        UoMS1[i] = unitsname[i] - '0';
    }
    getPrivateKeyFromSubSeed(subseed,privkey);
    getPublicKeyFromPrivateKey(privkey,senderpub);
    memset(destpub,0,sizeof(destpub));
    *(uint64_t *)destpub = QX_CONTRACT_ID;
    memset(&IA,0,sizeof(IA));
    memcpy(&IA.name,assetNameS1,8);
    memcpy(&IA.unitOfMeasurement,UoMS1,8);
    IA.numberOfUnits = numberOfUnits;
    IA.numberOfDecimalPlaces = numberofDecimals;
    txtick = create_rawtxhex(rawhex,txhash,digest,subseed,QX_ISSUE_ASSET_FN,senderpub,destpub,1000000000,(uint8_t *)&IA,sizeof(IA),txtick);
    memset(privkey,0xff,sizeof(privkey));
    memset(privkey,0,sizeof(privkey));
    return(txtick);
}

int32_t qxTransferAsset(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t subseed[32],char *assetname,char *newowner,int64_t numberOfUnits,int32_t txtick)
{
    char assetNameS1[8];
    uint8_t privkey[32],destpub[32],senderpub[32];
    struct TransferAssetOwnershipAndPossession_input TA;
    memset(assetNameS1,0,sizeof(assetNameS1));
    strncpy(assetNameS1,assetname,8);
    getPrivateKeyFromSubSeed(subseed,privkey);
    getPublicKeyFromPrivateKey(privkey,senderpub);
    memset(destpub,0,sizeof(destpub));
    *(uint64_t *)destpub = QX_CONTRACT_ID;
    memset(&TA,0,sizeof(TA));
    if ( issuerpubkey(assetname,TA.issuer) < 0 )
    {
        printf("%s is unknown asset\n",assetname);
        return(-1);
    }
    if ( addr2pubkey(newowner,TA.newOwnerAndPossessor) <= 0 )
    {
        printf("%s is illegal address\n",newowner);
        return(-2);
    }
    memcpy(&TA.assetName,assetNameS1,8);
    TA.numberOfUnits = numberOfUnits;
    txtick = create_rawtxhex(rawhex,txhash,digest,subseed,QX_TRANSFER_SHARE_FN,senderpub,destpub,1000000,(uint8_t *)&TA,sizeof(TA),txtick);
    memset(privkey,0xff,sizeof(privkey));
    memset(privkey,0,sizeof(privkey));
    return(txtick);
}

int32_t qxOrderAction(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t subseed[32],char *assetname,int64_t price,int64_t numberOfShares,int32_t txtick,int32_t type)
{
    uint8_t privkey[32],senderpub[32],destpub[32];
    struct qxOrderAction_input I;
    char name[8];
    int64_t amount;
    getPrivateKeyFromSubSeed(subseed,privkey);
    getPublicKeyFromPrivateKey(privkey,senderpub);
    memset(destpub,0,sizeof(destpub));
    *(uint64_t *)destpub = QX_CONTRACT_ID;
    memset(&I,0,sizeof(I));
    if ( issuerpubkey(assetname,I.issuer) < 0 )
        return(-1);
    memset(name,0,sizeof(name));
    strncpy(name,assetname,8);
    memcpy(&I.assetName,name,sizeof(I.assetName));
    if ( type == QX_ADD_BID_ORDER_FN )
        amount = price * numberOfShares;
    else amount = 1;
    I.price = price;
    I.numberOfShares = numberOfShares;
    txtick = create_rawtxhex(rawhex,txhash,digest,subseed,type,senderpub,destpub,amount,(uint8_t *)&I,sizeof(I),txtick);
    memset(privkey,0xff,sizeof(privkey));
    memset(privkey,0,sizeof(privkey));
    return(txtick);
}

int32_t qxAddToAskOrder(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t subseed[32],char *assetname,int64_t price,int64_t numberOfShares,int32_t txtick)
{
    return(qxOrderAction(rawhex,txhash,digest,subseed,assetname,price,numberOfShares,txtick,QX_ADD_ASK_ORDER_FN));
}

int32_t qxAddToBidOrder(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t subseed[32],char *assetname,int64_t price,int64_t numberOfShares,int32_t txtick)
{
    return(qxOrderAction(rawhex,txhash,digest,subseed,assetname,price,numberOfShares,txtick,QX_ADD_BID_ORDER_FN));
}

int32_t qxRemoveToAskOrder(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t subseed[32],char *assetname,int64_t price,int64_t numberOfShares,int32_t txtick)
{
    return(qxOrderAction(rawhex,txhash,digest,subseed,assetname,price,numberOfShares,txtick,QX_REMOVE_ASK_ORDER_FN));
}

int32_t qxRemoveToBidOrder(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t subseed[32],char *assetname,int64_t price,int64_t numberOfShares,int32_t txtick)
{
    return(qxOrderAction(rawhex,txhash,digest,subseed,assetname,price,numberOfShares,txtick,QX_REMOVE_BID_ORDER_FN));
}

int32_t contractrequest(uint8_t *packet,struct quheader *H,struct RequestContractFunction *rcf,int32_t sz,int32_t contractid,int32_t type)
{
    memset(rcf,0,sizeof(*rcf));
    *H = quheaderset(REQUEST_CONTRACT_FUNCTION,sizeof(H) + sizeof(rcf) + sz);
    rcf->inputSize = sz;
    rcf->inputType = type;
    rcf->contractIndex = contractid;
    memcpy(packet,H,sizeof(*H));
    memcpy(&packet[sizeof(*H)],rcf,sizeof(*rcf));
    return(sizeof(*H) + sizeof(*rcf));
}

int32_t qxGetEntityOrder(char *ipaddr,int32_t sock,char *addr,int64_t offset,int32_t procedureNumber)
{
    int32_t len;
    struct quheader H;
    struct RequestContractFunction rcf;
    struct qxGetEntityOrder_input qgeo;
    uint8_t packet[sizeof(H) + sizeof(rcf) + sizeof(qgeo)];
    len = contractrequest(packet,&H,&rcf,sizeof(qgeo),QX_CONTRACT_ID,procedureNumber);
    memset(&qgeo,0,sizeof(qgeo));
    addr2pubkey(addr,qgeo.entity);
    qgeo.offset = offset;
    memcpy(&packet[len],&qgeo,sizeof(qgeo));
    return(socksend(ipaddr,sock,packet,sizeof(packet)));
}

int32_t qxGetEntityAskOrder(char *ipaddr,int32_t sock,char *addr,int64_t offset)
{
    return(qxGetEntityOrder(ipaddr,sock,addr,offset,QX_GET_ENTITY_ASK_ORDER_PR));
}

int32_t qxGetEntityBidOrder(char *ipaddr,int32_t sock,char *addr,int64_t offset)
{
    return(qxGetEntityOrder(ipaddr,sock,addr,offset,QX_GET_ENTITY_BID_ORDER_PR));
}

int64_t getFees(char *ipaddr,struct QxFees_output *result)
{
    struct RequestContractFunction rcf;
    struct quheader H;
    uint8_t buf[4096],packet[sizeof(struct quheader) + sizeof(rcf)];
    int32_t len,sock;
    int64_t sendmanyfee = -1;
    struct QxFees_output *rp;
    len = contractrequest(packet,&H,&rcf,0,QX_CONTRACT_ID,QX_GET_FEE_PR);
    memset(result,0,sizeof(*result));
    if ( (sock= myconnect(ipaddr,DEFAULT_NODE_PORT)) < 0 )
        return(-1);
    if ( (rp= reqresponse(buf,sizeof(buf),sock,REQUEST_CONTRACT_FUNCTION,packet,sizeof(packet),RESPOND_CONTRACT_FUNCTION)) != 0 )
    {
        memcpy(result,rp,sizeof(*result));
        printf("FEES: Assetissuance %s, transfer %s, trade %.3f%%\n",amountstr(rp->assetIssuanceFee),amountstr2(rp->transferFee),100 * rp->tradeFee / 1000000000.);
        sendmanyfee = 0;
    }
    len = contractrequest(packet,&H,&rcf,0,QUTIL_CONTRACT_ID,GETSENDTOMANYV1FEE);
    if ( (rp= reqresponse(buf,sizeof(buf),sock,REQUEST_CONTRACT_FUNCTION,packet,sizeof(packet),RESPOND_CONTRACT_FUNCTION)) != 0 )
    {
        memcpy(&sendmanyfee,rp,sizeof(sendmanyfee));
        printf("FEES: Sendmany %s\n",amountstr(sendmanyfee));
    }
    close(sock);
    return(sendmanyfee);
}

void disp_assetorders(int32_t dir,const char *assetname,uint8_t *data,int32_t datalen)
{
    struct qxGetAssetOrder_output *AO;
    AO = (struct qxGetAssetOrder_output *)data;
    int32_t i,n = sizeof(AO->orders) /sizeof(*AO->orders);
    uint8_t zero[32];
    char addr[64];
    memset(zero,0,sizeof(zero));
    for (i=0; i<n; i++)
    {
        if ( memcmp(zero,AO->orders[i].pubkey,32) != 0 )
        {
            pubkey2addr(AO->orders[i].pubkey,addr);
            if ( dir*AO->orders[i].price < 0 )
                printf("AO: dir.%d mismatch vs price[%d] %s\n",dir,i,amountstr(AO->orders[i].price));
            printf("AO.%d %s %s %s at %s\n",dir,addr,assetname,amountstr(AO->orders[i].numberOfShares),amountstr2(dir * AO->orders[i].price));
        }
    }
}

void process_contractresponse(uint32_t dejavu,int32_t peerid,char *ipaddr,uint8_t *data,int32_t datasize)
{
    int32_t i;
    for (i=0; i<NUMASSETS; i++)
    {
        if ( ASKvu[peerid][i] == dejavu )
        {
            disp_assetorders(-1,ASSETS[i].name,data,datasize);
            ASKvu[peerid][i] = 0;
            ASKvutick[peerid][i] = 0;
            return;
        }
        if ( BIDvu[peerid][i] == dejavu )
        {
            disp_assetorders(1,ASSETS[i].name,data,datasize);
            BIDvu[peerid][i] = 0;
            BIDvutick[peerid][i] = 0;
            return;
        }
    }
    /*if ( datasize == sizeof(*EO) )
    {
        EO = (struct qxGetEntityOrder_output *)data;
        n = sizeof(EO->orders) /sizeof(*EO->orders);
        for (i=0; i<n; i++)
        {
            if ( memcmp(zero,&EO->orders[i],sizeof(zero)) != 0 )
            {
                if ( bidask == 0 )
                {
                    if ( EO->orders[i].price < 0 )
                    {
                        dir = -1;
                        bidask = "ASK";
                    }
                    else if ( EO->orders[i].price > 0 )
                    {
                        dir = 1;
                        bidask = "BID";
                    }
                    else continue;
                }
                else if ( dir*EO->orders[i].price < 0 )
                    printf("EO: dir.%d mismatch vs price[%d] %s\n",dir,i,amountstr(EO->orders[i].price));
                pubkey2addr(EO->orders[i].issuer,addr);
                memset(assetname,0,8);
                memcpy(assetname,&EO->orders[i].assetName,8);
                bidask = EO->orders[i].price < 0 ? "ASK" : "BID";
                printf("EO %s %s %s %s at %s\n",addr,bidask,assetname,amountstr(EO->orders[i].numberOfShares),amountstr2(dir * EO->orders[i].price));
            }
        }
    }
    else printf("unexpected datasize %d for contract response\n",datasize);*/
}

int32_t qxGetAssetOrder(uint32_t *sendvup,char *ipaddr,int32_t sock,const char *assetname,int64_t offset,int32_t procedureNumber)
{
    int32_t len,sz,recvbyte,ptr = 0;
    char name[8],addr[64];
    struct quheader H;
    struct RequestContractFunction rcf;
    struct Orders_Output *op;
    struct qxGetAssetOrder_input qgao;
    uint8_t packet[sizeof(H) + sizeof(rcf) + sizeof(qgao)];
    len = contractrequest(packet,&H,&rcf,sizeof(qgao),QX_CONTRACT_ID,procedureNumber);
    *sendvup = H._dejavu;
    memset(&qgao,0,sizeof(qgao));
    memset(name,0,sizeof(name));
    strncpy(name,assetname,8);
    memcpy(&qgao.assetName,name,sizeof(qgao.assetName));
    if ( issuerpubkey(assetname,qgao.issuer) < 0 )
        return(sock);
    qgao.offset = offset;
    memcpy(&packet[len],&qgao,sizeof(qgao));
    if ( sock >= 0 )
        return(socksend(ipaddr,sock,packet,sizeof(packet)));
    if ( (sock= myconnect(ipaddr,DEFAULT_NODE_PORT)) < 0 )
        return(-1);
    if ( sendbuffer(sock,packet,sizeof(packet)) == sizeof(packet) )
    {
        uint8_t recvbuf[sizeof(struct qxGetAssetOrder_output)*2],zero[32];
        memset(recvbuf,0,sizeof(recvbuf));
        memset(zero,0,sizeof(zero));
        if ( (recvbyte= receiveall(sock,recvbuf,sizeof(recvbuf))) > 0 )
        {
            while ( ptr < recvbyte )
            {
                memcpy(&H,&recvbuf[ptr],sizeof(H));
                sz = ((H._size[2] << 16) + (H._size[1] << 8) + H._size[0]);
                printf("sendvu.%x %x received %d, size.%d type.%d\n",*sendvup,H._dejavu,recvbyte,sz,H._type);
                if ( H._dejavu == *sendvup && H._type == RESPOND_CONTRACT_FUNCTION )
                {
                    op = (struct Orders_Output *)&recvbuf[ptr + sizeof(H)];
                    for (int i=0; i<256; i++,op++)
                    {
                        if ( memcmp(zero,op->pubkey,32) == 0 )
                            continue;
                        pubkey2addr(op->pubkey,addr);
                        printf("i.%d: %s %s %s %s\n",i,procedureNumber==QX_GET_ASSET_BID_ORDER_PR?"BID":"ASK",addr,amountstr(op->numberOfShares),amountstr2(op->price));
                    }
                }
                ptr += sz;
            }
        }
    }
    close(sock);
    return(0);
}

int32_t qxGetAssetAskOrder(uint32_t *sendvup,char *ipaddr,int32_t sock,const char *assetname,int64_t offset)
{
    return(qxGetAssetOrder(sendvup,ipaddr,sock,assetname,offset,QX_GET_ASSET_ASK_ORDER_PR));
}

int32_t qxGetAssetBidOrder(uint32_t *sendvup,char *ipaddr,int32_t sock,const char *assetname,int64_t offset)
{
    return(qxGetAssetOrder(sendvup,ipaddr,sock,assetname,offset,QX_GET_ASSET_BID_ORDER_PR));
}

void printAssetOrders(struct qxGetAssetOrder_output *O,const char *assetname)
{
    int i,n = sizeof(O->orders) /sizeof(*O->orders);
    char addr[64],*bidask;
    uint8_t zero[32];
    memset(zero,0,sizeof(zero));
    for (i=0; i<n; i++)
    {
        if ( memcmp(zero,O->orders[i].pubkey,32) != 0 )
        {
            pubkey2addr(O->orders[i].pubkey,addr);
            bidask = O->orders[i].price < 0 ? "ASK" : "BID";
            printf("%s %s %s %s at %s\n",addr,bidask,assetname,amountstr(O->orders[i].numberOfShares),amountstr2(O->orders[i].price));
        }
    }
}

void printEntityOrders(struct qxGetEntityOrder_output *O)
{
    int i,n = sizeof(O->orders) /sizeof(*O->orders);
    char addr[64],assetname[8],*bidask;
    struct EntityOrder zero[32];
    memset(zero,0,sizeof(zero));
    for (i=0; i<n; i++)
    {
        if ( memcmp(zero,&O->orders[i],sizeof(zero)) != 0 )
        {
            pubkey2addr(O->orders[i].issuer,addr);
            memset(assetname,0,8);
            memcpy(assetname,&O->orders[i].assetName,8);
            bidask = O->orders[i].price < 0 ? "ASK" : "BID";
            printf("%s %s %s %s at %s\n",addr,bidask,assetname,amountstr(O->orders[i].numberOfShares),amountstr2(O->orders[i].price));
        }
    }
}



