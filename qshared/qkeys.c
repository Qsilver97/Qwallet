
bool getSubseedFromSeed(const uint8_t* seed, uint8_t* subseed)
{
    uint8_t seedBytes[55];
    for (int i = 0; i < 55; i++)
    {
        if (seed[i] < 'a' || seed[i] > 'z')
        {
            return false;
        }
        seedBytes[i] = seed[i] - 'a';
    }
    KangarooTwelve(seedBytes, sizeof(seedBytes), subseed, 32);

    return true;
}

void getPrivateKeyFromSubSeed(const uint8_t* seed, uint8_t* privateKey)
{
    KangarooTwelve(seed, 32, privateKey, 32);
}

void getPublicKeyFromPrivateKey(const uint8_t* privateKey, uint8_t* publicKey)
{
    point_t P;
    ecc_mul_fixed((unsigned long long*)privateKey, P); // Compute public key
    encode(P, publicKey);
}

void getIdentityFromPublicKey(const uint8_t* pubkey, char* dstIdentity, bool isLowerCase)
{
    uint8_t publicKey[32] ;
    memcpy(publicKey, pubkey, 32);
    uint16_t identity[61] = {0};
    for (int i = 0; i < 4; i++)
    {
        unsigned long long publicKeyFragment = *((unsigned long long*)&publicKey[i << 3]);
        for (int j = 0; j < 14; j++)
        {
            identity[i * 14 + j] = publicKeyFragment % 26 + (isLowerCase ? L'a' : L'A');
            publicKeyFragment /= 26;
        }
    }
    unsigned int identityBytesChecksum;
    KangarooTwelve(publicKey, 32, (uint8_t*)&identityBytesChecksum, 3);
    identityBytesChecksum &= 0x3FFFF;
    for (int i = 0; i < 4; i++)
    {
        identity[56 + i] = identityBytesChecksum % 26 + (isLowerCase ? L'a' : L'A');
        identityBytesChecksum /= 26;
    }
    identity[60] = 0;
    for (int i = 0; i < 60; i++) dstIdentity[i] = identity[i];
}

void getTxHashFromDigest(const uint8_t* digest, char* txHash)
{
    bool isLowerCase = true;
    getIdentityFromPublicKey(digest,txHash,isLowerCase);
}

bool checkSumIdentity(const char* identity)
{
    unsigned char publicKeyBuffer[32];
    for (int i = 0; i < 4; i++)
    {
        *((unsigned long long*) & publicKeyBuffer[i << 3]) = 0;
        for (int j = 14; j-- > 0; )
        {
            if (identity[i * 14 + j] < 'A' || identity[i * 14 + j] > 'Z')
            {
                return false;
            }

            *((unsigned long long*) & publicKeyBuffer[i << 3]) = *((unsigned long long*) & publicKeyBuffer[i << 3]) * 26 + (identity[i * 14 + j] - 'A');
        }
    }
    unsigned int identityBytesChecksum;
    KangarooTwelve(publicKeyBuffer, 32, (unsigned char*)&identityBytesChecksum, 3);
    identityBytesChecksum &= 0x3FFFF;
    for (int i = 0; i < 4; i++)
    {
        if (identityBytesChecksum % 26 + 'A' != identity[56 + i])
        {
            return false;
        }
        identityBytesChecksum /= 26;
    }
    return true;
}

/*bool getPublicKeyFromIdentity(const char* identity, uint8_t* publicKey)
{
    unsigned char publicKeyBuffer[32];
    if ( checkSumIdentity(identity) == false )
        return(false);
    for (int i = 0; i < 4; i++)
    {
        *((unsigned long long*)&publicKeyBuffer[i << 3]) = 0;
        for (int j = 14; j-- > 0; )
        {
            if (identity[i * 14 + j] < 'A' || identity[i * 14 + j] > 'Z')
            {
                return(false);
            }

            *((unsigned long long*)&publicKeyBuffer[i << 3]) = *((unsigned long long*)&publicKeyBuffer[i << 3]) * 26 + (identity[i * 14 + j] - 'A');
        }
    }
    memcpy(publicKey, publicKeyBuffer, 32);
    return(true);
}*/

void pubkey2addr(uint8_t pubkey[32],char *addr)
{
    getIdentityFromPublicKey(pubkey,addr,false);
    addr[60] = 0;
}

bool addr2pubkey(const char *identity,uint8_t pubkey[32])
{
    int64_t partial;
    uint32_t checksum;
    int32_t i,j,c;
    memset(pubkey,0,32);
    for (i=0; i<4; i++)
    {
        partial = 0;
        for (j=14; j-- > 0; )
        {
            c = identity[i * 14 + j] - 'A';
            if ( c < 0 || c >= 26 )
            {
                memset(pubkey,0,32);
                return(false);
            }
            partial = partial * 26 + c;
        }
        *((int64_t *) &pubkey[i << 3]) = partial;
    }
    KangarooTwelve(pubkey,32,(uint8_t *)&checksum,3);
    checksum &= 0x3FFFF;
    for (i=0; i<4; i++)
    {
        if ( (checksum % 26) + 'A' != identity[56 + i] )
        {
            memset(pubkey,0,32);
            return(false);
        }
        checksum /= 26;
    }
    return(true);
}

bool txid2digest(const char *txid,uint8_t digest[32])
{
    int64_t partial;
    uint32_t checksum;
    int32_t i,j,c;
    memset(digest,0,32);
    for (i=0; i<4; i++)
    {
        partial = 0;
        for (j=14; j-- > 0; )
        {
            c = txid[i * 14 + j] - 'a';
            if ( c < 0 || c >= 26 )
            {
                memset(digest,0,32);
                return(false);
            }
            partial = partial * 26 + c;
        }
        *((int64_t *) &digest[i << 3]) = partial;
    }
    KangarooTwelve(digest,32,(uint8_t *)&checksum,3);
    checksum &= 0x3FFFF;
    for (i=0; i<4; i++)
    {
        if ( (checksum % 26) + 'a' != txid[56 + i] )
        {
            memset(digest,0,32);
            return(false);
        }
        checksum /= 26;
    }
    return(true);
}


void deriveaddr(char *seed,char *extrastr,uint8_t subseed[32],uint8_t privatekey[32],uint8_t publickey[32],char addr[61])
{
    uint8_t extraseed[64];
    if ( extrastr != 0 && extrastr[0] != 0 )
    {
        getSubseedFromSeed((uint8_t *)seed,extraseed);
        KangarooTwelve((uint8_t *)extrastr,(int32_t)strlen(extrastr),&extraseed[32],32);
        KangarooTwelve(extraseed,sizeof(extraseed),subseed,32);
    } else getSubseedFromSeed((uint8_t *)seed,subseed);
    getPrivateKeyFromSubSeed(subseed,privatekey);
    getPublicKeyFromPrivateKey(privatekey,publickey);
    getIdentityFromPublicKey(publickey,addr,false);
    addr[60] = 0;
}

int seed2addr(char *seed,char *addr)
{
    uint8_t subseed[32],privatekey[32],publickey[32];
    deriveaddr(seed,(char *)"",subseed,privatekey,publickey,addr);
    return(0);
}

int32_t istxid(char *checkstr)
{
    int32_t i;
    if ( strlen(checkstr) == 60 ) // could check for checksum too
    {
        for (i=0; i<60; i++)
        {
            if ( checkstr[i] < 'a' || checkstr[i] > 'z' )
                return(0);
        }
        return(1);
    }
    return(0);
}

