import { createSlice, configureStore } from '@reduxjs/toolkit';

const mainSlice = createSlice({
  name: 'main',
  initialState: {
    tonoArpegioSeleccionado: null,
    tipoArpegioSeleccionado: null,
    arpegiosActivos: [],
    armoniaActiva: null,
    nombreArpegioActivo: null,
  },
  reducers: {
    setTonoArpegioSeleccionado: (state, action) => {
      state.tonoArpegioSeleccionado = action.payload;
    },
    setTipoArpegioSeleccionado: (state, action) => {
      state.tipoArpegioSeleccionado = action.payload;
    },
    addArpegioActivo: (state, action) => {     
      state.arpegiosActivos.push(action.payload)
    },
    removeArpegioActivo: (state) => {
      state.arpegiosActivos.pop();
    },
    trasposeArpegiosActivos: (state, action) => {
      state.arpegiosActivos = action.payload;
    },
    setArmoniaActiva: (state, action) => {
      state.armoniaActiva = action.payload;
    },
    setNombreArpegioActivo: (state, action) => {
      state.nombreArpegioActivo = action.payload;
    },
    resetState: () => ({
      tonoArpegioSeleccionado: null,
      tipoArpegioSeleccionado: null,
      arpegiosActivos: [],
      armoniaActiva: null,
      nombreArpegioActivo: null,
    }),
  },
});

export const {
  setTonoArpegioSeleccionado,
  setTipoArpegioSeleccionado,
  addArpegioActivo,
  removeArpegioActivo,
  trasposeArpegiosActivos,
  setArmoniaActiva,
  setNombreArpegioActivo,
  resetState,
} = mainSlice.actions;

// Middleware to save state to localStorage
const saveStateToLocalStorage = (storeAPI) => (next) => (action) => {
  const result = next(action);
  const state = storeAPI.getState();
  localStorage.setItem('reduxState', JSON.stringify(state));
  return result;
};

// Load state from localStorage
const loadStateFromLocalStorage = () => {
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
    getDefaultMiddleware().concat(saveStateToLocalStorage),
});

export default store;