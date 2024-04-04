import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state type
interface AppState {
    isAuthenticated: boolean | null;
    seedType: string;
    password: string;
    seeds: string | string[];
    theme: 'light' | 'dark';
    tick: string;
    balances: string[];
}

interface UpdateBalancePayload {
    index: number;
    balance: string;
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
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        resetState: () => {
            return initialState;
        },
    },
});

// Export actions
export const { setSeedType, setPassword, setSeeds, setIsAuthenticated, toggleTheme, setTick, setBalances, resetState } = appSlice.actions;

// Export reducer
export default appSlice.reducer;
