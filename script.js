const apikey = 'a807ec776932b205093690dd34e710f6';
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?&units=metric&q=";

const searchBox = document.querySelector('.search input');
const searchBtn = document.querySelector('.search button');
const weatherIcon = document.querySelector('.weather-icon');

function getWeatherIcon(main) {
    if (main == 'Clouds') return 'images/clouds.png';
    else if (main == 'Clear') return 'images/clear.png';
    else if (main == 'Rain') return 'images/rain.png';
    else if (main == 'Drizzle') return 'images/drizzle.png';
    else if (main == 'Mist') return 'images/mist.png';
    return 'images/rain.png';
}

async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apikey}`);
    if (response.status == 404) {
        document.querySelector('.error').style.display = 'block';
        document.querySelector('.weather').style.display = 'none';
        document.querySelector('.forecast').style.display = 'none';
    } else {
        var data = await response.json();

        document.querySelector('.city').innerHTML = data.name;
        document.querySelector('.temp').innerHTML = Math.round(data.main.temp) + '°C';
        document.querySelector('.humidity').innerHTML = data.main.humidity + '%';
        document.querySelector('.wind').innerHTML = data.wind.speed + ' km/h';

        weatherIcon.src = getWeatherIcon(data.weather[0].main);

        document.querySelector('.weather').style.display = 'block';
        document.querySelector('.error').style.display = 'none';

        // Fetch 7-day forecast
        await getForecast(city);
    }
}

async function getForecast(city) {
    const response = await fetch(forecastUrl + city + `&appid=${apikey}`);
    const data = await response.json();

    // Get daily forecasts (one per day at noon)
    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        // Take forecast closest to noon for each day
        const hour = date.getHours();
        if (!dailyForecasts[day] || Math.abs(hour - 12) < Math.abs(new Date(dailyForecasts[day].dt * 1000).getHours() - 12)) {
            dailyForecasts[day] = item;
        }
    });

    // Display first 7 days
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    let dayCount = 0;
    const daysKeys = Object.keys(dailyForecasts);

    while (dayCount < 7) {  // Ensure 7 days
        const day = daysKeys[dayCount] || daysKeys[daysKeys.length - 1]; // repeat last day if less
        const forecast = dailyForecasts[day];
        const temp = Math.round(forecast.main.temp);
        const weather = forecast.weather[0].main;
        const icon = getWeatherIcon(weather);

        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-card";
        forecastCard.innerHTML = `
    <p class="day">${day}</p>
    <img src="${icon}" alt="${weather}">
    <p class="forecast-temp">${temp}°C</p>
    <p class="forecast-weather">${weather}</p>
  `;

        forecastContainer.appendChild(forecastCard);
        dayCount++;
    }

    document.querySelector('.forecast').style.display = 'block';
}

searchBtn.addEventListener('click', () => {
    checkWeather(searchBox.value);
});

// Load London by default on page load
document.addEventListener('DOMContentLoaded', () => {

    searchBox.value = '';
});