#ifndef qstructs_h
#define qstructs_h

struct quheader
{
    uint8_t _size[3];
    uint8_t _type;
    uint32_t _dejavu;
};

struct qpubreq
{
    struct qpubreq *prev,*next;
    struct quheader H;
    uint8_t pubkey[32];
};

typedef struct
{
    unsigned short tickDuration;
    unsigned short epoch;
    unsigned int tick;
    unsigned short numberOfAlignedVotes;
    unsigned short numberOfMisalignedVotes;
    unsigned int initialTick;
} CurrentTickInfo;

struct qpeer
{
    CurrentTickInfo info;
    char ipaddr[16];
    uint8_t packet[MAX_INPUT_SIZE*2];
    int32_t packetlen;
};

typedef struct
{
    unsigned char peers[4][4];
} ExchangePublicPeers;

struct EntityRequest
{
    struct quheader H;
    uint8_t pubkey[32];
};

struct Entity
{
    unsigned char publicKey[32];
    long long incomingAmount, outgoingAmount;
    unsigned int numberOfIncomingTransfers, numberOfOutgoingTransfers;
    unsigned int latestIncomingTransferTick, latestOutgoingTransferTick;
};

struct addrhash
{
    uint8_t merkleroot[32];
    struct Entity entity;
    int32_t tick,flushtick;
    uint64_t flushmerkle64,prevsent,prevrecv;
};

typedef struct
{
    struct Entity entity;
    unsigned int tick;
    int spectrumIndex;
    unsigned char siblings[SPECTRUM_DEPTH][32];
} RespondedEntity;

typedef struct
{
    unsigned char sourcePublicKey[32];
    unsigned char destinationPublicKey[32];
    long long amount;
    unsigned int tick;
    unsigned short inputType;
    unsigned short inputSize;
} Transaction;

typedef struct
{
    unsigned int tick;
    unsigned char voteFlags[(NUMBER_OF_COMPUTORS + 7) / 8];
} RequestedQuorumTick;

typedef struct
{
    unsigned int tick;
    unsigned char transactionFlags[NUMBER_OF_TRANSACTIONS_PER_TICK / 8];
} RequestedTickTransactions;

typedef struct
{
    unsigned short computorIndex;
    unsigned short epoch;
    unsigned int tick;

    unsigned short millisecond;
    unsigned char second;
    unsigned char minute;
    unsigned char hour;
    unsigned char day;
    unsigned char month;
    unsigned char year;

    union
    {
        struct
        {
            unsigned char uriSize;
            unsigned char uri[255];
        } proposal;
        struct
        {
            unsigned char zero;
            unsigned char votes[(676 * 3 + 7) / 8];
            unsigned char quasiRandomNumber;
        } ballot;
    } varStruct;

    unsigned char timelock[32];
    unsigned char transactionDigests[NUMBER_OF_TRANSACTIONS_PER_TICK][32];
    long long contractFees[1024];

    unsigned char signature[SIGNATURE_SIZE];
} TickData;
typedef struct
{
    unsigned int tick;
} RequestedTickData;

typedef struct
{
    RequestedTickData requestedTickData;
} RequestTickData;

typedef struct
{
    unsigned short zero;
    unsigned short epoch;
    unsigned int tick;

    unsigned short millisecond;
    unsigned char second;
    unsigned char minute;
    unsigned char hour;
    unsigned char day;
    unsigned char month;
    unsigned char year;

    unsigned long long prevResourceTestingDigest;

    uint8_t prevSpectrumDigest[32];
    uint8_t prevUniverseDigest[32];
    uint8_t prevComputerDigest[32];

    uint8_t transactionDigest[32];
    uint8_t prevqchain[32];
} Qchain;

typedef struct
{
    unsigned short computorIndex;
    unsigned short epoch;
    unsigned int tick;

    unsigned short millisecond;
    unsigned char second;
    unsigned char minute;
    unsigned char hour;
    unsigned char day;
    unsigned char month;
    unsigned char year;

    unsigned long long prevResourceTestingDigest;
    unsigned long long saltedResourceTestingDigest;

    uint8_t prevSpectrumDigest[32];
    uint8_t prevUniverseDigest[32];
    uint8_t prevComputerDigest[32];
    uint8_t saltedSpectrumDigest[32];
    uint8_t saltedUniverseDigest[32];
    uint8_t saltedComputerDigest[32];

    uint8_t transactionDigest[32];
    uint8_t expectedNextTickTransactionDigest[32];

    unsigned char signature[SIGNATURE_SIZE];
} Tick;
struct quorumdiff
{
    unsigned long long saltedResourceTestingDigest;
    uint8_t saltedSpectrumDigest[32];
    uint8_t saltedUniverseDigest[32];
    uint8_t saltedComputerDigest[32];
    uint8_t expectedNextTickTransactionDigest[32];
    unsigned char signature[SIGNATURE_SIZE];
};

struct QuorumData
{
    Tick Quorum[NUMBER_OF_COMPUTORS];
};

typedef struct
{
    RequestedQuorumTick requestedQuorumTick;
} RequestQuorumTick;

struct SpecialCommand
{
    unsigned long long everIncreasingNonceAndCommandType;
};

#define EMPTY 0
#define ISSUANCE 1
#define OWNERSHIP 2
#define POSSESSION 3

struct Asset
{
    union
    {
        struct
        {
            unsigned char publicKey[32];
            unsigned char type;
            char name[7]; // Capital letters + digits
            char numberOfDecimalPlaces;
            char unitOfMeasurement[7]; // Powers of the corresponding SI base units going in alphabetical order
        } issuance;

        struct
        {
            unsigned char publicKey[32];
            unsigned char type;
            char padding[1];
            unsigned short managingContractIndex;
            unsigned int issuanceIndex;
            long long numberOfUnits;
        } ownership;

        struct
        {
            unsigned char publicKey[32];
            unsigned char type;
            char padding[1];
            unsigned short managingContractIndex;
            unsigned int ownershipIndex;
            long long numberOfUnits;
        } possession;
    } varStruct;
};

typedef struct
{
    unsigned char publicKey[32];
} RequestIssuedAssets;

typedef struct
{
    struct Asset asset;
    unsigned int tick;
    // TODO: Add siblings
} RespondIssuedAssets;

typedef struct
{
    unsigned char publicKey[32];
} RequestOwnedAssets;

typedef struct
{
    struct Asset asset;
    struct Asset issuanceAsset;
    unsigned int tick;
    // TODO: Add siblings
} RespondOwnedAssets;

typedef struct
{
    unsigned char publicKey[32];
} RequestPossessedAssets;

typedef struct
{
    struct Asset asset;
    struct Asset ownershipAsset;
    struct Asset issuanceAsset;
    unsigned int tick;
    // TODO: Add siblings
} RespondPossessedAssets;

typedef struct
{
    uint8_t issuer[32];
    uint8_t possessor[32];
    uint8_t newOwner[32];
    unsigned long long assetName;
    long long numberOfUnits;
} TransferAssetOwnershipAndPossession_input;

struct IssueAsset_input
{
    uint64_t name;
    int64_t numberOfUnits;
    uint64_t unitOfMeasurement;
    char numberOfDecimalPlaces;
};

typedef struct
{
    // TODO: Padding
    unsigned short epoch;
    unsigned char publicKeys[NUMBER_OF_COMPUTORS][32];
    unsigned char signature[SIGNATURE_SIZE];
} Computors;

typedef struct
{
    Computors computors;
} BroadcastComputors;


struct RequestContractFunction // Invokes contract function
{
    unsigned int contractIndex;
    unsigned short inputType;
    unsigned short inputSize;
    // Variable-size input

   /* static constexpr unsigned char type()
    {
        return 42;
    }*/
};

struct RespondContractFunction // Returns result of contract function invocation
{
    // Variable-size output; the size must be 0 if the invocation has failed for whatever reason (e.g. no a function registered for [inputType], or the function has timed out)

    /*static constexpr unsigned char type()
    {
        return 43;
    }*/
};

struct Fees_output
{
    uint32_t assetIssuanceFee; // Amount of qus
    uint32_t transferFee; // Amount of qus
    uint32_t tradeFee; // Number of billionths
};
struct ContractIPOBid
{
    long long price;
    unsigned short quantity;
};
#define REQUEST_CONTRACT_IPO 33
typedef struct
{
    unsigned int contractIndex;
} RequestContractIPO;

#define RESPOND_CONTRACT_IPO 34

typedef struct
{
    unsigned int contractIndex;
    unsigned int tick;
    uint8_t publicKeys[NUMBER_OF_COMPUTORS][32];
    long long prices[NUMBER_OF_COMPUTORS];
} RespondContractIPO;

#endif
