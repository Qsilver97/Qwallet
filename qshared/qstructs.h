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

struct sandwich
{
    struct sandwich *prev,*next;
    uint8_t pubkey[32];
    int32_t created,futuretick,beforetick,aftertick;
};

struct richlist_entry
{
    uint64_t balance;
    uint8_t pubkey[32];
};

typedef struct
{
    uint16_t tickDuration;
    uint16_t epoch;
    uint32_t tick;
    uint16_t numberOfAlignedVotes;
    uint16_t numberOfMisalignedVotes;
    uint32_t initialTick;
} CurrentTickInfo;

struct pubkeypay
{
    uint8_t pubkeys[25][32];
    int64_t amounts[25];
};

struct RevealAndCommit_input
{
    uint8_t bit4096[512],committedDigest[32];
};

typedef struct
{
    uint8_t peers[4][4];
} ExchangePublicPeers;

struct EntityRequest
{
    struct quheader H;
    uint8_t pubkey[32];
};

struct Entity
{
    uint8_t publicKey[32];
    int64_t incomingAmount, outgoingAmount;
    uint32_t numberOfIncomingTransfers, numberOfOutgoingTransfers;
    uint32_t latestIncomingTransferTick, latestOutgoingTransferTick;
};

struct addrhash
{
    struct Entity entity;
    int32_t nexttick,rank;
};

struct univhash
{
    uint8_t pubkey[32];
    uint32_t ownedtick,possessedtick;
    uint64_t owned[14][2];
    uint64_t possessed[14][2];
};

typedef struct
{
    struct Entity entity;
    uint32_t tick;
    int32_t spectrumIndex;
    uint8_t siblings[SPECTRUM_DEPTH][32];
} RespondedEntity;

typedef struct
{
    uint8_t sourcePublicKey[32];
    uint8_t destinationPublicKey[32];
    int64_t amount;
    uint32_t tick;
    uint16_t inputType;
    uint16_t inputSize;
} Transaction;

struct txentry
{
    uint8_t txid[32];
    Transaction tx;
};

struct qpeer
{
    CurrentTickInfo info;
    char ipaddr[16];
    uint8_t packet[MAX_TX_SIZE];
    int32_t packetlen,numE;
    struct voteq_entry *voteQ;
    pthread_mutex_t peermutex;
};

typedef struct
{
    uint32_t tick;
    uint8_t voteFlags[(NUMBER_OF_COMPUTORS + 7) / 8];
} RequestedQuorumTick;

typedef struct
{
    uint32_t tick;
    uint8_t transactionFlags[NUMBER_OF_TRANSACTIONS_PER_TICK / 8];
} RequestedTickTransactions;

typedef struct
{
    uint16_t computorIndex;
    uint16_t epoch;
    uint32_t tick;

    uint16_t millisecond;
    uint8_t second;
    uint8_t minute;
    uint8_t hour;
    uint8_t day;
    uint8_t month;
    uint8_t year;

    union
    {
        struct
        {
            uint8_t uriSize;
            uint8_t uri[255];
        } proposal;
        struct
        {
            uint8_t zero;
            uint8_t votes[(676 * 3 + 7) / 8];
            uint8_t quasiRandomNumber;
        } ballot;
    } varStruct;

    uint8_t timelock[32];
    uint8_t transactionDigests[NUMBER_OF_TRANSACTIONS_PER_TICK][32];
    int64_t contractFees[1024];

    uint8_t signature[SIGNATURE_SIZE];
} TickData;
typedef struct
{
    uint32_t tick;
} RequestedTickData;

typedef struct
{
    RequestedTickData requestedTickData;
} RequestTickData;

typedef struct
{
    uint16_t zero;
    uint16_t epoch;
    uint32_t tick;

    uint16_t millisecond;
    uint8_t second;
    uint8_t minute;
    uint8_t hour;
    uint8_t day;
    uint8_t month;
    uint8_t year;

    uint64_t prevResourceTestingDigest;

    uint8_t prevSpectrumDigest[32];
    uint8_t prevUniverseDigest[32];
    uint8_t prevComputerDigest[32];

    uint8_t transactionDigest[32];
    uint8_t prevqchain[32];
} Qchain;

typedef struct
{
    uint16_t computorIndex;
    uint16_t epoch;
    uint32_t tick;

    uint16_t millisecond;
    uint8_t second;
    uint8_t minute;
    uint8_t hour;
    uint8_t day;
    uint8_t month;
    uint8_t year;

    uint64_t prevResourceTestingDigest;
    uint64_t saltedResourceTestingDigest;

    uint8_t prevSpectrumDigest[32];
    uint8_t prevUniverseDigest[32];
    uint8_t prevComputerDigest[32];
    uint8_t saltedSpectrumDigest[32];
    uint8_t saltedUniverseDigest[32];
    uint8_t saltedComputerDigest[32];

    uint8_t transactionDigest[32];
    uint8_t expectedNextTickTransactionDigest[32];

    uint8_t signature[SIGNATURE_SIZE];
} Tick;

struct voteq_entry
{
    struct voteq_entry *prev,*next;
    Tick vote;
};

struct quorumdiff
{
    uint64_t saltedResourceTestingDigest;
    uint8_t saltedSpectrumDigest[32];
    uint8_t saltedUniverseDigest[32];
    uint8_t saltedComputerDigest[32];
    uint8_t expectedNextTickTransactionDigest[32];
    uint8_t signature[SIGNATURE_SIZE];
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
    uint64_t everIncreasingNonceAndCommandType;
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
            uint8_t publicKey[32];
            uint8_t type;
            char name[7]; // Capital letters + digits
            char numberOfDecimalPlaces;
            char unitOfMeasurement[7]; // Powers of the corresponding SI base units going in alphabetical order
        } issuance;

        struct
        {
            uint8_t publicKey[32];
            uint8_t type;
            char padding[1];
            uint16_t managingContractIndex;
            uint32_t issuanceIndex;
            int64_t numberOfUnits;
        } ownership;

        struct
        {
            uint8_t publicKey[32];
            uint8_t type;
            char padding[1];
            uint16_t managingContractIndex;
            uint32_t ownershipIndex;
            int64_t numberOfUnits;
        } possession;
    } varStruct;
};

typedef struct
{
    uint8_t publicKey[32];
} RequestIssuedAssets;

typedef struct
{
    struct Asset asset;
    uint32_t tick;
    // TODO: Add siblings
} RespondIssuedAssets;

typedef struct
{
    uint8_t publicKey[32];
} RequestOwnedAssets;

typedef struct
{
    struct Asset asset;
    struct Asset issuanceAsset;
    uint32_t tick;
    // TODO: Add siblings
} RespondOwnedAssets;

typedef struct
{
    uint8_t publicKey[32];
} RequestPossessedAssets;

typedef struct
{
    struct Asset asset;
    struct Asset ownershipAsset;
    struct Asset issuanceAsset;
    uint32_t tick;
    // TODO: Add siblings
} RespondPossessedAssets;

/*typedef struct
{
    uint8_t issuer[32];
    uint8_t possessor[32];
    uint8_t newOwner[32];
    uint64_t assetName;
    int64_t numberOfUnits;
} TransferAssetOwnershipAndPossession_input;*/

struct TransferAssetOwnershipAndPossession_input
{
    uint8_t issuer[32];
    uint8_t newOwnerAndPossessor[32];
    uint64_t assetName;
    int64_t numberOfUnits;
};

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
    uint16_t epoch;
    uint8_t publicKeys[NUMBER_OF_COMPUTORS][32];
    uint8_t signature[SIGNATURE_SIZE];
} Computors;

typedef struct
{
    Computors computors;
} BroadcastComputors;


struct RequestContractFunction // Invokes contract function
{
    uint32_t contractIndex;
    uint16_t inputType;
    uint16_t inputSize;
    // Variable-size input

   /* static constexpr uint8_t type()
    {
        return 42;
    }*/
};

struct RespondContractFunction // Returns result of contract function invocation
{
    // Variable-size output; the size must be 0 if the invocation has failed for whatever reason (e.g. no a function registered for [inputType], or the function has timed out)

    /*static constexpr uint8_t type()
    {
        return 43;
    }*/
};

struct QxFees_output
{
    uint32_t assetIssuanceFee; // Amount of qus
    uint32_t transferFee; // Amount of qus
    uint32_t tradeFee; // Number of billionths
};

struct GetSendToManyV1Fee_output
{
    int64_t fee;
};

struct ContractIPOBid
{
    int64_t price;
    uint16_t quantity;
};
#define REQUEST_CONTRACT_IPO 33
typedef struct
{
    uint32_t contractIndex;
} RequestContractIPO;

#define RESPOND_CONTRACT_IPO 34

typedef struct
{
    uint32_t contractIndex;
    uint32_t tick;
    uint8_t publicKeys[NUMBER_OF_COMPUTORS][32];
    int64_t prices[NUMBER_OF_COMPUTORS];
} RespondContractIPO;


struct Orders_Input
{
    uint8_t issuer[32];
    uint64_t assetName,offset;
};

struct EntityOrders_input
{
    uint8_t entity[32];
    uint64_t offset;
};

struct Orders_Output
{
    uint8_t pubkey[32];
    int64_t price,numberOfShares;
};

struct EntityOrder
{
    uint8_t issuer[32];
    uint64_t assetName;
    int64_t price,numberOfShares;
};

struct issuerpub
{
    const char *name,*addr;
    uint8_t pubkey[32];
    struct Orders_Output bids[256],asks[256];
};

#define AssetAskOrders_input Orders_Input
#define AssetBidOrders_input Orders_Input
struct AssetAskOrders_output { struct Orders_Output orders[256]; };
struct AssetBidOrders_output { struct Orders_Output orders[256]; };

#define EntityAskOrders_input EntityOrders_input
struct EntityAskOrders_output { struct EntityOrder orders[256]; };

#define EntityBidOrders_input EntityOrders_input
struct EntityBidOrders_output { struct EntityOrder orders[256]; };

#define qxGetAssetOrder_input Orders_Input
struct qxGetAssetOrder_output { struct Orders_Output orders[256]; };

#define qxGetEntityOrder_input EntityOrders_input
struct qxGetEntityOrder_output { struct EntityOrder orders[256]; };

#define AddToAskOrder_input EntityOrder
struct AddToAskOrder_output { int64_t addedNumberOfShares; };

#define AddToBidOrder_input EntityOrder
struct AddToBidOrder_output { int64_t addedNumberOfShares; };

#define RemoveFromAskOrder_input EntityOrder
struct RemoveFromAskOrder_output { int64_t removedNumberOfShares; };

#define RemoveFromBidOrder_input EntityOrder
struct RemoveFromBidOrder_output { int64_t removedNumberOfShares; };

#define qxOrderAction_input EntityOrder

#endif
