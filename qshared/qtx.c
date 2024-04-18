#define FAN 25



int32_t create_rawtxhex(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t subseed[32],int32_t type,const uint8_t srcpub[32],const uint8_t destpub[32],int64_t total,const uint8_t *extradata,int32_t extrasize,int32_t txtick)
{
    struct
    {
        Transaction transaction;
        unsigned char extradata[MAX_INPUT_SIZE];
        unsigned char signature[64];
    } packet;
    uint8_t signature[64];
    memcpy(packet.transaction.sourcePublicKey,srcpub,32);
    memcpy(packet.transaction.destinationPublicKey,destpub,32);
    packet.transaction.amount = total;
    if ( txtick == 0 )
    {
        txtick = LATEST_TICK + TICKOFFSET;
        printf("auto set scheduledTick %d\n",txtick);
    }
    packet.transaction.tick = txtick;
    packet.transaction.inputType = type;
    packet.transaction.inputSize = extrasize;
    if ( extrasize > 0 )
        memcpy(packet.extradata,extradata,extrasize);
    KangarooTwelve((unsigned char *)&packet.transaction,sizeof(packet.transaction) + extrasize,digest,32);
    sign(subseed,srcpub,digest,signature);
    memcpy(&packet.extradata[extrasize],signature,64);
    KangarooTwelve((unsigned char *)&packet.transaction,sizeof(packet.transaction) + extrasize + 64,digest,32); // recompute for txhash
    getTxHashFromDigest(digest,txhash);
    memset(rawhex,0,(sizeof(packet.transaction) + extrasize + 64)*2 + 1);
    byteToHex((uint8_t *)&packet.transaction,rawhex,sizeof(packet.transaction) + extrasize + 64);
    return(txtick);
}

int32_t create_rawsendmany(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t *subseed,uint32_t scheduledTick,struct pubkeypay *payments,int32_t numpayments)
{
    uint8_t privateKey[32],sourcePublicKey[32],destPublicKey[32];
    int64_t total = SENDMANYFEE;
    getPrivateKeyFromSubSeed(subseed,privateKey);
    getPublicKeyFromPrivateKey(privateKey,sourcePublicKey);
    memset(destPublicKey,0,sizeof(destPublicKey));
    ((uint64_t *)destPublicKey)[0] = QUTIL_CONTRACT_ID;
    memset(digest,0,32);
    for (int i=0; i<numpayments; i++)
        total += payments->amounts[i];
    scheduledTick = create_rawtxhex(rawhex,txhash,digest,subseed,SENDTOMANYV1,sourcePublicKey,destPublicKey,total,(uint8_t *)payments,sizeof(*payments),scheduledTick);
    txhash[60] = 0;
    //char publicIdentity[64] = {0};
    //pubkey2addr(sourcePublicKey,publicIdentity);
    //printf("%s sent %d payments for total of %s\n",publicIdentity,numpayments,amountstr(total));
    //printf("%s datalen.%d\n%s\n\n",txhash,(int32_t)strlen(rawhex)/2,rawhex);
    memset(privateKey,0xff,sizeof(privateKey));
    memset(privateKey,0,sizeof(privateKey));
    return(scheduledTick);
}

int32_t create_rawrevealcommit(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t *subseed,uint32_t scheduledTick,struct RevealAndCommit_input *randominput,int64_t stakeamount)
{
    uint8_t privateKey[32],sourcePublicKey[32],destPublicKey[32];
    getPrivateKeyFromSubSeed(subseed,privateKey);
    getPublicKeyFromPrivateKey(privateKey,sourcePublicKey);
    memset(destPublicKey,0,sizeof(destPublicKey));
    ((uint64_t *)destPublicKey)[0] = RANDOM_CONTRACT_ID;
    memset(digest,0,32);
    scheduledTick = create_rawtxhex(rawhex,txhash,digest,subseed,RANDOM_REVEALCOMMIT,sourcePublicKey,destPublicKey,stakeamount,(uint8_t *)randominput,sizeof(*randominput),scheduledTick);
    txhash[60] = 0;
    char destaddr[64],publicIdentity[64];
    pubkey2addr(sourcePublicKey,publicIdentity);
    pubkey2addr(destPublicKey,destaddr);
    printf("%s sent %s to %s, scheduledTick.%d\n",publicIdentity,amountstr(stakeamount),destaddr,scheduledTick);
    printf("%s datalen.%d\n%s\n\n",txhash,(int32_t)strlen(rawhex)/2,rawhex);
    memset(privateKey,0xff,sizeof(privateKey));
    memset(privateKey,0,sizeof(privateKey));
    return(scheduledTick);
}

int32_t create_rawtransaction(char *rawhex,char *txhash,uint8_t digest[32],const uint8_t *subseed,const char *targetIdentity,const uint64_t amount,uint32_t scheduledTick,char *datastr)
{
    uint8_t privateKey[32],sourcePublicKey[32],destPublicKey[32],extradata[MAX_INPUT_SIZE];
    int32_t extradatasize = 0;
    char addr[64];
    getPrivateKeyFromSubSeed(subseed,privateKey);
    getPublicKeyFromPrivateKey(privateKey,sourcePublicKey);
    if ( addr2pubkey(targetIdentity,destPublicKey) == 0 )
    {
        char checkaddr[64];
        for (int i=0; targetIdentity[i]!=0; i++)
        {
            strcpy(checkaddr,targetIdentity);
            for (int j='A'; j<='Z'; j++)
            {
                checkaddr[i] = j;
                if ( checkSumIdentity(checkaddr) != 0 )
                {
                    printf("changing %dth to %c to %s passes checksum\n",i,j,checkaddr);
                    break;
                }
            }
        }
        memset(privateKey,0xff,sizeof(privateKey));
        memset(privateKey,0,sizeof(privateKey));
        return(-1);
    }
    if ( datastr != 0 && (extradatasize= (int32_t)strlen(datastr)) >= 2 && extradatasize <= MAX_INPUT_SIZE*2 )
    {
        extradatasize >>= 1;
        hexToByte(datastr,extradata,extradatasize);
        //printf("extradatasize.%d (%s)\n",extradatasize,datastr);
    }
    create_rawtxhex(rawhex,txhash,digest,subseed,0,sourcePublicKey,destPublicKey,amount,extradata,extradatasize,scheduledTick);
    txhash[60] = 0;
    pubkey2addr(sourcePublicKey,addr);
    printf("%s %s -> %s\n%s\n%s\n\n",addr,amountstr(amount),targetIdentity,txhash,rawhex);
    memset(privateKey,0xff,sizeof(privateKey));
    memset(privateKey,0,sizeof(privateKey));
    return(0);
}

int32_t issuerpubkey(const char *assetname,uint8_t pubkey[32])
{
    static int32_t didinit;
    int32_t i;
    if ( didinit == 0 )
    {
        for (i=0; i<sizeof(ASSETS)/sizeof(*ASSETS); i++)
        {
            if ( ASSETS[i].addr != 0 && ASSETS[i].addr[0] != 0 )
                addr2pubkey(ASSETS[i].addr,ASSETS[i].pubkey);
        }
        didinit = 1;
    }
    for (i=0; i<sizeof(ASSETS)/sizeof(*ASSETS); i++)
    {
        if ( strcmp(assetname,ASSETS[i].name) == 0 )
        {
            memcpy(pubkey,ASSETS[i].pubkey,32);
            return(i);
        }
    }
    return(-1);
}
