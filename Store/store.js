import { createSlice, configureStore } from '@reduxjs/toolkit';

const mainSlice = createSlice({
  name: 'main',
  initialState: {
    selectedArpeggioTone: null,
    selectedArpeggioType: null,
    activeArpeggios: [],
    activeHarmony: null,
    activeArpeggioName: null,
  },
  reducers: {
    setSelectedArpeggioTone: (state, action) => {
      state.selectedArpeggioTone = action.payload;
    },
    setSelectedArpeggioType: (state, action) => {
      state.selectedArpeggioType = action.payload;
    },
    addActiveArpeggio: (state, action) => {     
      state.activeArpeggios.push(action.payload)
    },
    removeActiveArpeggio: (state) => {
      state.activeArpeggios.pop();
    },
    removeArpeggioAtIndex: (state, action) => {
      state.activeArpeggios.splice(action.payload, 1);
    },
    transposeActiveArpeggios: (state, action) => {
      state.activeArpeggios = action.payload;
    },
    setActiveHarmony: (state, action) => {
      state.activeHarmony = action.payload;
    },
    setActiveArpeggioName: (state, action) => {
      state.activeArpeggioName = action.payload;
    },
    resetState: () => ({
      selectedArpeggioTone: null,
      selectedArpeggioType: null,
      activeArpeggios: [],
      activeHarmony: null,
      activeArpeggioName: null,
    }),
  },
});

export const {
  setSelectedArpeggioTone,
  setSelectedArpeggioType,
  addActiveArpeggio,
  removeActiveArpeggio,
  removeArpeggioAtIndex,
  transposeActiveArpeggios,
  setActiveHarmony,
  setActiveArpeggioName,
  resetState,
} = mainSlice.actions;

// Middleware to save state to localStorage
const saveStateToLocalStorage = (storeAPI) => (next) => (action) => {
  const result = next(action);
  const state = storeAPI.getState();
  if (typeof window !== 'undefined') {
    localStorage.setItem('reduxState', JSON.stringify(state));
  }
  return result;
};

// Load state from localStorage
const loadStateFromLocalStorage = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.warn('Could not load state from localStorage', e);
    return undefined;
  }
};

// Create store
const preloadedState = loadStateFromLocalStorage();

export const store = configureStore({
  reducer: {
    main: mainSlice.reducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: false // Necessary for complex musical objects
    }).concat(saveStateToLocalStorage),
});

export default store;
