#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <memory.h>
#include <fcntl.h>
#include <unistd.h>
#include "uthash.h"

#include "qshared/K12AndKeyUtil.h"
#include "qshared/qdefines.h"
#include "qshared/qstructs.h"
#include "qshared/qkeys.c"
#include "qshared/qhelpers.c"

struct locations
{
    const char *quorumdir,*tickdatadir,*qsuffix,*txsuffix;
    int firstepoch,lastepoch,method;
};

struct locations ORIG = { "","/root/qubic-cli/build/epochs","","",83,90,0 };
struct locations QSILVER = { "/root/qsilver/qubic-cli/build/quorum","/root/qsilver/qubic-cli/build/epochs","","",91,99,1 };
struct locations QWALLET = { "/root/qwallet/epochs","/root/qwallet/epochs",".Q","",100,101,2 };
struct locations REALTIME = { "/root/qwallet/epochs","/root/qwallet/epochs",".Q","",0,0,2 };

struct archivetx
{
    UT_hash_handle hh;
    uint8_t txid[32];
    Transaction tx;
} *TXIDS;
int32_t DUPLICATE_ATTEMPTS,ARCHIVE_TICK,NEWEST_ARCHIVE;

FILE *get_archivefp(void)
{
    FILE *fp;
    char fname[512];
    sprintf(fname,"%s%carchive",DATADIR,dir_delim());
    if ( (fp= fopen(fname,"rb+")) != 0 )
        fseek(fp,0,SEEK_END);
    else fp = fopen(fname,"wb");
    if ( fp == 0 )
    {
        printf("cannot open archive\n");
        exit(0);
    }
    return(fp);
}

FILE *history_fp(char *addr)
{
    FILE *fp;
    char fname[512];
    sprintf(fname,"%s%chistory%c%s",DATADIR,dir_delim(),dir_delim(),addr);
    if ( (fp= fopen(fname,"rb+")) != 0 )
        fseek(fp,0,SEEK_END);
    else fp = fopen(fname,"wb");
    return(fp);
}

void archivetxadd(int32_t addhistory,uint8_t txid[32],Transaction *tx)
{
    FILE *fp;
    struct archivetx *qtx;
    char addr[64],dest[64];
    pubkey2addr(tx->sourcePublicKey,addr);
    pubkey2addr(tx->destinationPublicKey,dest);
    qtx = (struct archivetx *)calloc(1,sizeof(*qtx));
    memcpy(qtx->txid,txid,sizeof(qtx->txid));
    memcpy(&qtx->tx,tx,sizeof(qtx->tx));
    HASH_ADD_KEYPTR(hh,TXIDS,qtx->txid,sizeof(qtx->txid),qtx);
    if ( tx->tick > NEWEST_ARCHIVE )
        NEWEST_ARCHIVE = tx->tick;
    char txidstr[64];
    digest2txid(txid,txidstr);
    
    if ( strcmp((char *)"CDGLBMSHUQXHSAVGYICEWHCPQIBAYQXPPLEQGEDOVGKYCXOTCOQLXAPASCBA",addr) == 0 || strcmp((char *)"CDGLBMSHUQXHSAVGYICEWHCPQIBAYQXPPLEQGEDOVGKYCXOTCOQLXAPASCBA",dest) == 0 )
        printf("tick.%d %s %s %s -> %s\n",tx->tick,txidstr,addr,amountstr(tx->amount),dest);
    if ( addhistory != 0 )
    {
        if ( (fp= history_fp(addr)) != 0 )
        {
            fwrite(&qtx->txid,1,sizeof(qtx->txid)+sizeof(qtx->tx),fp);
            fclose(fp);
        } else printf("error creating history file for %s\n",addr);
        if ( (fp= history_fp(dest)) != 0 )
        {
            fwrite(&qtx->txid,1,sizeof(qtx->txid)+sizeof(qtx->tx),fp);
            fclose(fp);
        } else printf("error creating history file for %s\n",dest);
    }
}

int32_t load_archive(void)
{
    FILE *fp;
    uint8_t txid[32];
    Transaction tx;
    char fname[512];
    struct archivetx *qtx = 0;
    int32_t n = 0;
    sprintf(fname,"%s%carchive",DATADIR,dir_delim());
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        while ( 1 )
        {
            if ( fread(txid,1,sizeof(txid),fp) != sizeof(txid) )
            {
                printf("error reading %dth txid\n",n);
                break;
            }
            if ( fread(&tx,1,sizeof(tx),fp) != sizeof(tx) )
            {
                printf("error reading %dth tx\n",n);
                break;
            }
            HASH_FIND(hh,TXIDS,txid,sizeof(qtx->txid),qtx);
            if ( qtx != 0 )
            {
                printf("unexpected duplicate in position %d\n",n);
                break;
            }
            archivetxadd(0,txid,&tx);
            n++;
        }
        fclose(fp);
    }
    printf("loaded %d from archive\n",n);
    return(n);
}

void archivetx(FILE *fp,Transaction *tx,uint8_t txid[32])
{
    struct archivetx *qtx = 0;
    HASH_FIND(hh,TXIDS,txid,sizeof(qtx->txid),qtx);
    if ( qtx == 0 )
    {
        archivetxadd(1,txid,tx);
        if ( fwrite(txid,1,32,fp) != 32 )
        {
            printf("error writing digest to archive\n");
            fclose(fp);
            exit(-1);
        }
        if ( fwrite(tx,1,sizeof(*tx),fp) != sizeof(*tx) )
        {
            printf("error writing tx to archive\n");
            fclose(fp);
            exit(-1);
        }
    } else DUPLICATE_ATTEMPTS++; //printf("do not add duplicate to archive\n");
}

int32_t loadqtx(FILE *fp,int32_t tick,int32_t *moneytxp,FILE *txfp)
{
    int32_t txlen,retval = -1;
    char txidstr[64],addr[64],dest[64];
    Transaction tx;
    uint8_t txid[32],cmptxid[32],txdata[MAX_TX_SIZE],zero[32],pubkey[32],digest[32];
    if ( fread(&txlen,1,sizeof(txlen),fp) != sizeof(txlen) )
    {
        //printf("tick.%d error reading txlen at pos %ld\n",tick,ftell(fp));
    }
    else if ( txlen < sizeof(txdata) )
    {
        if ( fread(txid,1,sizeof(txid),fp) != sizeof(txid) )
        {
            printf("tick.%d error reading txid at pos %ld\n",tick,ftell(fp));
        }
        else if ( fread(txdata,1,txlen,fp) != txlen )
        {
            printf("tick.%d error reading txdata at pos %ld\n",tick,ftell(fp));
        }
        else
        {
            KangarooTwelve(txdata,txlen,cmptxid,32);
            getTxHashFromDigest(txid,txidstr);
            txidstr[60] = 0;
            if ( memcmp(txid,cmptxid,sizeof(txid)) == 0 )
            {
                memcpy(&tx,txdata,sizeof(tx));
                pubkey2addr(tx.sourcePublicKey,addr);
                if ( tx.tick == tick && tx.amount != 0 && memcmp(tx.sourcePublicKey,tx.destinationPublicKey,32) != 0 )
                {
                    if ( tx.inputType == SENDTOMANYV1 )
                    {
                        if ( ((uint64_t *)tx.destinationPublicKey)[0] == QUTIL_CONTRACT_ID )
                        {
                            memset(zero,0,sizeof(zero));
                            for (int k=0; k<25; k++)
                            {
                                memcpy(pubkey,&txdata[sizeof(tx) + k*32],32);
                                tx.amount = *(uint64_t *)&txdata[sizeof(tx) + 25*32 + k*8];
                                if ( memcmp(pubkey,zero,32) != 0 && tx.amount != 0 )
                                {
                                    pubkey2addr(pubkey,dest);
                                    memcpy(tx.destinationPublicKey,pubkey,32);
                                    tx.inputType = (QUTIL_CONTRACT_ID << 5) | k;
                                    KangarooTwelve((uint8_t *)&tx,sizeof(tx),digest,32);
                                    archivetx(txfp,&tx,digest);
                                    (*moneytxp)++;
                                    //printf("%s %s, ",dest,amountstr(tx.amount));
                                }
                            }
                            //printf("detected sendmany from %s extrasize.%d\n",addr,tx.inputSize);
                        }
                    }
                    else
                    {
                        archivetx(txfp,&tx,txid);
                        (*moneytxp)++;
                    }
                }
                retval = 0;
            }
            //else printf("error comparing %s at pos %ld\n",txidstr,*fposp);
        }
    }
    //else
    //    printf("illegal txlen.%d pos %ld\n",txlen,*fposp);
    return(retval);
}

int32_t load_qubic_cli_file(FILE *txfp,struct locations *lp,int32_t epoch,int32_t tick,int32_t *goodp,int32_t *moneytxp)
{
    char fname[512],txid[64];
    FILE *fp;
    TickData TD;
    Transaction tx;
    uint8_t txdata[MAX_TX_SIZE],zero[32],digest[32],pubkey[32];
    int32_t i,j,n,matched,txlen,missing = 0;
    memset(zero,0,sizeof(zero));
    sprintf(fname,"%s/%d/%d%s",lp->tickdatadir,epoch,tick,lp->txsuffix);
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        if ( fread(&TD,1,sizeof(TD),fp) == sizeof(TD) )
        {
            n = 0;
            for (i=0; i<NUMBER_OF_TRANSACTIONS_PER_TICK; i++)
            {
                if ( memcmp(zero,TD.transactionDigests[i],32) != 0 )
                    n++;
                else break;
            }
            i = matched = 0;
            while ( 1 )
            {
                if ( fread(&tx,1,sizeof(tx),fp) == sizeof(tx) )
                {
                    memcpy(txdata,&tx,sizeof(tx));
                    if ( tx.inputSize != 0 )
                    {
                        if ( tx.inputSize < 0 || tx.inputSize < MAX_INPUT_SIZE )
                        {
                            if ( fread(&txdata[sizeof(tx)],1,tx.inputSize,fp) != tx.inputSize )
                            {
                                printf("error reading extradata %s tx.%d of %d\n",fname,i,n);
                                break;
                            }
                        }
                    }
                    if ( fread(&txdata[sizeof(tx)+tx.inputSize],1,SIGNATURE_SIZE,fp) != SIGNATURE_SIZE )
                    {
                        printf("error reading signature %s tx.%d of %d\n",fname,i,n);
                        break;
                    }
                    txlen = sizeof(tx) + tx.inputSize + SIGNATURE_SIZE;
                    KangarooTwelve(txdata,txlen,digest,32);
                    getTxHashFromDigest(digest,txid);
                    txid[60] = 0;
                    for (j=0; j<n; j++)
                    {
                        if ( memcmp(digest,TD.transactionDigests[j],sizeof(digest)) == 0 )
                            break;
                    }
                    if ( j == n )
                    {
                        printf("%s %s not found len.%d extra.%d fpos.%ld\n",fname,txid,txlen,tx.inputSize,ftell(fp));
                        break;
                    }
                    else
                    {
                        char addr[64],dest[64];
                        pubkey2addr(tx.sourcePublicKey,addr);
                        pubkey2addr(tx.destinationPublicKey,dest);
                        //printf("%s: %s %s -> %s extra.%d tick.%d\n",txid,addr,amountstr(tx.amount),dest,tx.inputSize,tick);
                        if ( tx.tick == tick && tx.amount != 0 && memcmp(tx.sourcePublicKey,tx.destinationPublicKey,32) != 0 )
                        {
                            if ( tx.inputType == SENDTOMANYV1 )
                            {
                                if ( ((uint64_t *)tx.destinationPublicKey)[0] == QUTIL_CONTRACT_ID )
                                {
                                    memset(zero,0,sizeof(zero));
                                    for (int k=0; k<25; k++)
                                    {
                                        memcpy(pubkey,&txdata[sizeof(tx) + k*32],32);
                                        tx.amount = *(uint64_t *)&txdata[sizeof(tx) + 25*32 + k*8];
                                        if ( memcmp(pubkey,zero,32) != 0 && tx.amount != 0 )
                                        {
                                            pubkey2addr(pubkey,dest);
                                            memcpy(tx.destinationPublicKey,pubkey,32);
                                            tx.inputType = (QUTIL_CONTRACT_ID << 5) | k;
                                            KangarooTwelve((uint8_t *)&tx,sizeof(tx),digest,32);
                                            archivetx(txfp,&tx,digest);
                                            printf("%s %s, ",dest,amountstr(tx.amount));
                                        }
                                    }
                                    printf("detected sendmany from %s extrasize.%d\n",addr,tx.inputSize);
                                }
                                memset(tx.destinationPublicKey,0,32);
                                ((uint64_t *)tx.destinationPublicKey)[0] = QUTIL_CONTRACT_ID;
                                tx.amount = SENDMANYFEE;
                                tx.inputType = SENDTOMANYV1;
                                // fall through to normal case
                            }
                            archivetx(txfp,&tx,digest);
                            (*moneytxp)++;
                        }
                        matched++;
                    }
                    i++;
                } else break;
            }
            if ( matched == n )
            {
                missing = 0;
                (*goodp)++;
            }
            else if ( matched != 0 )
            {
                printf("matched %d of %d, for %s   good.%d\n",matched,n,fname,*goodp);
            }
        }
        fclose(fp);
    } else return(0);
    return(missing == 0);
}

void origscanepoch(struct locations *lp,int32_t epoch,int32_t initialtick)
{
    FILE *fp,*txfp;
    int32_t tick,good,moneytx,missing,lasttick;
    good = 0;
    moneytx = 0;
    lasttick = 0;
    missing = 0;
    txfp = get_archivefp();
    for (tick=initialtick; tick<initialtick+MAXTICKS; tick++)
    {
        if ( load_qubic_cli_file(txfp,lp,epoch,tick,&good,&moneytx) != 0 )
        {
            lasttick = tick;
            missing = 0;
        } else missing++;
        if ( missing > 10000 )
            break;
    }
    fclose(txfp);
    printf("missing.%d epoch.%d end at %d numticks.%d, good.%d moneytx.%d\n",missing,epoch,lasttick,lasttick - initialtick,good,moneytx);
}

void scanepoch(struct locations *lp,int32_t epoch,int32_t initialtick)
{
    FILE *fp,*fp2,*txfp;
    char fname[512],fnameQ[512];
    TickData TD;
    Tick Q;
    uint8_t tdigest[32],digest[32],zero[32];
    int32_t j,n,haveQ,loaded,emptytick,notxdigests,tick,endtick,good,moneytx,lasttick = 0,missing = 0;
    txfp = get_archivefp();
    good = 0;
    moneytx = 0;
    emptytick = 0;
    notxdigests = 0;
    memset(zero,0,sizeof(zero));
    endtick = initialtick+MAXTICKS;
    if ( epoch == 0 )
    {
        if ( EPOCH == 0 || HAVE_TXTICK == 0 )
        {
            printf("EPOCH.%d HAVE_TXTICK.%d notready\n",EPOCH,HAVE_TXTICK);
            return;
        }
        epoch = EPOCH;
        endtick = HAVE_TXTICK-10;
        if ( ARCHIVE_TICK > 0 )
            initialtick = ARCHIVE_TICK+1;
        else initialtick = INITIAL_TICK;
    }
    if ( endtick >= initialtick )
        printf("scan %s %d from %d to %d\n",lp->tickdatadir,epoch,initialtick,endtick);
    for (tick=initialtick; tick<=endtick; tick++)
    {
        sprintf(fname,"%s/%d/%d%s",lp->tickdatadir,epoch,tick,lp->txsuffix);
        sprintf(fnameQ,"%s/%d/%d%s",lp->quorumdir,epoch,tick,lp->qsuffix);
        if ( (fp= fopen(fnameQ,"rb")) != 0 )
        {
            haveQ = 0;
            while ( fread(&Q,1,sizeof(Q),fp) == sizeof(Q) )
            {
                if ( Q.tick == tick )
                {
                    haveQ = 1;
                    break;
                }
            }
            fclose(fp);
            if ( haveQ == 0 )
            {
                printf("error reading quorum %s\n",fnameQ);
                break;
            }
            memcpy(tdigest,Q.transactionDigest,32);
            if ( memcmp(zero,tdigest,32) == 0 )
            {
                emptytick++;
                missing = 0;
                lasttick = tick;
                ARCHIVE_TICK = tick;
                printf("Z.%d ",ARCHIVE_TICK);
                continue;
            }
            if ( (fp= fopen(fname,"rb")) != 0 )
            {
                if ( fread(&TD,1,sizeof(TD),fp) == sizeof(TD) )
                {
                    KangarooTwelve((uint8_t *)&TD,sizeof(TD),digest,32);
                    if ( memcmp(digest,tdigest,32) == 0 )
                    {
                        if ( lp->method == 1 )
                            loaded = load_qubic_cli_file(txfp,lp,epoch,tick,&good,&moneytx);
                        else
                        {
                            for (n=0; n<NUMBER_OF_TRANSACTIONS_PER_TICK; n++)
                            {
                                if ( memcmp(zero,TD.transactionDigests[n],sizeof(zero)) == 0 )
                                    break;
                            }
                            if ( n > 0 )
                            {
                                good++;
                                sprintf(fname,"%s/%d/%d.T",lp->tickdatadir,epoch,tick);
                                if ( (fp2= fopen(fname,"rb")) != 0 )
                                {
                                    j = 0;
                                    while ( loadqtx(fp2,tick,&moneytx,txfp) >= 0 )
                                        j++;
                                    fclose(fp2);
                                    if ( j == n )
                                        loaded = 1;
                                    else printf("%d numtx.%d of %d\n",tick,j,n);
                                } else printf("could not load transactions %s\n",fname);
                            } else notxdigests++;
                        }
                        if ( loaded != 0 )
                        {
                            lasttick = tick;
                            if ( epoch == EPOCH )
                            {
                                FILE *atfp;
                                ARCHIVE_TICK = tick;
                                char fname[512];
                                sprintf(fname,"%s%chistory.tick",DATADIR,dir_delim());
                                if ( (atfp= fopen(fname,"wb")) != 0 )
                                {
                                    fwrite(&ARCHIVE_TICK,1,sizeof(ARCHIVE_TICK),atfp);
                                    fclose(atfp);
                                }
                            }
                            missing = 0;
                        } else printf("error loading tick.%d\n",tick);// rarely happens. else missing++;
                    }
                    else
                    {
                        printf("TD digest mismatch %d\n",tick);
                    }
                } else printf("error loading TD tick.%d\n",tick);
                fclose(fp);
            }
            else
            {
                printf("tick.%d missing\n",tick);
                missing++;
            }
        }
        else
        {
            printf("could not open %s\n",fname);
            missing++;
        }
        if ( missing > 10000 || (epoch == EPOCH && missing != 0) )
            break;
    }
    fclose(txfp);
    if ( endtick >= initialtick )
        printf("epoch.%d empty.%d end at %d numticks.%d, notxdigests.%d good.%d moneytx.%d\n",epoch,emptytick,lasttick,lasttick - initialtick + 1,notxdigests,good,moneytx);
}

void scantxids(struct locations *lp)
{
    int32_t i;
    for (i=0; i<sizeof(EPOCHS)/sizeof(*EPOCHS); i++)
    {
        if ( EPOCHS[i][0] >= lp->firstepoch && EPOCHS[i][0] <= lp->lastepoch )
        {
            if ( lp->method == 0 )
                origscanepoch(lp,EPOCHS[i][0],EPOCHS[i][1]);
            else if ( lp->method == 1 )
                scanepoch(lp,EPOCHS[i][0],EPOCHS[i][1]);
            else if ( lp->method == 2 )
                scanepoch(lp,EPOCHS[i][0],EPOCHS[i][1]);
        }
    }
}

int main(int argc, const char * argv[])
{
    FILE *fp;
    char cmd[1024];
    int32_t epoch = 0;
    //mutualexclusion("qhistory",1);
    if ( argc == 2 && strcmp(argv[1],(char *)"recreate") == 0 )
    {
        printf("RECREATE ARCHIVE to the start of Epoch 101\n");
        sprintf(cmd,"rm %s/archive",DATADIR);
        system(cmd);
        sprintf(cmd,"rm -rf %s/history",DATADIR);
        system(cmd);
        sprintf(cmd,"%s/history",DATADIR);
        makedir(cmd);
        scantxids(&ORIG);
        scantxids(&QSILVER);
        scantxids(&QWALLET);
        printf("DUPLICATE attempts %d\n",DUPLICATE_ATTEMPTS);
        sprintf(cmd,"cp %s/archive %s/epochs/archive.101",DATADIR,EPOCHSROOT);
        system(cmd);
        sprintf(cmd,"cp -R %s/history %s/epochs/history.101",DATADIR,EPOCHSROOT);
        system(cmd);
        //mutualexclusion("qhistory",-1);
        return(0);
    }
    else if ( argc == 2 )
        epoch = atoi(argv[1]);
    char fname[512];
    sprintf(fname,"%s%chistory",DATADIR,dir_delim());
    makedir(fname);
    load_archive();
    if ( epoch != 0 )
        scanepoch(&REALTIME,epoch,epochstart(epoch));
    else
    {
        sprintf(fname,"%s%chistory.tick",DATADIR,dir_delim());
        if ( (fp= fopen(fname,"rb")) != 0 )
        {
            if ( fread(&ARCHIVE_TICK,1,sizeof(ARCHIVE_TICK),fp) == sizeof(ARCHIVE_TICK) )
                printf("start from ARCHIVE_TICK.%d\n",ARCHIVE_TICK);
            fclose(fp);
        }
        update_latest();
        epoch = EPOCH;
        while ( 1 )
        {
            if ( update_latest() != 0 )
            {
                printf("latest.%d validated.%d txtick.%d epoch.%d initial.%d ARCHIVE_TICK.%d DUPLICATE_ATTEMPTS.%d NEWEST_ARCHIVE.%d\n",LATEST_TICK,VALIDATED_TICK,HAVE_TXTICK,EPOCH,INITIAL_TICK,ARCHIVE_TICK,DUPLICATE_ATTEMPTS,NEWEST_ARCHIVE);
                if ( VALIDATED_TICK > ARCHIVE_TICK )
                    scanepoch(&REALTIME,0,INITIAL_TICK);
                fflush(stdout);
            } else sleep(1);
        }
    }
    //mutualexclusion("qhistory",-1);
    return(0);
}
