type ModeProps = {
    wsUrl: string;
    type: 'mainnet' | 'testnet';
    // add some more if need
}

type SelectOption = {
    name: string;
    iconUrl: string;
};

type SidebarItemProps = {
    icon: string;
    label: string;
    link: string;
    active?: boolean;
    onClick?: () => void;
};


type SummaryItemProps = {
    icon: string;
    label: string;
    amount: string;
};

type AssetItemProps = {
    icon: string;
    name: string;
    amount: string;
    percentage: number;
    colorClassName: string;
};

interface AccountInfoInterface {
    addresses: string[];
    numaddr: number;
    subshash: string;
}

interface MarketcapInterface {
    supply: string;
    price: string;
    marketcap: string;
}

interface RichListInterface {
    [address: string]: [number, string, string][];
}

// trading page
interface OrderInterface {
    name: string;
    issuer: string;
    bids: [string, string, string][];
    asks: [string, string, string][];
}

interface TokenPriceInterface {
    [key: string]: [number, number];
}

export type { SelectOption, SidebarItemProps, SummaryItemProps, AssetItemProps, ModeProps, AccountInfoInterface, MarketcapInterface, RichListInterface, OrderInterface, TokenPriceInterface }