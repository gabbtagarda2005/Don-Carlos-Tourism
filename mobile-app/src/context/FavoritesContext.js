import React, { createContext, useState } from 'react';

export const FavoritesContext = createContext();

export function FavoritesContextProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = (spot) => {
    setFavorites([...favorites, spot]);
  };

  const removeFavorite = (spotId) => {
    setFavorites(favorites.filter(fav => fav.id !== spotId));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
