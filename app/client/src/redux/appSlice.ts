import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state type
interface UpdateMarketcapPayload {
    supply: string,
    price: string,
    marketcap: string,
}

type RichlistItemArray = [number, string, string];

interface RichlistInterface {
    [key: string]: RichlistItemArray[];
}

interface AppState {
    isAuthenticated: boolean | null;
    seedType: string;
    password: string;
    seeds: string | string[];
    theme: 'light' | 'dark';
    tick: string;
    balances: string[];
    tokens: string[];
    richlist: RichlistInterface;
    marketcap: UpdateMarketcapPayload;
}

interface UpdateBalancePayload {
    index: number;
    balance: string;
}

interface UpdateRichlistPayload {
    name: string;
    richlist: RichlistItemArray[];
}

// Initial state
const initialState: | AppState = {
    isAuthenticated: null,
    seedType: "24words",
    seeds: "",
    password: "",
    theme: 'light',
    tick: "",
    balances: Array(100).fill(""),
    tokens: [],
    richlist: {},
    marketcap: {
        supply: "0",
        price: "0",
        marketcap: "0",
    },
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setSeedType: (state, action: PayloadAction<string>) => {
            state.seedType = action.payload;
        },
        setPassword: (state, action: PayloadAction<string>) => {
            state.password = action.payload;
        },
        setSeeds: (state, action: PayloadAction<string | string[]>) => {
            state.seeds = action.payload;
        },
        setIsAuthenticated: (state, action: PayloadAction<boolean | null>) => {
            state.isAuthenticated = action.payload;
        },
        setTick: (state, action: PayloadAction<string>) => {
            state.tick = action.payload;
        },
        setBalances: (state, action: PayloadAction<UpdateBalancePayload>) => {
            const { index, balance } = action.payload;
            if (index >= 0 && index < state.balances.length) {
                state.balances[index] = balance;
            }
        },
        setTokens: (state, action: PayloadAction<string[]>) => {
            state.tokens = action.payload;
        },
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        updateRichlist: (state, action: PayloadAction<UpdateRichlistPayload>) => {
            state.richlist = { ...state.richlist, [action.payload.name]: action.payload.richlist };
        },
        setRichlist: (state, action: PayloadAction<any>) => {
            state.richlist = { ...action.payload };
        },
        setMarketcap: (state, action: PayloadAction<UpdateMarketcapPayload>) => {
            state.marketcap = { ...action.payload };
        },
        resetState: (state) => {
            Object.assign(state, initialState);
        },
    },
});

// Export actions
export const { setSeedType, setPassword, setSeeds, setIsAuthenticated, toggleTheme, setTick, setBalances, resetState, setTokens, updateRichlist, setMarketcap, setRichlist } = appSlice.actions;

// Export reducer
export default appSlice.reducer;
