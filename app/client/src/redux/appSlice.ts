import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state type
interface AppState {
    isAuthenticated: boolean | null;
    seedType: string;
    password: string;
    seeds: string | string[];
    theme: 'light' | 'dark';
}

// Initial state
const initialState: | AppState = {
    isAuthenticated: null,
    seedType: "24words",
    seeds: "",
    password: "",
    theme: 'light',
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
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
    },
});

// Export actions
export const { setSeedType, setPassword, setSeeds, setIsAuthenticated, toggleTheme } = appSlice.actions;

// Export reducer
export default appSlice.reducer;
