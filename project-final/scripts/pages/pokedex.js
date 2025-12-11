/**
 * pokedex.js - Módulo ES6 Premium para Pokédex Interactiva
 * FIX: Sincronización completa de datos para TODOS los favoritos
 */
import { fetchPokemon } from '../modules/api/pokemon.js';
import { Storage } from '../modules/storage.js';
import { openModal } from '../modules/ui/modals.js';

class PokedexPremiumApp {
  constructor() {
    this.currentPokemon = null;
    this.timer = 30;
    this.timerInterval = null;
    this.history = JSON.parse(localStorage.getItem('pokemonHistory')) || [];
    this.maxHistory = 24;
    this.activeFilter = 'all';
    this.searchTimeout = null;
    this.favoritesManager = null;
    
    // ✅ DATOS POKÉMON COMPARTIDOS - INCLUYE CACHÉ DINÁMICO
    this.pokemonData = [];
    
    this.pokemonTypes = [
      { name: 'all', color: '#ff2e2e', label: 'All' },
      { name: 'normal', color: '#A8A878', label: 'Normal' },
      { name: 'fire', color: '#F08030', label: 'Fire' },
      { name: 'water', color: '#6890F0', label: 'Water' },
      { name: 'electric', color: '#F8D030', label: 'Electric' },
      { name: 'grass', color: '#78C850', label: 'Grass' },
      { name: 'ice', color: '#98D8D8', label: 'Ice' },
      { name: 'fighting', color: '#C03028', label: 'Fighting' },
      { name: 'poison', color: '#A040A0', label: 'Poison' },
      { name: 'ground', color: '#E0C068', label: 'Ground' },
      { name: 'flying', color: '#A890F0', label: 'Flying' },
      { name: 'psychic', color: '#F85888', label: 'Psychic' },
      { name: 'bug', color: '#A8B820', label: 'Bug' },
      { name: 'rock', color: '#B8A038', label: 'Rock' },
      { name: 'ghost', color: '#705898', label: 'Ghost' },
      { name: 'dragon', color: '#7038F8', label: 'Dragon' },
      { name: 'dark', color: '#705848', label: 'Dark' },
      { name: 'steel', color: '#B8B8D0', label: 'Steel' },
      { name: 'fairy', color: '#EE99AC', label: 'Fairy' }
    ];

    this.init();
  }

  async init() {
    this.cacheElements();
    this.bindEvents();
    this.initTabs();
    this.initHistoryFilters();
    this.startTimer();
    
    // ✅ CARGAR DATOS PRIMERO
    await this.loadPokemonData();
    
    this.loadHistory();
    this.favoritesManager = new FavoritesManager(this, this.pokemonData);
    this.favoritesManager.init();
    this.loadRandomPokemon();
    
    console.log('✅ Pokédex Premium initialized with synchronized data');
  }

  async loadPokemonData() {
    try {
      this.pokemonData = Storage.getPokemonData();
      if (this.pokemonData.length === 0) {
        this.pokemonData = await fetchPokemon();
        Storage.setPokemonData(this.pokemonData);
      }
      console.log(`✅ Loaded ${this.pokemonData.length} base Pokémon`);
    } catch (error) {
      console.error('❌ Error loading Pokémon data:', error);
      this.pokemonData = [];
    }
  }

  cacheElements() {
    this.elements = {
      searchInput: document.getElementById('pokemon-search'),
      timerCount: document.getElementById('pokedex-timer'),
      refreshBtn: document.getElementById('refresh-pokemon-btn'),
      pokemonName: document.getElementById('pokemon-name-display'),
      pokemonSpecies: document.getElementById('pokemon-species-display'),
      pokemonId: document.getElementById('pokemon-id-display'),
      imageContainer: document.getElementById('pokemon-image-container'),
      typesContainer: document.getElementById('pokemon-types-display'),
      statsOverview: document.getElementById('stats-overview-display'),
      favoriteBtn: document.getElementById('favoriteBtn'),
      favoriteIcon: document.getElementById('favoriteBtn')?.querySelector('.favorite-icon'),
      favoriteText: document.getElementById('favoriteBtn')?.querySelector('.favorite-text'),
      heightDisplay: document.getElementById('pokemon-height-display'),
      weightDisplay: document.getElementById('pokemon-weight-display'),
      abilitiesDisplay: document.getElementById('pokemon-abilities-display'),
      habitatDisplay: document.getElementById('pokemon-habitat-display'),
      biologyDisplay: document.getElementById('pokemon-biology-display'),
      statsContainer: document.getElementById('stats-container-display'),
      historyGrid: document.getElementById('history-grid-display'),
      filterSidebar: document.getElementById('filter-sidebar-premium'),
      historyCount: document.getElementById('history-count-display'),
      favoritesGrid: document.getElementById('favorites-grid-premium'),
      clearFavoritesBtn: document.getElementById('clearFavoritesBtn'),
      pokemonModal: document.getElementById('pokemon-modal'),
      modalBody: document.getElementById('modal-body')
    };
  }

  bindEvents() {
    this.elements.refreshBtn.addEventListener('click', () => {
      this.loadRandomPokemon();
      this.resetTimer();
    });

    this.elements.searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    this.elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch(this.elements.searchInput.value);
      }
    });
    
    if (this.elements.favoriteBtn) {
      this.elements.favoriteBtn.addEventListener('click', () => {
        if (this.currentPokemon) {
          // ✅ ASEGURAR QUE EL POKÉMON ESTÁ EN LA CACHÉ
          this.ensurePokemonInCache(this.currentPokemon.id);
          this.toggleFavorite(this.currentPokemon.id);
          this.favoritesManager?.renderFavorites();
        }
      });
    }
  }

  // ✅ NUEVO MÉTODO - ASEGURA QUE UN POKÉMON ESTÉ EN LA CACHÉ
  async ensurePokemonInCache(pokemonId) {
    const exists = this.pokemonData.some(p => p.id === pokemonId);
    if (!exists) {
      console.log(`🔍 Pokémon #${pokemonId} not in cache, fetching...`);
      try {
        const response = await fetch(`data/pokemon.json`);
        const allPokemon = await response.json();
        const pokemon = allPokemon.find(p => p.id === pokemonId);
        
        if (pokemon) {
          this.pokemonData.push(pokemon);
          Storage.setPokemonData(this.pokemonData);
          console.log(`✅ Added Pokémon #${pokemonId} to cache`);
        }
      } catch (error) {
        console.error(`❌ Failed to cache Pokémon #${pokemonId}:`, error);
      }
    }
  }

  initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn-premium');
    const tabPanes = document.querySelectorAll('.tab-pane-premium');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        tabPanes.forEach(pane => pane.classList.remove('active'));
        document.getElementById(`${tabId}-tab-premium`).classList.add('active');
      });
    });
  }

  initHistoryFilters() {
    const title = document.createElement('div');
    title.className = 'filter-title-premium';
    title.textContent = 'FILTER BY TYPE';
    this.elements.filterSidebar.appendChild(title);

    this.pokemonTypes.forEach(type => {
      const button = this.createFilterButton(type);
      this.elements.filterSidebar.appendChild(button);
    });

    this.updateFilterCounts();
  }

  createFilterButton(type) {
    const button = document.createElement('button');
    button.className = 'filter-btn-premium';
    button.dataset.type = type.name;

    const indicator = document.createElement('div');
    indicator.className = 'type-indicator-premium';
    indicator.style.backgroundColor = type.color;

    const text = document.createElement('span');
    text.textContent = type.label;

    const count = document.createElement('span');
    count.className = 'type-count';
    count.textContent = '0';

    button.appendChild(indicator);
    button.appendChild(text);
    button.appendChild(count);

    button.addEventListener('click', () => this.filterHistory(type.name));

    return button;
  }

  updateFilterCounts() {
    const counts = { all: this.history.length };
    this.pokemonTypes.forEach(type => {
      if (type.name !== 'all') counts[type.name] = 0;
    });

    this.history.forEach(pokemon => {
      if (pokemon.types) {
        pokemon.types.forEach(type => {
          if (counts[type] !== undefined) counts[type]++;
        });
      }
    });

    document.querySelectorAll('.filter-btn-premium').forEach(btn => {
      const type = btn.dataset.type;
      const countEl = btn.querySelector('.type-count');
      if (countEl && counts[type] !== undefined) {
        countEl.textContent = counts[type];
      }
    });
  }

  filterHistory(type) {
    this.activeFilter = type;
    
    document.querySelectorAll('.filter-btn-premium').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    this.updateHistoryDisplay();
    this.updateHistoryCount();
  }

  updateHistoryCount() {
    let count = this.history.length;
    if (this.activeFilter !== 'all') {
      count = this.history.filter(p => p.types?.includes(this.activeFilter)).length;
    }
    this.elements.historyCount.textContent = `${count} Pokémon`;
  }

  handleSearch(searchTerm) {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    
    if (!searchTerm.trim()) return;

    this.searchTimeout = setTimeout(() => {
      this.performSearch(searchTerm);
    }, 500);
  }

  async performSearch(searchTerm) {
    searchTerm = searchTerm.trim().toLowerCase();
    if (!searchTerm) return;

    this.showLoadingState();

    try {
      let pokemonId;
      
      if (!isNaN(searchTerm)) {
        pokemonId = parseInt(searchTerm);
        if (pokemonId < 1 || pokemonId > 151) {
          throw new Error('Please enter a number between 1-151');
        }
      } else {
        pokemonId = await this.getPokemonIdByName(searchTerm);
      }

      await this.loadPokemonById(pokemonId);
      this.resetTimer();
      this.clearSearch();

    } catch (error) {
      console.error('Search error:', error);
      this.showSearchError(error.message);
    }
  }

  async getPokemonIdByName(name) {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const data = await response.json();
    const pokemon = data.results.find(p => p.name.toLowerCase() === name);
    if (!pokemon) throw new Error('Pokémon not found');
    return parseInt(pokemon.url.split('/').filter(Boolean).pop());
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timer = 30;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timer--;
      this.updateTimerDisplay();

      if (this.timer <= 5) {
        this.elements.timerCount.classList.add('timer-pulse');
      }

      if (this.timer <= 0) {
        this.loadRandomPokemon();
        this.resetTimer();
      }
    }, 1000);
    
    console.log('Timer started, next Pokémon in 30 seconds');
  }

  resetTimer() {
    this.timer = 30;
    this.updateTimerDisplay();
    this.elements.timerCount.classList.remove('timer-pulse');
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.startTimer();
  }

  updateTimerDisplay() {
    this.elements.timerCount.textContent = this.timer.toString().padStart(2, '0');
  }

  clearSearch() {
    this.elements.searchInput.value = '';
  }

  async loadRandomPokemon() {
    console.log('Loading random Pokémon...');
    this.showLoadingState();
    const randomId = Math.floor(Math.random() * 151) + 1;
    await this.loadPokemonById(randomId);
  }

  async loadPokemonById(id) {
    try {
      const [pokemonData, speciesData] = await Promise.all([
        this.fetchPokemonData(id),
        this.fetchPokemonSpecies(id)
      ]);

      this.currentPokemon = pokemonData;
      this.displayPokemon(pokemonData, speciesData);
      this.addToHistory(pokemonData);

    } catch (error) {
      console.error('Error loading Pokémon:', error);
      this.showErrorState();
    }
  }

  async fetchPokemonData(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) throw new Error('Pokémon not found');
    return response.json();
  }

  async fetchPokemonSpecies(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    if (!response.ok) throw new Error('Species data not found');
    return response.json();
  }

  displayPokemon(pokemon, species) {
    // Header
    this.elements.pokemonName.textContent = this.capitalize(pokemon.name);
    this.elements.pokemonId.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    
    // Especie
    const speciesEntry = species.genera.find(g => g.language.name === 'en');
    this.elements.pokemonSpecies.textContent = speciesEntry ? speciesEntry.genus : 'Unknown species';
    
    // Tipos
    this.displayTypes(pokemon.types);
    
    // Imagen
    this.displayImage(pokemon);
    
    // Stats overview
    this.displayStatsOverview(pokemon.stats);
    
    // ✅ Actualizar botón de favoritos
    this.updateFavoriteButton(pokemon.id);
    
    // About tab
    this.elements.heightDisplay.textContent = `${(pokemon.height / 10).toFixed(1)} m`;
    this.elements.weightDisplay.textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
    
    const abilities = pokemon.abilities.slice(0, 2).map(a => 
      this.capitalize(a.ability.name.replace('-', ' '))
    ).join(', ');
    this.elements.abilitiesDisplay.textContent = abilities || 'None';
    
    this.elements.habitatDisplay.textContent = species.habitat ? 
      this.capitalize(species.habitat.name) : 'Unknown';
    
    // Biología
    const englishEntry = species.flavor_text_entries.find(e => e.language.name === 'en');
    this.elements.biologyDisplay.textContent = englishEntry ? 
      englishEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.';
    
    // Stats detalladas
    this.displayDetailedStats(pokemon.stats);
  }

  displayTypes(types) {
    this.elements.typesContainer.innerHTML = '';
    types.forEach(type => {
      const badge = document.createElement('span');
      badge.className = `type-badge-premium type-${type.type.name}-premium`;
      badge.textContent = type.type.name.toUpperCase();
      this.elements.typesContainer.appendChild(badge);
    });
  }

  displayImage(pokemon) {
    this.elements.imageContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    img.alt = pokemon.name;
    img.onerror = () => {
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    };
    this.elements.imageContainer.appendChild(img);
  }

  displayStatsOverview(stats) {
    const statNames = ['HP', 'ATK', 'DEF'];
    this.elements.statsOverview.innerHTML = '';
    
    statNames.forEach((name, index) => {
      const item = document.createElement('div');
      item.className = 'stat-item-premium';
      
      const value = document.createElement('div');
      value.className = 'stat-value-premium';
      value.textContent = stats[index].base_stat;
      
      const label = document.createElement('div');
      label.className = 'stat-label-premium';
      label.textContent = name;
      
      item.appendChild(value);
      item.appendChild(label);
      this.elements.statsOverview.appendChild(item);
    });
  }

  displayDetailedStats(stats) {
    const statNames = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];
    this.elements.statsContainer.innerHTML = '';
    
    stats.forEach((stat, index) => {
      const row = document.createElement('div');
      row.className = 'stat-row-premium';
      
      const name = document.createElement('div');
      name.className = 'stat-name-premium';
      name.textContent = statNames[index];
      
      const number = document.createElement('div');
      number.className = 'stat-number-premium';
      number.textContent = stat.base_stat.toString().padStart(3, '0');
      
      const bar = document.createElement('div');
      bar.className = 'stat-bar-premium';
      
      const fill = document.createElement('div');
      fill.className = 'stat-fill-premium';
      fill.style.width = `${Math.min(stat.base_stat, 100)}%`;
      
      if (stat.base_stat >= 100) fill.style.background = '#4CAF50';
      else if (stat.base_stat >= 70) fill.style.background = '#FFC107';
      else fill.style.background = '#FF5722';
      
      bar.appendChild(fill);
      row.appendChild(name);
      row.appendChild(number);
      row.appendChild(bar);
      
      this.elements.statsContainer.appendChild(row);
    });
  }

  toggleFavorite(pokemonId) {
    const favorites = Storage.togglePokemonFavorite(pokemonId);
    this.updateFavoriteButton(pokemonId);
    
    this.elements.favoriteBtn.classList.add('favorite-animate');
    setTimeout(() => {
      this.elements.favoriteBtn.classList.remove('favorite-animate');
    }, 300);
    
    console.log(`✅ Toggled favorite for Pokemon #${pokemonId}. Total favorites: ${favorites.length}`);
  }

  updateFavoriteButton(pokemonId) {
    if (!this.elements.favoriteBtn) return;
    
    const favorites = Storage.getFavorites();
    const isFavorited = favorites.includes(parseInt(pokemonId));
    
    this.elements.favoriteBtn.setAttribute('aria-pressed', isFavorited);
    
    if (isFavorited) {
      this.elements.favoriteIcon.textContent = '❤️';
      this.elements.favoriteText.textContent = 'Favorited';
      this.elements.favoriteBtn.classList.add('favorited');
    } else {
      this.elements.favoriteIcon.textContent = '⭐';
      this.elements.favoriteText.textContent = 'Add to Favorites';
      this.elements.favoriteBtn.classList.remove('favorited');
    }
  }

  addToHistory(pokemon) {
    const types = pokemon.types.map(t => t.type.name);
    
    const existingIndex = this.history.findIndex(p => p.id === pokemon.id);
    if (existingIndex !== -1) {
      this.history.splice(existingIndex, 1);
    }
    
    this.history.unshift({
      id: pokemon.id,
      name: pokemon.name,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
      types: types
    });
    
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
    
    localStorage.setItem('pokemonHistory', JSON.stringify(this.history));
    this.updateHistoryDisplay();
    this.updateFilterCounts();
  }

  loadHistory() {
    this.updateHistoryDisplay();
    this.updateFilterCounts();
  }

  updateHistoryDisplay() {
    let filteredHistory = this.history;
    
    if (this.activeFilter !== 'all') {
      filteredHistory = this.history.filter(pokemon => 
        pokemon.types && pokemon.types.includes(this.activeFilter)
      );
    }

    if (filteredHistory.length === 0) {
      this.elements.historyGrid.innerHTML = `
        <div class="no-history-premium">
          <div class="no-history-premium-icon">👈</div>
          <div>No Pokémon in history yet</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 1rem;">
            Search or use the refresh button to add Pokémon to history
          </div>
        </div>
      `;
      return;
    }

    this.elements.historyGrid.innerHTML = filteredHistory.map(pokemon => `
      <div class="history-item-premium" data-id="${pokemon.id}">
        <div class="history-id-premium">#${pokemon.id.toString().padStart(3, '0')}</div>
        <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy">
        <div class="history-name-premium">${this.capitalize(pokemon.name)}</div>
        <div class="history-types-premium">
          ${pokemon.types ? pokemon.types.map(type => `
            <span class="history-type-premium type-${type}-premium">${type.charAt(0).toUpperCase()}</span>
          `).join('') : ''}
        </div>
      </div>
    `).join('');

    this.elements.historyGrid.querySelectorAll('.history-item-premium').forEach(item => {
      item.addEventListener('click', async () => {
        const id = parseInt(item.dataset.id);
        try {
          await this.loadPokemonById(id);
          this.resetTimer();
        } catch (error) {
          console.error('Error loading from history:', error);
        }
      });
    });
  }

  showLoadingState() {
    this.elements.imageContainer.innerHTML = '<div class="loading-spinner-premium"></div>';
    this.elements.pokemonName.textContent = '----------';
    this.elements.pokemonSpecies.textContent = '----------';
    this.elements.biologyDisplay.textContent = 'Loading Pokémon data...';
  }

  showErrorState() {
    this.elements.imageContainer.innerHTML = '<div class="error-message" style="color: var(--pokemon-red);">⚠️ Error loading Pokémon</div>';
    this.elements.biologyDisplay.textContent = 'Failed to load Pokémon data. Please try again.';
  }

  showSearchError(message) {
    this.elements.imageContainer.innerHTML = `<div class="error-message">${message}</div>`;
    this.elements.biologyDisplay.textContent = 'Search for a Pokémon by name or number (1-151)';
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).replace(/-/g, ' ');
  }
}

// ✅ CLASE FAVORITES MANAGER - CON BÚSQUEDA DINÁMICA
class FavoritesManager {
  constructor(pokedexApp, sharedPokemonData) {
    this.pokedexApp = pokedexApp;
    this.favoritesGrid = document.getElementById('favorites-grid-premium');
    this.clearBtn = document.getElementById('clearFavoritesBtn');
    // ✅ USAR DATOS COMPARTIDOS
    this.pokemonData = sharedPokemonData || [];
    
    // ✅ CACHE DINÁMICA para Pokémon que no están en el JSON inicial
    this.dynamicCache = new Map();
  }

  init() {
    this.bindEvents();
    this.renderFavorites();
  }

  bindEvents() {
    this.clearBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all favorites?')) {
        this.clearAllFavorites();
      }
    });
  }

  // ✅ MÉTODO CLAVE - OBTENER POKÉMON CON CACHÉ DINÁMICA
  async getPokemonForFavorites() {
    const favorites = Storage.getFavorites();
    const result = [];
    const missingIds = [];

    // Primero, intentar encontrar en datos locales
    favorites.forEach(id => {
      const pokemon = this.pokemonData.find(p => p && p.id === id);
      if (pokemon) {
        result.push(pokemon);
      } else if (this.dynamicCache.has(id)) {
        // Buscar en caché dinámica
        result.push(this.dynamicCache.get(id));
      } else {
        // Si no está en ningún lado, marcar para buscar
        missingIds.push(id);
      }
    });

    // ✅ BUSCAR DINÁMICAMENTE LOS QUE FALTAN
    if (missingIds.length > 0) {
      console.log(`🔍 Searching ${missingIds.length} missing Pokémon...`);
      const fetchedPokemon = await this.fetchMissingPokemon(missingIds);
      
      fetchedPokemon.forEach(pokemon => {
        if (pokemon) {
          this.dynamicCache.set(pokemon.id, pokemon);
          result.push(pokemon);
        }
      });
      
      // ✅ ORDENAR POR ID para mantener consistencia
      result.sort((a, b) => favorites.indexOf(a.id) - favorites.indexOf(b.id));
    }

    return result;
  }

  // ✅ BUSCAR POKÉMON QUE NO ESTÁN EN EL JSON INICIAL
  async fetchMissingPokemon(ids) {
    const results = [];
    
    for (const id of ids) {
      try {
        // ✅ INTENTAR CARGAR DESDE pokemon.json PRIMERO
        const response = await fetch(`data/pokemon.json`);
        const allPokemon = await response.json();
        const pokemon = allPokemon.find(p => p.id === id);
        
        if (pokemon) {
          results.push(pokemon);
          console.log(`✅ Found Pokémon #${id} in pokemon.json`);
        } else {
          // ✅ SI NO ESTÁ EN JSON, BUSCAR EN LA API
          console.log(`🌐 Fetching Pokémon #${id} from API...`);
          const apiResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const data = await apiResponse.json();
          
          // ✅ TRANSFORMAR FORMATO API AL FORMATO LOCAL
          const transformedPokemon = {
            id: data.id,
            name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
            types: data.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
            height: data.height / 10,
            weight: data.weight / 10,
            abilities: data.abilities.slice(0, 2).map(a => 
              a.ability.name.replace('-', ' ').charAt(0).toUpperCase() + 
              a.ability.name.replace('-', ' ').slice(1)
            ),
            baseExperience: data.base_experience,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
            stats: {
              hp: data.stats[0].base_stat,
              attack: data.stats[1].base_stat,
              defense: data.stats[2].base_stat,
              specialAttack: data.stats[3].base_stat,
              specialDefense: data.stats[4].base_stat,
              speed: data.stats[5].base_stat
            }
          };
          
          results.push(transformedPokemon);
          console.log(`✅ Fetched Pokémon #${id} from API`);
        }
      } catch (error) {
        console.error(`❌ Failed to fetch Pokémon #${id}:`, error);
      }
    }
    
    return results;
  }

  // ✅ CORREGIDO: Renderizado async con datos dinámicos
  async renderFavorites() {
    const favorites = Storage.getFavorites();
    
    if (favorites.length === 0) {
      this.showEmptyState();
      return;
    }

    // ✅ OBTENER TODOS LOS POKÉMON (incluyendo los que buscamos dinámicamente)
    const favoritePokemon = await this.getPokemonForFavorites();
    
    if (favoritePokemon.length === 0) {
      this.showEmptyState();
      return;
    }

    this.showFavoritesGrid(favoritePokemon);
  }

  showEmptyState() {
    this.favoritesGrid.innerHTML = `
      <div class="no-favorites-message">
        <div class="no-favorites-icon">⭐</div>
        <h3>No favorites yet</h3>
        <p>Click the ⭐ button on any Pokémon to add it to your favorites!</p>
      </div>
    `;
  }

  showFavoritesGrid(pokemonList) {
    this.favoritesGrid.innerHTML = pokemonList.map(pokemon => `
      <div class="favorite-card-premium" data-id="${pokemon.id}">
        <button class="remove-favorite-btn" aria-label="Remove ${pokemon.name} from favorites" data-id="${pokemon.id}">
          ✕
        </button>
        <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy" width="200" height="200">
        <h3>${pokemon.name}</h3>
        <div class="types">
          ${pokemon.types.map(type => `
            <span class="type-badge-premium type-${type.toLowerCase()}-premium">${type}</span>
          `).join('')}
        </div>
        <p class="stats">#${String(pokemon.id).padStart(3, '0')}</p>
      </div>
    `).join('');

    this.favoritesGrid.querySelectorAll('.remove-favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFavorite(btn.dataset.id);
      });
    });

    this.favoritesGrid.querySelectorAll('.favorite-card-premium').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        this.pokedexApp.loadPokemonById(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  removeFavorite(pokemonId) {
    const favorites = Storage.getFavorites();
    const updatedFavorites = favorites.filter(id => id !== parseInt(pokemonId));
    localStorage.setItem('pokemonFavorites', JSON.stringify(updatedFavorites));
    
    if (this.pokedexApp.currentPokemon?.id == pokemonId) {
      this.pokedexApp.updateFavoriteButton(pokemonId);
    }
    
    this.renderFavorites();
    console.log(`✅ Removed favorite #${pokemonId}`);
  }

  clearAllFavorites() {
    localStorage.setItem('pokemonFavorites', JSON.stringify([]));
    
    if (this.pokedexApp.currentPokemon) {
      this.pokedexApp.updateFavoriteButton(this.pokedexApp.currentPokemon.id);
    }
    
    this.renderFavorites();
    console.log('🗑️ All favorites cleared');
  }
}

// 🚀 INICIALIZACIÓN
export async function initPokedex() {
  console.log('Initializing Premium Pokédex...');
  const app = new PokedexPremiumApp();
  console.log('✅ Premium Pokédex initialized successfully');
}

if (document.getElementById('pokemon-main-display')) {
  document.addEventListener('DOMContentLoaded', initPokedex);
}

export default { initPokedex };