
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <errno.h>

int myconnect(const char *nodeIp,int nodePort)
{
    int serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    struct timeval tv;
    tv.tv_sec = 3;
    tv.tv_usec = 0;
    setsockopt(serverSocket, SOL_SOCKET, SO_RCVTIMEO, (const char *)&tv, sizeof tv);
    setsockopt(serverSocket, SOL_SOCKET, SO_SNDTIMEO, (const char *)&tv, sizeof tv);
    struct sockaddr_in addr;
    memset((char*)&addr,0,sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(nodePort);
    if ( inet_pton(AF_INET,nodeIp,&addr.sin_addr) <= 0 )
    {
        printf("Error translating command line ip address to usable one. (%s)",nodeIp);
        return -1;
    }
    //pthread_mutex_lock(&conn_mutex);
    if ( connect(serverSocket,(const struct sockaddr *)&addr,sizeof(addr)) < 0 )
    {
        //pthread_mutex_unlock(&conn_mutex);
        //LOG("Failed to connect %s\n", nodeIp);
        return -1;
    }
    //pthread_mutex_unlock(&conn_mutex);
    return(serverSocket);
}

int32_t receiveall(int32_t sock,uint8_t *recvbuf,int32_t maxsize)
{
    uint8_t tmp[4096];
    int32_t received=0,recvbyte;
    recvbyte = (int32_t)recv(sock,(char *)tmp,sizeof(tmp),0);
    while ( recvbyte > 0 )
    {
        if ( received + recvbyte > maxsize )
        {
            //printf("receiveall past maxsize.%d received.%d + recvbyte.%d\n",maxsize,received,recvbyte);
            memcpy(&recvbuf[received],tmp,maxsize-received);
            return(maxsize);
        }
        memcpy(&recvbuf[received],tmp,recvbyte);
        received += recvbyte;
        recvbyte = (int32_t)recv(sock,(char *)tmp,sizeof(tmp),0);
    }
    return(received);
}

int32_t sendbuffer(int32_t sock,uint8_t *buffer,int sz)
{
    int size = sz;
    int numberOfBytes;
    if ( sz <= 0 )
        return(sz);
    while ( size )
    {
        if ( (numberOfBytes= (int32_t)send(sock,(char*)buffer,size,0)) <= 0 )
        {
            //printf("error sending %d bytes errno.%d\n",sz,errno);
            return(numberOfBytes);
        }
        //for (int i=0; i<sz; i++)
        //    printf("%02x",buffer[i]);
        //printf(" send %d of %d\n",numberOfBytes,sz);
        buffer += numberOfBytes;
        size -= numberOfBytes;
    }
    return(sz - size);
}

void *reqresponse(uint8_t *recvbuf,int32_t recvsize,int32_t sock,int32_t type,uint8_t *request,int32_t reqlen,int32_t resptype)
{
    struct quheader H;
    int32_t sz,recvbyte,ptr = 0;
    *(struct quheader *)request = quheaderset(type,reqlen);
    sendbuffer(sock,request,reqlen);
    if ( (recvbyte= receiveall(sock,recvbuf,recvsize)) > 0 )
    {
        while ( ptr < recvbyte )
        {
            memcpy(&H,&recvbuf[ptr],sizeof(H));
            sz = ((H._size[2] << 16) + (H._size[1] << 8) + H._size[0]);
            if ( H._type == resptype )
            {
                //printf("received %d, size.%d type.%d\n",recvbyte,sz,H._type);
                return(&recvbuf[ptr + sizeof(H)]);
            }
            ptr += sz;
        }
    }
    return(0);
}

int32_t socksend(char *ipaddr,int32_t sock,uint8_t *buf,int32_t len)
{
    int32_t retval;
    if ( (retval= sendbuffer(sock,buf,len)) <= 0 )
    {
        if ( errno != 32 )
            printf("%s error %d from socket %d, get new one errno.%d\n",ipaddr,retval,sock,errno);
        close(sock);
        while ( (sock= myconnect(ipaddr,DEFAULT_NODE_PORT)) < 0 )
            sleep(5);
        //printf("%s got new sock.%d\n",ipaddr,sock);
        if ( (retval= sendbuffer(sock,buf,len)) <= 0 )
        {
            printf("second error %d socksend errno.%d\n",retval,errno);
        }
    }
    return(sock);
}


