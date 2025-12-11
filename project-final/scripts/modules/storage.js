/**
 * storage.js - Módulo ES6 para LocalStorage avanzado
 */

export const Storage = {
  setTheme(theme) {
    try {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      return true;
    } catch (error) {
      console.error('Error saving theme:', error);
      return false;
    }
  },
  
  getTheme() {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch (error) {
      console.error('Error getting theme:', error);
      return 'light';
    }
  },
  
  setDirectoryView(view) {
    try {
      localStorage.setItem('directoryView', view);
      return true;
    } catch (error) {
      console.error('Error saving directory view:', error);
      return false;
    }
  },
  
  getDirectoryView() {
    try {
      return localStorage.getItem('directoryView') || 'grid';
    } catch (error) {
      console.error('Error getting directory view:', error);
      return 'grid';
    }
  },
  
  togglePokemonFavorite(id) {
    try {
      const favorites = this.getFavorites();
      const numericId = parseInt(id);
      
      const index = favorites.indexOf(numericId);
      if (index === -1) {
        favorites.push(numericId);
      } else {
        favorites.splice(index, 1);
      }
      
      localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
      return favorites;
    } catch (error) {
      console.error('Error toggling Pokémon favorite:', error);
      return [];
    }
  },
  
  getFavorites() {
    try {
      const stored = JSON.parse(localStorage.getItem('pokemonFavorites') || '[]');
      return stored.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);
    } catch (error) {
      console.error('Error getting Pokémon favorites:', error);
      return [];
    }
  },
  
  setPokemonData(pokemon) {
    try {
      localStorage.setItem('pokemonData', JSON.stringify(pokemon));
      return true;
    } catch (error) {
      console.error('Error saving Pokémon data:', error);
      return false;
    }
  },
  
  getPokemonData() {
    try {
      const data = JSON.parse(localStorage.getItem('pokemonData') || '[]');
      return data.map(pokemon => ({
        ...pokemon,
        id: parseInt(pokemon.id)
      }));
    } catch (error) {
      console.error('Error getting Pokémon data:', error);
      return [];
    }
  },
  
  getPokemonById(id) {
    try {
      const data = this.getPokemonData();
      return data.find(p => p.id === parseInt(id)) || null;
    } catch (error) {
      console.error('Error getting Pokémon by ID:', error);
      return null;
    }
  },
  
  setLastVisit() {
    try {
      localStorage.setItem('lastVisit', Date.now().toString());
      return true;
    } catch (error) {
      console.error('Error saving last visit:', error);
      return false;
    }
  },
  
  getLastVisit() {
    try {
      return localStorage.getItem('lastVisit');
    } catch (error) {
      console.error('Error getting last visit:', error);
      return null;
    }
  },
  
  saveFormData(data) {
    try {
      localStorage.setItem('formData', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving form data:', error);
      return false;
    }
  },
  
  getFormData() {
    try {
      return JSON.parse(localStorage.getItem('formData') || '{}');
    } catch (error) {
      console.error('Error getting form data:', error);
      return {};
    }
  }
};

export default Storage;