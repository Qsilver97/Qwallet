#include <sys/time.h>

#define EPOCH0_START (1649851200)

int32_t utime_to_epoch(uint32_t utime,int32_t *secondsp)
{
    int32_t epoch;
    if ( utime <= EPOCH0_START )
        return(0);
    epoch = (utime - EPOCH0_START) / (7 * 24 * 3600);
    *secondsp = (utime - EPOCH0_START) % (7 * 24 * 3600);
    return(epoch);
}

long long __year_to_secs(long long year, int *is_leap)
{
    if (year-2ULL <= 136) {
        int y = (int)year;
        int leaps = (y-68)>>2;
        if (!((y-68)&3)) {
            leaps--;
            if (is_leap) *is_leap = 1;
        } else if (is_leap) *is_leap = 0;
        return 31536000*(y-70) + 86400*leaps;
    }

    int cycles, centuries, leaps, rem;

    if (!is_leap) is_leap = &(int){0};
    cycles = (int)(year-100) / 400;
    rem = (year-100) % 400;
    if (rem < 0) {
        cycles--;
        rem += 400;
    }
    if (!rem) {
        *is_leap = 1;
        centuries = 0;
        leaps = 0;
    } else {
        if (rem >= 200) {
            if (rem >= 300) { centuries = 3; rem -= 300; }
            else { centuries = 2; rem -= 200; }
        } else {
            if (rem >= 100) { centuries = 1; rem -= 100; }
            else centuries = 0;
        }
        if (!rem) {
            *is_leap = 0;
            leaps = 0;
        } else {
            leaps = rem / 4U;
            rem %= 4U;
            *is_leap = !rem;
        }
    }
    leaps += 97*cycles + 24*centuries - *is_leap;
    return (year-100) * 31536000LL + leaps * 86400LL + 946684800 + 86400;
}

int __month_to_secs(int month, int is_leap)
{
    static const int secs_through_month[] = {
        0, 31*86400, 59*86400, 90*86400,
        120*86400, 151*86400, 181*86400, 212*86400,
        243*86400, 273*86400, 304*86400, 334*86400 };
    int t = secs_through_month[month];
    if (is_leap && month >= 2) t+=86400;
    return t;
}

long long __tm_to_secs(const struct tm *tm)
{
    int is_leap;
    long long year = tm->tm_year;
    int month = tm->tm_mon;
    if (month >= 12 || month < 0) {
        int adj = month / 12;
        month %= 12;
        if (month < 0) {
            adj--;
            month += 12;
        }
        year += adj;
    }
    long long t = __year_to_secs(year, &is_leap);
    t += __month_to_secs(month, is_leap);
    t += 86400LL * (tm->tm_mday-1);
    t += 3600LL * tm->tm_hour;
    t += 60LL * tm->tm_min;
    t += tm->tm_sec;
    return t;
}

uint32_t set_current_ymd(int32_t *yearp,int32_t *monthp,int32_t *dayp,int32_t *secondsp)
{
    time_t     now;
    struct tm  *ts;
    long long t;
    char       buf[80];
    time(&now);
    // Format time, "ddd yyyy-mm-dd hh:mm:ss zzz"
    //tm_mday    int    day of the month    1-31
    //tm_mon    int    months since January    0-11
    //tm_year    int    years since 1900
    // t.tm_hour = hour, t.tm_min = minute, t.tm_sec = second;

    ts = localtime(&now);
    if ( ts != 0 )
    {
        t = __tm_to_secs(ts);
        strftime(buf, sizeof(buf), "%a %Y-%m-%d %H:%M:%S %Z", ts);
        *yearp = 1900 + ts->tm_year;
        *monthp = ts->tm_mon + 1;
        *dayp = ts->tm_mday;
        *secondsp = ts->tm_hour*3600 + ts->tm_min*60 + ts->tm_sec;
        //printf("%s vs %d-%d-%d %u\n", buf,*yearp,*monthp,*dayp,(uint32_t)t);
        return((uint32_t)t);
    }
    else return(0);
}
