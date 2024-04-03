

extern int64_t SPECTRUM_SUPPLY;
struct addrhash *Addresshash(uint8_t pubkey[32],int32_t createflag);
struct univhash *Univhash(uint8_t pubkey[32],int32_t createflag);
void queue_entity(struct Entity *entity,int32_t tick,uint8_t merkleroot[32]);
