


const char *json_strval(typed(json_element) element,char *field)
{
    result(json_element) command_element_result = json_object_find(element.value.as_object, field);
    if ( result_is_err(json_element)(&command_element_result) )
    {
        //typed(json_error) error = result_unwrap_err(json_element)(&command_element_result);
        return("");
    }
    typed(json_element) command_element = result_unwrap(json_element)(&command_element_result);
    typed(json_element_value) value = command_element.value;
    return(value.as_string);
}

int64_t json_numval(typed(json_element) element,char *field)
{
    result(json_element) command_element_result = json_object_find(element.value.as_object, field);
    if ( result_is_err(json_element)(&command_element_result) )
    {
        //typed(json_error) error = result_unwrap_err(json_element)(&command_element_result);
        return(0);
    }
    typed(json_element) command_element = result_unwrap(json_element)(&command_element_result);
    typed(json_element_value) value = command_element.value;
    return(value.as_number.value.as_long);
}

//{"success":true,"initialprice":"0.00000732","price":"0.00000725","high":"0.00000752","low":"0.00000712","volume":"555942.75635029","bid":"0.00000719","ask":"0.00000725"}

double mcapupdate(char *jsonstr)
{
    FILE *fp;
    char line[512];
    double supply=0.;
    const char *bid;
    char *totalname = (char *)"/var/www/html/supply/total";
    char *mcapname = (char *)"/var/www/html/supply/marketcap";

    if ( (fp= fopen(totalname,"r")) != 0 )
    {
        memset(line,0,sizeof(line));
        fread(line,1,sizeof(line),fp);
        fclose(fp);
        supply = atof(line);
    }

    result(json_element) element_result = json_parse(jsonstr);
    if ( result_is_err(json_element)(&element_result) )
    {
        typed(json_error) error = result_unwrap_err(json_element)(&element_result);
        fprintf(stderr, "Error parsing JSON: %s\n", json_error_to_string(error));
        return(-1);
    }
    typed(json_element) element = result_unwrap(json_element)(&element_result);
    bid = json_strval(element,(char *)"bid");
    fprintf(stderr,"%s %f supply %f -> mcap %f\n",bid,atof(bid),supply,supply*atof(bid));
    if ( (fp= fopen(mcapname,"w")) != 0 )
    {
        fprintf(fp,"%.0f\n",supply*atof(bid));
        fclose(fp);
    }
    return(atof(bid));
}

void update_html(int32_t epoch)
{
    FILE *fp;
    uint8_t pubkey[32];
    char jsonstr[4096];
    struct addrhash *ap;
    char *marketing = (char *)"TKUWWSNBAEGWJHQJDFLGQHJJCJBAXBSQMQAZJJDYXEPBVBBLIQANJTIDXMQH";
    char *ccf = (char *)"VVEVMFGZWMFXNDIZCKHBSMHHJZUCKKDAGLVPGOPGNBTFDFYYNFYQFJGBIWGF";
    char *totalname = (char *)"/var/www/html/supply/total";
    char *circulating = (char *)"/var/www/html/supply/circulating";
    int64_t marketingfunds = 0,balance,total = 89403076230161LL;
    total += (epoch - 101) * 1000000000000LL;
    system((char *)"curl https://tradeogre.com/api/v1/ticker/QUBIC-USDT > /tmp/togre");
    if ( (fp= fopen("/tmp/togre","r")) != 0 )
    {
        memset(jsonstr,0,sizeof(jsonstr));
        fread(jsonstr,1,sizeof(jsonstr),fp);
        fclose(fp);
        mcapupdate(jsonstr);
    }
    if ( SPECTRUM_SUPPLY != 0 )
    {
        printf("using SPECTRUM_SUPPLY %s vs calc %s diff %s\n",amountstr(SPECTRUM_SUPPLY),amountstr2(total),amountstr3(SPECTRUM_SUPPLY - total));
        total = SPECTRUM_SUPPLY;
    }
    if ( (fp= fopen(totalname,"wb")) != 0 )
    {
        fprintf(fp,"%s\n",amountstr(total));
        fclose(fp);
    }
    addr2pubkey(marketing,pubkey);
    if ( (ap= Addresshash(pubkey,1)) != 0 )
    {
        balance = ebalance(&ap->entity);
        //printf("marketing %s %s\n",marketing,amountstr(balance));
        marketingfunds += balance;
    }
    addr2pubkey(ccf,pubkey);
    if ( (ap= Addresshash(pubkey,1)) != 0 )
    {
        balance = ebalance(&ap->entity);
        marketingfunds += balance;
        total -= marketingfunds;
        //printf("ccf %s %s -> %s; circulating %s\n",ccf,amountstr(balance),amountstr2(marketingfunds),amountstr3(total));
    }
    if ( (fp= fopen(circulating,"wb")) != 0 )
    {
        fprintf(fp,"%s\n",amountstr(total));
        fclose(fp);
    }
}

int32_t cmpint64(const void *_a,const void *_b)
{
    int64_t a,b;
    a = *(int64_t *)_a;
    b = *(int64_t *)_b;
    if ( a == b )
        return(0);
    else if ( a > b )
        return(-1);
    else return(1);
}

int64_t address_balance(struct addrhash *ap,struct univhash *up,char *name)
{
    int64_t balance = 0;
    uint8_t zero[32];
    if ( name == 0 || name[0] == 0 || strcmp(name,(char *)"QU") == 0 )
        balance = ebalance(&ap->entity);
    else
    {
        memset(zero,0,sizeof(zero));
        if ( memcmp(zero,up->pubkey,32) != 0 )
        {
            //for (int i=0; i<6; i++)
            //    printf("%s %s, ",(char *)&up->owned[i][0],amountstr(up->owned[i][1]));
            balance = get_univowned(up,name);
            //char addr[64];
            //pubkey2addr(up->pubkey,addr);
            //printf("-> balance.%s %s %s\n",amountstr(balance),name,addr);
        }
    }
    return(balance);
}

void richlist(char *_name)
{
    FILE *fp;
    int64_t balance,supply = 0;
    char addr[64],fname[512],name[8];
    struct addrhash *ap;
    struct univhash *up;
    struct richlist_entry *richlist = 0;
    int32_t i,exists,recent,inlist,isQU = 0;
    exists = recent = inlist = 0;
    if ( _name == 0 || _name[0] == 0 || strcmp(_name,"QU") == 0 )
    {
        isQU = 1;
        for (i=0; i<MAXADDRESSES; i++)
        {
            ap = &Addresses[i];
            supply += ebalance(&ap->entity);
        }
        if ( supply < 1000000L * 1000000L )
        {
            printf("Addresses not initialized yet\n");
            return;
        }
    }
    memset(name,0,sizeof(name));
    memcpy(name,_name,7);
    supply = 0;
    richlist = (struct richlist_entry *)calloc(sizeof(*richlist),MAXADDRESSES);
    for (i=0; i<MAXADDRESSES; i++)
    {
        ap = &Addresses[i];
        up = &Universe[i];
        balance = address_balance(ap,up,name);
        if ( balance > 0 )
        {
            exists++;
            supply += balance;
            richlist[inlist].balance = balance;
            memcpy(richlist[inlist].pubkey,isQU!=0?ap->entity.publicKey:up->pubkey,32);
            inlist++;
        }
    }
    if ( inlist != 0 )
    {
        qsort(richlist,inlist,sizeof(*richlist),cmpint64);
        if ( isQU != 0 )
        {
            for (i=0; i<inlist; i++)
            {
                if ( (ap= Addresshash(richlist[i].pubkey,1)) != 0 )
                    ap->rank = i + 1;
            }
        }
        else if ( (0) )
        {
            for (i=0; i<inlist; i++)
            {
                pubkey2addr(richlist[i].pubkey,addr);
                printf("%d %s %s\n",i,addr,amountstr(richlist[i].balance));
            }
        }
        sprintf(fname,"%s%crichlist",DATADIR,dir_delim());
        if ( _name != 0 && _name[0] != 0 && strcmp(_name,(char *)"QU") != 0 )
        {
            sprintf(fname,"%s%crichlist.%s",DATADIR,dir_delim(),name);
            printf("%s Totaladdress.%d Totaluniv.%d Totalsupply %s\n",name,inlist,Totaluniv,amountstr(supply));
        }
        else
            printf("%s Totaladdress.%d Totaluniv.%d exists.%d inlist.%d entitydata.%d Totalsupply %s\n",name,Totaladdress,Totaluniv,exists,inlist,Entitydata,amountstr(supply));
        if ( (fp= fopen(fname,"wb")) != 0 )
        {
            fwrite(richlist,inlist,sizeof(*richlist),fp);
            fclose(fp);
        }
    }
    free(richlist);
}

