

int32_t EPOCH,LATEST_TICK,INITIAL_TICK,VALIDATED_TICK,HAVE_TXTICK;
uint32_t EXITFLAG,PROGRESSTIME,LATEST_UTIME;

int EPOCHS[][2] =
{
    { 83, 10800000 },
    { 84, 10950000 },
    { 85, 11100000 },
    { 86, 11250000 },
    { 87, 11400000 },
    { 88, 11550000 },
    { 89, 11700000 },
    { 90, 11850000 },
    { 91, 11950000 },
    { 92, 12050000 },
    { 93, 12160000 },
    { 94, 12270000 },
    { 95, 12380000 },
    { 96, 12500000 },
    { 97, 12600000 },
    { 98, 12710000 },
    { 99, 12820000 },
    { 100, 12950000 },
    { 101, 13060000 },
    { 102, 13110000 },
};

struct issuerpub ASSETS[] =
{
    { "QX" },
    { "QTRY" },
    { "RANDOM" },
    { "QUTIL" },
    { "MLM" },
    { "QPOOL" },
    { "QFT", "TFUYVBXYIYBVTEMJHAJGEJOOZHJBQFVQLTBBKMEHPEVIZFXZRPEYFUWGTIWG" },
    { "QWALLET", "QWALLETSGQVAGBHUCVVXWZXMBKQBPQQSHRYKZGEJWFVNUFCEDDPRMKTAUVHA" },
    { "CFB", "CFBMEMZOIDEXQAUXYYSZIURADQLAPWPMNJXQSNVQZAHYVOPYUKKJBJUCTVJL" },
    { "QCAP", "QCAPWMYRSHLBJHSTTZQVCIBARVOASKDENASAKNOBRGPFWWKRCUVUAXYEZVOG" },
};

uint64_t assetint(char *assetname)
{
    char str[8];
    uint64_t asseti = 0;
    memset(str,0,sizeof(str));
    strncpy(str,assetname,8);
    memcpy(&asseti,str,8);
    return(asseti);
}

int32_t tick2epoch(int32_t tick)
{
    int32_t i;
    for (i=0; i<(sizeof(EPOCHS)/sizeof(*EPOCHS))-1; i++)
        if ( tick >= EPOCHS[i][1] && tick < EPOCHS[i+1][0] )
            return(EPOCHS[i][0]);
    return(EPOCH);
}

int32_t epochstart(int32_t epoch)
{
    int32_t i;
    for (i=0; i<(sizeof(EPOCHS)/sizeof(*EPOCHS)); i++)
        if ( epoch == EPOCHS[i][0] )
            return(EPOCHS[i][1]);
    return(0);
}

int64_t addrhashi(uint8_t pubkey[32])
{
    return((*(uint64_t *)&pubkey[8]) % MAXADDRESSES);
}

int64_t ebalance(struct Entity *E)
{
    return(E->incomingAmount - E->outgoingAmount);
}

void devurandom(uint8_t *buf,long len)
{
    static int32_t fd = -1;
    int32_t i;
    if ( fd == -1 )
    {
        while ( 1 )
        {
            if ( (fd= open("/dev/urandom",O_RDONLY)) != -1 )
                break;
            usleep(500000);
        }
    }
    while ( len > 0 )
    {
        if ( len < 1048576 )
            i = (int32_t)len;
        else i = 1048576;
        i = (int32_t)read(fd,buf,i);
        if ( i < 1 )
        {
            sleep(1);
            continue;
        }
        buf += i;
        len -= i;
    }
}

void randseed55(char *seed)
{
    int32_t i;
    char c;
    for (i=0; i<55; i++)
    {
        devurandom((uint8_t *)&c,1);
        seed[i] = 'a' + ((c&0x7f) % 26);
    }
}

void makeaddress(char *addr,char *seed)
{
    uint8_t subseed[32],privkey[32],pubkey[32];
    memset(addr,0,64);
    getSubseedFromSeed((const uint8_t *)seed,subseed);
    getPrivateKeyFromSubSeed(subseed,privkey);
    getPublicKeyFromPrivateKey(privkey,pubkey);
    pubkey2addr(pubkey,addr);
}

void seediter(char *str) // last char cannot be P or bigger
{
    char seed[56],addr[128];
    int32_t len;
    randseed55(seed);
    memset(addr,0,sizeof(addr));
    makeaddress(addr,seed);
    len = (int32_t)strlen(str);
    //printf("%s len.%d (%s) [%s]\n",addr,len,&addr[60-len],str);
    if ( strncmp(addr,str,len) == 0 || strcmp(&addr[60-len],str) == 0 )
    {
        fprintf(stderr,"seed %s -> %s\n",seed,addr);
        fflush(stderr);
    }
}

void makevanity(char *str)
{
    uint32_t i,j;
    printf("find vanity address starting with or ending with (%s)\n",str);
    for (j=0; j<100000; j++)
    {
        //printf("start vanity search.%d for %s\n",j,str);
        fflush(stdout);
        for (i=0; i<26*26*26; i++)
            seediter(str);
    }
    printf("finished\n");
}

struct quheader quheaderset(uint8_t type,int32_t size)
{
    struct quheader H;
    memset(&H,0,sizeof(H));
    H._size[0] = size;
    H._size[1] = size >> 8;
    H._size[2] = size >> 16;
    if ( (H._type= type) != BROADCAST_TRANSACTION )
    {
        devurandom((uint8_t *)&H._dejavu,sizeof(H._dejavu));
        //if ( (H._dejavu= rand()) == 0 )
        if ( H._dejavu == 0 )
            H._dejavu = 1;
    }
    return(H);
}

int32_t merkleRoot(uint8_t depth,int32_t index,uint8_t *data,int32_t datalen,uint8_t *siblings,uint8_t root[32])
{
    uint8_t pair[2][32];
    if ( index < 0 )
        return(-1);
    KangarooTwelve(data,datalen,root,32);
    for (int i=0; i<depth; i++)
    {
        if ( (index & 1) == 0 )
        {
            memcpy(pair[0],root,32);
            memcpy(pair[1],siblings + i * 32,32);
        }
        else
        {
            memcpy(pair[1],root,32);
            memcpy(pair[0],siblings + i * 32,32);
        }
        KangarooTwelve(&pair[0][0],sizeof(pair),root,32);
        index >>= 1;
    }
    return(1);
}

char dir_delim(void)
{
#ifdef __WINDOWS__
    return('\\');
#else
    return('/');
#endif
}

void makefile(char *fname)
{
    FILE *fp;
    if ( (fp=fopen(fname,"rb")) == 0 )
    {
        if ( (fp=fopen(fname,"wb")) != 0 )
            fclose(fp);
    } else fclose(fp);
}

void makedir(const char *dirname)
{
    FILE *fp;
    char fname[512],cmd[512];
    sprintf(fname,"%s%c.exists",dirname,dir_delim());
    if ( (fp= fopen(fname,"rb")) != 0 )
        fclose(fp);
    else if ( (fp= fopen(fname,"wb")) != 0 )
        fclose(fp);
    else if ( (fp= fopen(dirname,"rb")) == 0 )
    {
        sprintf(cmd,"mkdir %s",dirname);
        system(cmd);
        printf("makedir %s\n",cmd);
    } else fclose(fp);
}

char *epochdirname(int32_t epoch)
{
    static char dirname[128];
    sprintf(dirname,"%s%cepochs%c%d%c",EPOCHSROOT,dir_delim(),dir_delim(),epoch,dir_delim());
    return(dirname);
}

void epochfname(char *fname,int32_t epoch,int32_t tick,char *suffix)
{
    sprintf(fname,"%s%d%s",epochdirname(epoch),tick,suffix);
}

void peertxfname(char *fname,char *ipaddr)
{
    sprintf(fname,"%stx%c%s",epochdirname(EPOCH),dir_delim(),ipaddr);
}

void init_dirs(void)
{
    char dirname[512];
    sprintf(dirname,"%s%cepochs",EPOCHSROOT,dir_delim());
    makedir(dirname);
    makedir(DATADIR);
    sprintf(dirname,"%s%csubs",DATADIR,dir_delim());
    makedir(dirname);
    sprintf(dirname,"%s%cuniv",DATADIR,dir_delim());
    makedir(dirname);
    sprintf(dirname,"%s%caddrs",DATADIR,dir_delim());
    makedir(dirname);
    sprintf(dirname,"%s%corders",DATADIR,dir_delim());
    makedir(dirname);
}

void newepoch(void)
{
    char dirname[512];
    makedir(epochdirname(EPOCH));
    sprintf(dirname,"%scomputors",epochdirname(EPOCH));
    makedir(dirname);
    sprintf(dirname,"%stx",epochdirname(EPOCH));
    makedir(dirname);
}

void deletefile(char *fname)
{
#ifdef EMSCRIPTEN
    printf("unlink %s\n",fname);
    unlink(fname);
#else
    char cmd[1023];
    sprintf(cmd,"rm %s",fname);
    system(cmd);
#endif
}

void cpfile(char *src,char *dest)
{
    char cmd[1024];
    sprintf(cmd,"cp %s %s",src,dest);
    system(cmd);
}

void makepeerslist(const char *fname)
{
    char cmd[1024];
    sprintf(cmd,"ls -w 16 peer > %s",fname);
    system(cmd);
}


#ifdef __APPLE__
#define FMT64 "%lld"
#else
#ifdef EMSCRIPTEN
#define FMT64 "%lld"
#else
#define FMT64 "%ld"
#endif
#endif

char *amountstr(uint64_t amount)
{
    static char str[64];
    sprintf(str,FMT64,amount);
    return(str);
}

char *amountstr2(uint64_t amount)
{
    static char str[64];
    sprintf(str,FMT64,amount);
    return(str);
}

char *amountstr3(uint64_t amount)
{
    static char str[64];
    sprintf(str,FMT64,amount);
    return(str);
}

char *amountstr4(uint64_t amount)
{
    static char str[64];
    sprintf(str,FMT64,amount);
    return(str);
}

char *amountstr5(uint64_t amount)
{
    static char str[64];
    sprintf(str,FMT64,amount);
    return(str);
}

void byteToHex(const uint8_t* byte, char* hex, const int sizeInByte)
{
    for (int i = 0; i < sizeInByte; i++){
        sprintf(hex+i*2, "%02x", byte[i]);
    }
}

void hexToByte(const char* hex, uint8_t* byte, const int sizeInByte)
{
    for (int i = 0; i < sizeInByte; i++){
        sscanf(hex+i*2, "%2hhx", &byte[i]);
    }
}

int32_t ishexstr(char *str)
{
    int32_t i,c;
    for (i=0; str[i]!=0; i++)
    {
        if ( ((c=str[i]) >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F') || (c >= '0' && c <= '9') )
            continue;
        return(0);
    }
    if ( (i & 1) != 0 )
        return(0);
    return(1);
}

int32_t checktxsig(char *addr,char *rawhex)
{
    uint8_t txbytes[MAX_INPUT_SIZE*4],digest[32],pubkey[32];
    int32_t datalen = (int32_t)strlen(rawhex) / 2;
    if ( datalen == 0 )
        return(0);
    hexToByte(rawhex,txbytes,datalen);
    KangarooTwelve(txbytes,datalen-64,digest,32);
    if ( addr2pubkey(addr,pubkey) != 0 )
    {
        int v = verify(pubkey,digest,&txbytes[datalen-64]);
        //printf("checksig %d\n",v);
        return(v);
    }
    else return(0);
}

int32_t validaterawhex(char *rawhex,uint8_t txdata[MAX_TX_SIZE - sizeof(struct quheader)],char *txidstr)
{
    uint8_t digest[32];
    char src[64],dest[64];
    int32_t validated;
    Transaction tx;
    int32_t datalen = (int32_t)strlen(rawhex)/2;
    txidstr[0] = 0;
    if ( datalen < sizeof(Transaction) || datalen > (MAX_TX_SIZE-sizeof(struct quheader)) )
        return(0);
    hexToByte(rawhex,txdata,datalen);
    memcpy(&tx,txdata,sizeof(tx));
    pubkey2addr(tx.sourcePublicKey,src);
    pubkey2addr(tx.destinationPublicKey,dest);
    validated = checktxsig(src,rawhex);
    KangarooTwelve(txdata,datalen,digest,32);
    getTxHashFromDigest(digest,txidstr);
    txidstr[60] = 0;
    //printf("%s: %s sends %s to %s, txtick.%d type.%d extra.%d validated.%d\n",txidstr,src,amountstr(tx.amount),dest,tx.tick,tx.inputType,tx.inputSize,validated);
    return(validated * datalen);
}

int32_t update_latest(void)
{
    FILE *fp;
    int32_t flag = 0;
    int32_t vals[5];
    char fname[512];
    sprintf(fname,"%s%clatest",DATADIR,dir_delim());
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        if ( fread(vals,1,sizeof(vals),fp) == sizeof(vals) )
        {
            if ( vals[0] > LATEST_TICK )
            {
                LATEST_TICK = vals[0];
                flag = 1;
            }
            VALIDATED_TICK = vals[1];
            HAVE_TXTICK = vals[2];
            EPOCH = vals[3];
            INITIAL_TICK = vals[4];
        }
        fclose(fp);
    }
    return(flag);
}

int32_t Qserver_msg(const char *msg)
{
    int fd,len;
    char buf[8192];
    len = (int32_t)strlen(msg);
    strncpy(buf,msg,sizeof(buf)-1);
    if ( buf[len - 1] != '\n' )
        buf[len++] = '\n';
    buf[len] = 0;
    fd = open("Qserver", O_WRONLY);
    if ( fd > 0 )
    {
        write(fd,buf,len);
        close(fd);
        return(0);
    } else return(-1);
}

void mutualexclusion(char *name,int32_t open_close)
{
    FILE *fp;
    char fname[512];
    sprintf(fname,"me%c%s",dir_delim(),name);
    if ( open_close > 0 )
    {
        if ( (fp= fopen(fname,"rb")) != 0 )
        {
            printf("%s exists, exit\n",fname);
            fclose(fp);
            exit(-1);
        }
        fp = fopen(fname,"wb");
        fclose(fp);
    }
    else
    {
        deletefile(fname);
    }
}

int32_t tickfindsender(int32_t tick,uint8_t sender[32],char *txidstr)
{
    FILE *fp;
    Transaction tx;
    uint8_t txid[32],txdata[MAX_TX_SIZE];
    char fname[512];
    int32_t i,txlen,epoch;
    epoch = tick2epoch(tick);
    epochfname(fname,epoch,tick,".T");
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        for (i=0; i<NUMBER_OF_TRANSACTIONS_PER_TICK; i++)
        {
            if ( fread(&txlen,1,sizeof(txlen),fp) != sizeof(txlen) || txlen < sizeof(tx) || txlen > sizeof(tx)+MAX_INPUT_SIZE+SIGNATURE_SIZE )
                break;
            if ( fread(txid,1,sizeof(txid),fp) != sizeof(txid) )
                break;
            if ( fread(txdata,1,txlen,fp) != txlen )
                break;
            memcpy(&tx,txdata,sizeof(tx));
            if ( memcmp(tx.sourcePublicKey,sender,32) == 0 )
            {
                digest2txid(txid,txidstr);
                fclose(fp);
                return(i);
            }
        }
        fclose(fp);
    }
    return(-1);
}

int32_t tickfindtxid(int32_t tick,char txidstr[32],uint8_t txdata[MAX_TX_SIZE])
{
    FILE *fp;
    char fname[512];
    TickData TD;
    Transaction T;
    int32_t i,j,epoch,txlen=0,n=0;
    uint8_t zero[32],txid[32],tmptxid[32];
    txid2digest(txidstr,txid);
    epoch = tick2epoch(tick);
    epochfname(fname,epoch,tick,"");
    if ( (fp= fopen(fname,"rb")) != 0 )
    {
        fread(&TD,1,sizeof(TD),fp);
        fclose(fp);
        memset(zero,0,sizeof(zero));
        for (i=0; i<NUMBER_OF_TRANSACTIONS_PER_TICK; i++)
        {
            if ( memcmp(TD.transactionDigests[i],zero,sizeof(zero)) == 0 )
                break;
            n++;
            if ( memcmp(TD.transactionDigests[i],txid,sizeof(txid)) == 0 )
            {
                epochfname(fname,epoch,tick,".T");
                if ( (fp= fopen(fname,"rb")) != 0 )
                {
                    for (j=0; j<n; j++)
                    {
                        if ( fread(&txlen,1,sizeof(txlen),fp) != sizeof(txlen) || txlen < sizeof(T) || txlen > sizeof(T)+MAX_INPUT_SIZE+SIGNATURE_SIZE )
                            break;
                        if ( fread(tmptxid,1,sizeof(tmptxid),fp) != sizeof(tmptxid) )
                            break;
                        if ( fread(txdata,1,txlen,fp) != txlen )
                            break;
                    }
                    fclose(fp);
                    if ( j != n || memcmp(tmptxid,txid,32) != 0 )
                    {
                        printf("j.%d != n.%d\n",j,n);
                        txlen = 1;
                    }
                } else txlen = 1;
                return(txlen);
            }
        }
    }
    return(0);
}

char *BIP39[] =
{
    "abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act","action","actor","actress","actual","adapt","add","addict","address","adjust","admit","adult","advance","advice","aerobic","affair","afford","afraid","again","age","agent","agree","ahead","aim","air","airport","aisle","alarm","album","alcohol","alert","alien","all","alley","allow","almost","alone","alpha","already","also","alter","always","amateur","amazing","among","amount","amused","analyst","anchor","ancient","anger","angle","angry","animal","ankle","announce","annual","another","answer","antenna","antique","anxiety","any","apart","apology","appear","apple","approve","april","arch","arctic","area","arena","argue","arm","armed","armor","army","around","arrange","arrest","arrive","arrow","art","artefact","artist","artwork","ask","aspect","assault","asset","assist","assume","asthma","athlete","atom","attack","attend","attitude","attract","auction","audit","august","aunt","author","auto","autumn","average","avocado","avoid","awake","aware","away","awesome","awful","awkward","axis","baby","bachelor","bacon","badge","bag","balance","balcony","ball","bamboo","banana","banner","bar","barely","bargain","barrel","base","basic","basket","battle","beach","bean","beauty","because","become","beef","before","begin","behave","behind","believe","below","belt","bench","benefit","best","betray","better","between","beyond","bicycle","bid","bike","bind","biology","bird","birth","bitter","black","blade","blame","blanket","blast","bleak","bless","blind","blood","blossom","blouse","blue","blur","blush","board","boat","body","boil","bomb","bone","bonus","book","boost","border","boring","borrow","boss","bottom","bounce","box","boy","bracket","brain","brand","brass","brave","bread","breeze","brick","bridge","brief","bright","bring","brisk","broccoli","broken","bronze","broom","brother","brown","brush","bubble","buddy","budget","buffalo","build","bulb","bulk","bullet","bundle","bunker","burden","burger","burst","bus","business","busy","butter","buyer","buzz","cabbage","cabin","cable","cactus","cage","cake","call","calm","camera","camp","can","canal","cancel","candy","cannon","canoe","canvas","canyon","capable","capital","captain","car","carbon","card","cargo","carpet","carry","cart","case","cash","casino","castle","casual","cat","catalog","catch","category","cattle","caught","cause","caution","cave","ceiling","celery","cement","census","century","cereal","certain","chair","chalk","champion","change","chaos","chapter","charge","chase","chat","cheap","check","cheese","chef","cherry","chest","chicken","chief","child","chimney","choice","choose","chronic","chuckle","chunk","churn","cigar","cinnamon","circle","citizen","city","civil","claim","clap","clarify","claw","clay","clean","clerk","clever","click","client","cliff","climb","clinic","clip","clock","clog","close","cloth","cloud","clown","club","clump","cluster","clutch","coach","coast","coconut","code","coffee","coil","coin","collect","color","column","combine","come","comfort","comic","common","company","concert","conduct","confirm","congress","connect","consider","control","convince","cook","cool","copper","copy","coral","core","corn","correct","cost","cotton","couch","country","couple","course","cousin","cover","coyote","crack","cradle","craft","cram","crane","crash","crater","crawl","crazy","cream","credit","creek","crew","cricket","crime","crisp","critic","crop","cross","crouch","crowd","crucial","cruel","cruise","crumble","crunch","crush","cry","crystal","cube","culture","cup","cupboard","curious","current","curtain","curve","cushion","custom","cute","cycle","dad","damage","damp","dance","danger","daring","dash","daughter","dawn","day","deal","debate","debris","decade","december","decide","decline","decorate","decrease","deer","defense","define","defy","degree","delay","deliver","demand","demise","denial","dentist","deny","depart","depend","deposit","depth","deputy","derive","describe","desert","design","desk","despair","destroy","detail","detect","develop","device","devote","diagram","dial","diamond","diary","dice","diesel","diet","differ","digital","dignity","dilemma","dinner","dinosaur","direct","dirt","disagree","discover","disease","dish","dismiss","disorder","display","distance","divert","divide","divorce","dizzy","doctor","document","dog","doll","dolphin","domain","donate","donkey","donor","door","dose","double","dove","draft","dragon","drama","drastic","draw","dream","dress","drift","drill","drink","drip","drive","drop","drum","dry","duck","dumb","dune","during","dust","dutch","duty","dwarf","dynamic","eager","eagle","early","earn","earth","easily","east","easy","echo","ecology","economy","edge","edit","educate","effort","egg","eight","either","elbow","elder","electric","elegant","element","elephant","elevator","elite","else","embark","embody","embrace","emerge","emotion","employ","empower","empty","enable","enact","end","endless","endorse","enemy","energy","enforce","engage","engine","enhance","enjoy","enlist","enough","enrich","enroll","ensure","enter","entire","entry","envelope","episode","equal","equip","era","erase","erode","erosion","error","erupt","escape","essay","essence","estate","eternal","ethics","evidence","evil","evoke","evolve","exact","example","excess","exchange","excite","exclude","excuse","execute","exercise","exhaust","exhibit","exile","exist","exit","exotic","expand","expect","expire","explain","expose","express","extend","extra","eye","eyebrow","fabric","face","faculty","fade","faint","faith","fall","false","fame","family","famous","fan","fancy","fantasy","farm","fashion","fat","fatal","father","fatigue","fault","favorite","feature","february","federal","fee","feed","feel","female","fence","festival","fetch","fever","few","fiber","fiction","field","figure","file","film","filter","final","find","fine","finger","finish","fire","firm","first","fiscal","fish","fit","fitness","fix","flag","flame","flash","flat","flavor","flee","flight","flip","float","flock","floor","flower","fluid","flush","fly","foam","focus","fog","foil","fold","follow","food","foot","force","forest","forget","fork","fortune","forum","forward","fossil","foster","found","fox","fragile","frame","frequent","fresh","friend","fringe","frog","front","frost","frown","frozen","fruit","fuel","fun","funny","furnace","fury","future","gadget","gain","galaxy","gallery","game","gap","garage","garbage","garden","garlic","garment","gas","gasp","gate","gather","gauge","gaze","general","genius","genre","gentle","genuine","gesture","ghost","giant","gift","giggle","ginger","giraffe","girl","give","glad","glance","glare","glass","glide","glimpse","globe","gloom","glory","glove","glow","glue","goat","goddess","gold","good","goose","gorilla","gospel","gossip","govern","gown","grab","grace","grain","grant","grape","grass","gravity","great","green","grid","grief","grit","grocery","group","grow","grunt","guard","guess","guide","guilt","guitar","gun","gym","habit","hair","half","hammer","hamster","hand","happy","harbor","hard","harsh","harvest","hat","have","hawk","hazard","head","health","heart","heavy","hedgehog","height","hello","helmet","help","hen","hero","hidden","high","hill","hint","hip","hire","history","hobby","hockey","hold","hole","holiday","hollow","home","honey","hood","hope","horn","horror","horse","hospital","host","hotel","hour","hover","hub","huge","human","humble","humor","hundred","hungry","hunt","hurdle","hurry","hurt","husband","hybrid","ice","icon","idea","identify","idle","ignore","ill","illegal","illness","image","imitate","immense","immune","impact","impose","improve","impulse","inch","include","income","increase","index","indicate","indoor","industry","infant","inflict","inform","inhale","inherit","initial","inject","injury","inmate","inner","innocent","input","inquiry","insane","insect","inside","inspire","install","intact","interest","into","invest","invite","involve","iron","island","isolate","issue","item","ivory","jacket","jaguar","jar","jazz","jealous","jeans","jelly","jewel","job","join","joke","journey","joy","judge","juice","jump","jungle","junior","junk","just","kangaroo","keen","keep","ketchup","key","kick","kid","kidney","kind","kingdom","kiss","kit","kitchen","kite","kitten","kiwi","knee","knife","knock","know","lab","label","labor","ladder","lady","lake","lamp","language","laptop","large","later","latin","laugh","laundry","lava","law","lawn","lawsuit","layer","lazy","leader","leaf","learn","leave","lecture","left","leg","legal","legend","leisure","lemon","lend","length","lens","leopard","lesson","letter","level","liar","liberty","library","license","life","lift","light","like","limb","limit","link","lion","liquid","list","little","live","lizard","load","loan","lobster","local","lock","logic","lonely","long","loop","lottery","loud","lounge","love","loyal","lucky","luggage","lumber","lunar","lunch","luxury","lyrics","machine","mad","magic","magnet","maid","mail","main","major","make","mammal","man","manage","mandate","mango","mansion","manual","maple","marble","march","margin","marine","market","marriage","mask","mass","master","match","material","math","matrix","matter","maximum","maze","meadow","mean","measure","meat","mechanic","medal","media","melody","melt","member","memory","mention","menu","mercy","merge","merit","merry","mesh","message","metal","method","middle","midnight","milk","million","mimic","mind","minimum","minor","minute","miracle","mirror","misery","miss","mistake","mix","mixed","mixture","mobile","model","modify","mom","moment","monitor","monkey","monster","month","moon","moral","more","morning","mosquito","mother","motion","motor","mountain","mouse","move","movie","much","muffin","mule","multiply","muscle","museum","mushroom","music","must","mutual","myself","mystery","myth","naive","name","napkin","narrow","nasty","nation","nature","near","neck","need","negative","neglect","neither","nephew","nerve","nest","net","network","neutral","never","news","next","nice","night","noble","noise","nominee","noodle","normal","north","nose","notable","note","nothing","notice","novel","now","nuclear","number","nurse","nut","oak","obey","object","oblige","obscure","observe","obtain","obvious","occur","ocean","october","odor","off","offer","office","often","oil","okay","old","olive","olympic","omit","once","one","onion","online","only","open","opera","opinion","oppose","option","orange","orbit","orchard","order","ordinary","organ","orient","original","orphan","ostrich","other","outdoor","outer","output","outside","oval","oven","over","own","owner","oxygen","oyster","ozone","pact","paddle","page","pair","palace","palm","panda","panel","panic","panther","paper","parade","parent","park","parrot","party","pass","patch","path","patient","patrol","pattern","pause","pave","payment","peace","peanut","pear","peasant","pelican","pen","penalty","pencil","people","pepper","perfect","permit","person","pet","phone","photo","phrase","physical","piano","picnic","picture","piece","pig","pigeon","pill","pilot","pink","pioneer","pipe","pistol","pitch","pizza","place","planet","plastic","plate","play","please","pledge","pluck","plug","plunge","poem","poet","point","polar","pole","police","pond","pony","pool","popular","portion","position","possible","post","potato","pottery","poverty","powder","power","practice","praise","predict","prefer","prepare","present","pretty","prevent","price","pride","primary","print","priority","prison","private","prize","problem","process","produce","profit","program","project","promote","proof","property","prosper","protect","proud","provide","public","pudding","pull","pulp","pulse","pumpkin","punch","pupil","puppy","purchase","purity","purpose","purse","push","put","puzzle","pyramid","quality","quantum","quarter","question","quick","quit","quiz","quote","rabbit","raccoon","race","rack","radar","radio","rail","rain","raise","rally","ramp","ranch","random","range","rapid","rare","rate","rather","raven","raw","razor","ready","real","reason","rebel","rebuild","recall","receive","recipe","record","recycle","reduce","reflect","reform","refuse","region","regret","regular","reject","relax","release","relief","rely","remain","remember","remind","remove","render","renew","rent","reopen","repair","repeat","replace","report","require","rescue","resemble","resist","resource","response","result","retire","retreat","return","reunion","reveal","review","reward","rhythm","rib","ribbon","rice","rich","ride","ridge","rifle","right","rigid","ring","riot","ripple","risk","ritual","rival","river","road","roast","robot","robust","rocket","romance","roof","rookie","room","rose","rotate","rough","round","route","royal","rubber","rude","rug","rule","run","runway","rural","sad","saddle","sadness","safe","sail","salad","salmon","salon","salt","salute","same","sample","sand","satisfy","satoshi","sauce","sausage","save","say","scale","scan","scare","scatter","scene","scheme","school","science","scissors","scorpion","scout","scrap","screen","script","scrub","sea","search","season","seat","second","secret","section","security","seed","seek","segment","select","sell","seminar","senior","sense","sentence","series","service","session","settle","setup","seven","shadow","shaft","shallow","share","shed","shell","sheriff","shield","shift","shine","ship","shiver","shock","shoe","shoot","shop","short","shoulder","shove","shrimp","shrug","shuffle","shy","sibling","sick","side","siege","sight","sign","silent","silk","silly","silver","similar","simple","since","sing","siren","sister","situate","six","size","skate","sketch","ski","skill","skin","skirt","skull","slab","slam","sleep","slender","slice","slide","slight","slim","slogan","slot","slow","slush","small","smart","smile","smoke","smooth","snack","snake","snap","sniff","snow","soap","soccer","social","sock","soda","soft","solar","soldier","solid","solution","solve","someone","song","soon","sorry","sort","soul","sound","soup","source","south","space","spare","spatial","spawn","speak","special","speed","spell","spend","sphere","spice","spider","spike","spin","spirit","split","spoil","sponsor","spoon","sport","spot","spray","spread","spring","spy","square","squeeze","squirrel","stable","stadium","staff","stage","stairs","stamp","stand","start","state","stay","steak","steel","stem","step","stereo","stick","still","sting","stock","stomach","stone","stool","story","stove","strategy","street","strike","strong","struggle","student","stuff","stumble","style","subject","submit","subway","success","such","sudden","suffer","sugar","suggest","suit","summer","sun","sunny","sunset","super","supply","supreme","sure","surface","surge","surprise","surround","survey","suspect","sustain","swallow","swamp","swap","swarm","swear","sweet","swift","swim","swing","switch","sword","symbol","symptom","syrup","system","table","tackle","tag","tail","talent","talk","tank","tape","target","task","taste","tattoo","taxi","teach","team","tell","ten","tenant","tennis","tent","term","test","text","thank","that","theme","then","theory","there","they","thing","this","thought","three","thrive","throw","thumb","thunder","ticket","tide","tiger","tilt","timber","time","tiny","tip","tired","tissue","title","toast","tobacco","today","toddler","toe","together","toilet","token","tomato","tomorrow","tone","tongue","tonight","tool","tooth","top","topic","topple","torch","tornado","tortoise","toss","total","tourist","toward","tower","town","toy","track","trade","traffic","tragic","train","transfer","trap","trash","travel","tray","treat","tree","trend","trial","tribe","trick","trigger","trim","trip","trophy","trouble","truck","true","truly","trumpet","trust","truth","try","tube","tuition","tumble","tuna","tunnel","turkey","turn","turtle","twelve","twenty","twice","twin","twist","two","type","typical","ugly","umbrella","unable","unaware","uncle","uncover","under","undo","unfair","unfold","unhappy","uniform","unique","unit","universe","unknown","unlock","until","unusual","unveil","update","upgrade","uphold","upon","upper","upset","urban","urge","usage","use","used","useful","useless","usual","utility","vacant","vacuum","vague","valid","valley","valve","van","vanish","vapor","various","vast","vault","vehicle","velvet","vendor","venture","venue","verb","verify","version","very","vessel","veteran","viable","vibrant","vicious","victory","video","view","village","vintage","violin","virtual","virus","visa","visit","visual","vital","vivid","vocal","voice","void","volcano","volume","vote","voyage","wage","wagon","wait","walk","wall","walnut","want","warfare","warm","warrior","wash","wasp","waste","water","wave","way","wealth","weapon","wear","weasel","weather","web","wedding","weekend","weird","welcome","west","wet","whale","what","wheat","wheel","when","where","whip","whisper","wide","width","wife","wild","will","win","window","wine","wing","wink","winner","winter","wire","wisdom","wise","wish","witness","wolf","woman","wonder","wood","wool","word","work","world","worry","worth","wrap","wreck","wrestle","wrist","write","wrong","yard","year","yellow","you","young","youth","zebra","zero","zone","zoo"
};
