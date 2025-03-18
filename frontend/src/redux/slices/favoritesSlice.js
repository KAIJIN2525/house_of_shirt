import { createSlice } from "@reduxjs/toolkit";

const loadFavoritesFromLocalStorage = () => {
  try {
    const favorites = localStorage.getItem("favorites");
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error("Error loading favorites from local storage:", error);
    return [];
  }
};

const saveFavoritesToLocalStorage = (favorites) => {
  try {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  } catch (error) {
    console.error("Error saving favorites to local storage:", error);
  }
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: loadFavoritesFromLocalStorage(),
  },
  reducers: {
    addToFavorites: (state, action) => {
      const product = action.payload;
      if (!state.items.some((item) => item._id === product._id)) {
        state.items.push(product);
        saveFavoritesToLocalStorage(state.items);
      }
    },
    removeFromFavorites: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item._id !== productId);
      saveFavoritesToLocalStorage(state.items);
    },
  },
});

export const { addToFavorites, removeFromFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
