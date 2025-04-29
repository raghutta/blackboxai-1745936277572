const clockElement = document.getElementById('clock');
const dateElement = document.getElementById('date');
const greetingElement = document.getElementById('greeting');
const weatherElement = document.getElementById('weather');
const loadingElement = document.getElementById('loading');

const toggleFormatBtn = document.getElementById('toggleFormat');
const pauseResumeBtn = document.getElementById('pauseResume');
const nextWallpaperBtn = document.getElementById('nextWallpaper');
const toggleDarkModeBtn = document.getElementById('toggleDarkMode');

const backgroundElement = document.getElementById('background');

let use24Hour = true;
let wallpaperPaused = false;
let wallpapers = [
  'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1920&w=1080',
  'https://images.pexels.com/photos/34950/pexels-photo.jpg?auto=compress&cs=tinysrgb&dpr=2&h=1920&w=1080',
  'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1920&w=1080',
  'https://images.pexels.com/photos/110854/pexels-photo-110854.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1920&w=1080',
  'https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1920&w=1080'
];
let currentWallpaperIndex = 0;
let wallpaperInterval = null;

function formatTimeUnit(unit) {
  return unit < 10 ? '0' + unit : unit;
}

function updateTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  let ampm = '';
  let displayHours = hours;
  if (!use24Hour) {
    ampm = hours >= 12 ? ' PM' : ' AM';
    displayHours = hours % 12;
    displayHours = displayHours ? displayHours : 12;
  }

  const timeString = formatTimeUnit(displayHours) + ':' + formatTimeUnit(minutes) + ':' + formatTimeUnit(seconds) + ampm;
  clockElement.textContent = timeString;
  clockElement.setAttribute('aria-label', 'Current time ' + timeString);

  const dateString = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  dateElement.textContent = dateString;
  dateElement.setAttribute('aria-label', 'Current date ' + dateString);

  updateGreeting(hours);
}

function updateGreeting(hours) {
  let greeting = 'Hello!';
  // Use 24-hour format hours for greeting logic
  if (hours >= 5 && hours < 12) {
    greeting = 'Good Morning!';
  } else if (hours >= 12 && hours < 17) {
    greeting = 'Good Afternoon!';
  } else if (hours >= 17 && hours < 21) {
    greeting = 'Good Evening!';
  } else {
    greeting = 'Good Night!';
  }
  greetingElement.textContent = greeting;
  greetingElement.setAttribute('aria-label', 'Greeting message ' + greeting);
}

// Fetch weather info using Open-Meteo free API
async function fetchWeather() {
  if (!navigator.geolocation) {
    weatherElement.innerHTML = '<p>Geolocation not supported.</p>';
    return;
  }

  function getPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  try {
    const position = await getPosition();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Open-Meteo API URL for current weather
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true';

    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather fetch failed');
    const data = await response.json();

    const currentWeather = data.current_weather;
    if (!currentWeather) throw new Error('No current weather data');

    const tempC = currentWeather.temperature;
    const weatherCode = currentWeather.weathercode;

    // Map weather codes to descriptions and icons (simplified)
    const weatherMap = {
      0: { desc: 'Clear sky', icon: '☀️' },
      1: { desc: 'Mainly clear', icon: '🌤️' },
      2: { desc: 'Partly cloudy', icon: '⛅' },
      3: { desc: 'Overcast', icon: '☁️' },
      45: { desc: 'Fog', icon: '🌫️' },
      48: { desc: 'Depositing rime fog', icon: '🌫️' },
      51: { desc: 'Light drizzle', icon: '🌦️' },
      53: { desc: 'Moderate drizzle', icon: '🌦️' },
      55: { desc: 'Dense drizzle', icon: '🌧️' },
      56: { desc: 'Light freezing drizzle', icon: '🌧️' },
      57: { desc: 'Dense freezing drizzle', icon: '🌧️' },
      61: { desc: 'Slight rain', icon: '🌧️' },
      63: { desc: 'Moderate rain', icon: '🌧️' },
      65: { desc: 'Heavy rain', icon: '🌧️' },
      66: { desc: 'Light freezing rain', icon: '🌧️' },
      67: { desc: 'Heavy freezing rain', icon: '🌧️' },
      71: { desc: 'Slight snow fall', icon: '🌨️' },
      73: { desc: 'Moderate snow fall', icon: '🌨️' },
      75: { desc: 'Heavy snow fall', icon: '🌨️' },
      77: { desc: 'Snow grains', icon: '🌨️' },
      80: { desc: 'Slight rain showers', icon: '🌦️' },
      81: { desc: 'Moderate rain showers', icon: '🌦️' },
      82: { desc: 'Violent rain showers', icon: '🌧️' },
      85: { desc: 'Slight snow showers', icon: '🌨️' },
      86: { desc: 'Heavy snow showers', icon: '🌨️' },
      95: { desc: 'Thunderstorm', icon: '⛈️' },
      96: { desc: 'Thunderstorm with slight hail', icon: '⛈️' },
      99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' }
    };

    const weatherInfo = weatherMap[weatherCode] || { desc: 'Unknown', icon: '❓' };

    weatherElement.innerHTML = '<div class="flex items-center justify-center gap-2 text-3xl" aria-hidden="true">' + weatherInfo.icon + '</div>' +
      '<div class="text-center">' +
      '<p class="text-xl font-semibold">' + tempC + '°C</p>' +
      '<p class="capitalize">' + weatherInfo.desc + '</p>' +
      '</div>';
    weatherElement.setAttribute('aria-label', 'Current weather: ' + tempC + ' degrees Celsius, ' + weatherInfo.desc);
  } catch (error) {
    weatherElement.innerHTML = '<p>Unable to fetch weather.</p>';
  }
}

function setWallpaper(index) {
  if (wallpapers.length === 0) return;
  currentWallpaperIndex = index % wallpapers.length;
  backgroundElement.style.backgroundImage = "url('" + wallpapers[currentWallpaperIndex] + "')";
  backgroundElement.classList.add('fade-in');
  setTimeout(() => {
    backgroundElement.classList.remove('fade-in');
  }, 1500);
}

function startWallpaperCycle() {
  wallpaperInterval = setInterval(() => {
    if (!wallpaperPaused) {
      currentWallpaperIndex = (currentWallpaperIndex + 1) % wallpapers.length;
      setWallpaper(currentWallpaperIndex);
    }
  }, 15000);
}

function toggleWallpaperPause() {
  wallpaperPaused = !wallpaperPaused;
  pauseResumeBtn.textContent = wallpaperPaused ? 'Resume Wallpapers' : 'Pause Wallpapers';
  pauseResumeBtn.setAttribute('aria-pressed', wallpaperPaused.toString());
}

function nextWallpaper() {
  currentWallpaperIndex = (currentWallpaperIndex + 1) % wallpapers.length;
  setWallpaper(currentWallpaperIndex);
}

function toggleTimeFormat() {
  use24Hour = !use24Hour;
  toggleFormatBtn.setAttribute('aria-pressed', (!use24Hour).toString());
  updateTime();
}

function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle('bg-gray-900');
  if (isDark) {
    body.classList.remove('bg-white', 'text-gray-900');
    body.classList.add('bg-gray-900', 'text-white');
    toggleDarkModeBtn.setAttribute('aria-pressed', 'true');
  } else {
    body.classList.remove('bg-gray-900', 'text-white');
    body.classList.add('bg-white', 'text-gray-900');
    toggleDarkModeBtn.setAttribute('aria-pressed', 'false');
  }
}

async function init() {
  setWallpaper(currentWallpaperIndex);
  startWallpaperCycle();

  updateTime();
  setInterval(updateTime, 1000);

  fetchWeather();

  toggleFormatBtn.addEventListener('click', toggleTimeFormat);
  pauseResumeBtn.addEventListener('click', toggleWallpaperPause);
  nextWallpaperBtn.addEventListener('click', nextWallpaper);
  toggleDarkModeBtn.addEventListener('click', toggleDarkMode);
}

init();
