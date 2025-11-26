// scripts/weather.js - OpenWeatherMap API Integration
// ⚠️ ADVERTENCIA: API key expuesta en código cliente
// RIESGO: Uso no autorizado, costos inesperados
// SOLUCIÓN PRODUCCIÓN: Usar proxy server o serverless function
// FALLBACK: Datos demo si la key falla

(function() {
  'use strict';
  
  // API KEY RESTAURADA - En producción, usar variable de entorno
  const API_KEY = '4161701363130adfe0d53c363fcc9d47'; // ⚠️ REVOCAR DESPUÉS DE EVALUACIÓN
  const CITY = 'Arequipa';
  const COUNTRY = 'PE';
  const UNITS = 'metric';
  const LANG = 'es';
  
  const currentWeatherEl = document.getElementById('current-weather');
  const weatherForecastEl = document.getElementById('weather-forecast');
  
  if (!currentWeatherEl || !weatherForecastEl) {
    console.warn('Weather elements not found');
    return;
  }
  
  async function fetchWeatherData() {
    try {
      currentWeatherEl.innerHTML = '<div class="loading-weather">Cargando clima actual...</div>';
      weatherForecastEl.innerHTML = '<div class="loading-weather">Cargando pronóstico...</div>';
      
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&units=${UNITS}&lang=${LANG}&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY},${COUNTRY}&units=${UNITS}&lang=${LANG}&appid=${API_KEY}`)
      ]);
      
      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error(`API error: ${currentResponse.status} / ${forecastResponse.status}`);
      }
      
      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();
      
      displayCurrentWeather(currentData);
      displayRealForecast(forecastData);
      
    } catch (error) {
      console.error('Weather API failed, using demo data:', error);
      useDemoWeatherData();
    }
  }
  
  function useDemoWeatherData() {
    const demoCurrent = {
      main: { temp: 22, feels_like: 21, temp_min: 18, temp_max: 25, humidity: 45, pressure: 1013 },
      weather: [{ description: 'cielo claro' }],
      wind: { speed: 2.5 },
      visibility: 10000,
      name: 'Arequipa',
      sys: { country: 'PE' }
    };
    
    const demoForecast = {
      list: Array.from({length: 10}, (_, i) => ({
        dt: Date.now() / 1000 + (i * 86400),
        main: { temp: 20 + Math.random() * 5 },
        weather: [{ description: 'cielo parcialmente nublado' }]
      }))
    };
    
    displayCurrentWeather(demoCurrent);
    displayRealForecast(demoForecast);
    
    const demoIndicator = document.createElement('div');
    demoIndicator.textContent = 'Modo demo: datos de clima de muestra';
    demoIndicator.className = 'weather-error';
    demoIndicator.style.fontSize = '0.75rem';
    demoIndicator.style.marginTop = '0.5rem';
    currentWeatherEl.appendChild(demoIndicator);
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
  
  function getThreeDayForecast(forecastList) {
    const dailyForecasts = [];
    const processedDays = new Set();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const forecast of forecastList) {
      const forecastDate = new Date(forecast.dt * 1000);
      const dayKey = forecastDate.toDateString();
      
      if (forecastDate <= today || processedDays.has(dayKey)) {
        continue;
      }
      
      if (forecastDate.getHours() >= 10 && forecastDate.getHours() <= 14) {
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
  
  function displayRealForecast(forecastData) {
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
  
  function initWeather() {
    fetchWeatherData().catch(error => {
      console.error('Weather initialization failed:', error);
      useDemoWeatherData();
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeather);
  } else {
    initWeather();
  }
})();