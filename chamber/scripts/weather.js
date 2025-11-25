// scripts/weather.js - OpenWeatherMap Current Weather API Integration
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
      
      // Fetch current weather using city name
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&units=${UNITS}&lang=${LANG}&appid=${API_KEY}`
      );
      
      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status} ${currentResponse.statusText}`);
      }
      
      const currentData = await currentResponse.json();
      
      // For 3-day forecast, we'll use the same current data and create a simple forecast
      // since the free tier doesn't include detailed forecast
      displayCurrentWeather(currentData);
      displaySimpleForecast(currentData);
      
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
    const visibility = data.visibility / 1000; // Convert to km
    
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
  
  function displaySimpleForecast(currentData) {
    // Create a simple 3-day forecast based on current conditions
    // This is a simulation since free API doesn't include detailed forecast
    const baseTemp = Math.round(currentData.main.temp);
    const baseDescription = currentData.weather[0].description;
    
    const forecastDays = [];
    const today = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      // Simulate temperature variations (±3 degrees)
      const tempVariation = Math.round((Math.random() * 6) - 3);
      const forecastTemp = baseTemp + tempVariation;
      
      // Simulate different weather conditions
      const conditions = [
        'soleado', 'parcialmente nublado', 'nublado', 
        'lluvia ligera', 'despejado'
      ];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      forecastDays.push({
        date: forecastDate,
        temp: forecastTemp,
        condition: randomCondition
      });
    }
    
    weatherForecastEl.innerHTML = `
      <div class="forecast-days">
        ${forecastDays.map(day => `
          <div class="forecast-day">
            <span class="forecast-date">${formatForecastDate(day.date)}</span>
            <span class="forecast-temp">${day.temp}°C</span>
            <span class="forecast-condition">${day.condition}</span>
          </div>
        `).join('')}
      </div>
      <div class="forecast-note">
        <small>* Pronóstico simulado basado en condiciones actuales</small>
      </div>
    `;
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
  
  // Fallback demo data in case API fails
  function loadDemoWeather() {
    console.log('Using demo weather data as fallback');
    
    const currentDate = new Date();
    
    // Demo current weather
    currentWeatherEl.innerHTML = `
      <div class="weather-main">
        <div class="weather-temp">22°C</div>
        <div class="weather-desc">parcialmente nublado</div>
        <div class="weather-location">📍 Arequipa, PE</div>
      </div>
      <div class="weather-details">
        <div class="weather-detail">
          <span class="label">Sensación</span>
          <span class="value">21°C</span>
        </div>
        <div class="weather-detail">
          <span class="label">Humedad</span>
          <span class="value">45%</span>
        </div>
        <div class="weather-detail">
          <span class="label">Viento</span>
          <span class="value">3.2 m/s</span>
        </div>
        <div class="weather-detail">
          <span class="label">Presión</span>
          <span class="value">1015 hPa</span>
        </div>
        <div class="weather-detail">
          <span class="label">Visibilidad</span>
          <span class="value">10 km</span>
        </div>
        <div class="weather-detail">
          <span class="label">Mínima</span>
          <span class="value">18°C</span>
        </div>
        <div class="weather-detail">
          <span class="label">Máxima</span>
          <span class="value">25°C</span>
        </div>
      </div>
    `;
    
    // Demo 3-day forecast
    const demoForecast = [];
    for (let i = 1; i <= 3; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      demoForecast.push({
        date: date,
        temp: 20 + Math.floor(Math.random() * 5),
        condition: ['soleado', 'parcialmente nublado', 'nublado'][i % 3]
      });
    }
    
    weatherForecastEl.innerHTML = `
      <div class="forecast-days">
        ${demoForecast.map(day => `
          <div class="forecast-day">
            <span class="forecast-date">${formatForecastDate(day.date)}</span>
            <span class="forecast-temp">${day.temp}°C</span>
            <span class="forecast-condition">${day.condition}</span>
          </div>
        `).join('')}
      </div>
      <div class="forecast-note">
        <small>* Datos de demostración</small>
      </div>
    `;
  }
  
  // Initialize weather when DOM is loaded
  function initWeather() {
    if (API_KEY && API_KEY !== '4161701363130adfe0d53c363fcc9d47') {
      fetchWeatherData().catch(error => {
        console.error('Weather API failed, using demo data:', error);
        loadDemoWeather();
      });
    } else {
      fetchWeatherData().catch(error => {
        console.error('Weather API failed, using demo data:', error);
        loadDemoWeather();
      });
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeather);
  } else {
    initWeather();
  }
})();