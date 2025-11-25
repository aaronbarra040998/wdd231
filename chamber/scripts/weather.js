// scripts/weather.js - OpenWeatherMap Current Weather and Forecast API Integration
(function() {
  'use strict';
  
  // API configuration
  const API_KEY = '4161701363130adfe0d53c363fcc9d47';
  const CITY = 'Arequipa';
  const COUNTRY = 'PE';
  const UNITS = 'metric';
  const LANG = 'es';
  
  const currentWeatherEl = document.getElementById('current-weather');
  const weatherForecastEl = document.getElementById('weather-forecast');
  
  async function fetchWeatherData() {
    try {
      // Show loading state
      currentWeatherEl.innerHTML = '<div class="loading-weather">Cargando clima actual...</div>';
      weatherForecastEl.innerHTML = '<div class="loading-weather">Cargando pronóstico...</div>';
      
      // Fetch current weather and 5-day forecast in parallel
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&units=${UNITS}&lang=${LANG}&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY},${COUNTRY}&units=${UNITS}&lang=${LANG}&appid=${API_KEY}`)
      ]);
      
      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error(`API error: ${currentResponse.status} ${forecastResponse.status}`);
      }
      
      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();
      
      displayCurrentWeather(currentData);
      displayRealForecast(forecastData);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      showWeatherError('No se pudo cargar la información del clima. Por favor, intente nuevamente.');
    }
  }
  
  function displayCurrentWeather(data) {
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const feelsLike = Math.round(data.main.feels_like);
    const pressure = data.main.pressure;
    const visibility = data.visibility / 1000;
    
    currentWeatherEl.innerHTML = `
      <div class="weather-main">
        <div class="weather-temp">${temp}°C</div>
        <div class="weather-desc">${description}</div>
        <div class="weather-location">📍 ${data.name}, ${data.sys.country}</div>
      </div>
      <div class="weather-details">
        <div class="weather-detail">
          <span class="label">Sensación</span>
          <span class="value">${feelsLike}°C</span>
        </div>
        <div class="weather-detail">
          <span class="label">Humedad</span>
          <span class="value">${humidity}%</span>
        </div>
        <div class="weather-detail">
          <span class="label">Viento</span>
          <span class="value">${windSpeed} m/s</span>
        </div>
        <div class="weather-detail">
          <span class="label">Presión</span>
          <span class="value">${pressure} hPa</span>
        </div>
        ${visibility ? `
        <div class="weather-detail">
          <span class="label">Visibilidad</span>
          <span class="value">${visibility} km</span>
        </div>
        ` : ''}
        <div class="weather-detail">
          <span class="label">Mínima</span>
          <span class="value">${Math.round(data.main.temp_min)}°C</span>
        </div>
        <div class="weather-detail">
          <span class="label">Máxima</span>
          <span class="value">${Math.round(data.main.temp_max)}°C</span>
        </div>
      </div>
    `;
  }
  
  function displayRealForecast(forecastData) {
    // Process 5-day forecast data to get 3-day forecast
    const dailyForecasts = getThreeDayForecast(forecastData.list);
    
    if (dailyForecasts.length === 0) {
      weatherForecastEl.innerHTML = `
        <div class="weather-error">
          No se pudo cargar el pronóstico extendido
        </div>
      `;
      return;
    }
    
    weatherForecastEl.innerHTML = `
      <div class="forecast-days">
        ${dailyForecasts.map(day => `
          <div class="forecast-day">
            <span class="forecast-date">${formatForecastDate(day.date)}</span>
            <span class="forecast-temp">${day.temp}°C</span>
            <span class="forecast-condition">${day.condition}</span>
          </div>
        `).join('')}
      </div>
      <div class="forecast-note">
        <small>* Pronóstico oficial de OpenWeatherMap</small>
      </div>
    `;
  }
  
  function getThreeDayForecast(forecastList) {
    const dailyForecasts = [];
    const processedDays = new Set();
    
    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const forecast of forecastList) {
      const forecastDate = new Date(forecast.dt * 1000);
      const dayKey = forecastDate.toDateString();
      
      // Skip today and already processed days
      if (forecastDate <= today || processedDays.has(dayKey)) {
        continue;
      }
      
      // We want forecasts around midday for representative temperatures
      if (forecastDate.getHours() >= 10 && forecastDate.getHours() <= 14) {
        dailyForecasts.push({
          date: forecastDate,
          temp: Math.round(forecast.main.temp),
          condition: forecast.weather[0].description
        });
        
        processedDays.add(dayKey);
        
        // Stop when we have 3 days
        if (dailyForecasts.length >= 3) {
          break;
        }
      }
    }
    
    // If we don't have 3 midday forecasts, take the first available for each day
    if (dailyForecasts.length < 3) {
      processedDays.clear();
      dailyForecasts.length = 0;
      
      for (const forecast of forecastList) {
        const forecastDate = new Date(forecast.dt * 1000);
        const dayKey = forecastDate.toDateString();
        
        if (forecastDate <= today || processedDays.has(dayKey)) {
          continue;
        }
        
        dailyForecasts.push({
          date: forecastDate,
          temp: Math.round(forecast.main.temp),
          condition: forecast.weather[0].description
        });
        
        processedDays.add(dayKey);
        
        if (dailyForecasts.length >= 3) {
          break;
        }
      }
    }
    
    return dailyForecasts;
  }
  
  function formatForecastDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      const options = { weekday: 'long', day: 'numeric' };
      return date.toLocaleDateString('es-ES', options);
    }
  }
  
  function showWeatherError(message) {
    currentWeatherEl.innerHTML = `<div class="weather-error">${message}</div>`;
    weatherForecastEl.innerHTML = `<div class="weather-error">${message}</div>`;
  }
  
  // Initialize weather when DOM is loaded
  function initWeather() {
    fetchWeatherData().catch(error => {
      console.error('Weather API failed:', error);
      // Don't load demo data - show error instead for transparency
      showWeatherError('Servicio de clima temporalmente no disponible');
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeather);
  } else {
    initWeather();
  }
})();