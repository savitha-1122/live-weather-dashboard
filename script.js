// Get weather information based on city name

async function getWeather() {

    const city = document.getElementById("cityInput").value.trim();

    const message = document.getElementById("message");

    if (city === "") {
        message.textContent = "Please enter a city name!";
        return;
    }

    message.textContent = "Loading weather...";

    try {

        // Get city coordinates

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to find city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Try another city.");
        }

        const place = geoData.results[0];

        const latitude = place.latitude;
        const longitude = place.longitude;

        // Get weather data

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather data.");
        }

        const data = await weatherResponse.json();

        // Display current weather

        displayWeather(place, data);

        // Display five day forecast

        displayForecast(data);

        message.textContent = "";

    }

    catch (error) {

        message.textContent = error.message;

    }

}


// Convert weather codes into descriptions and icons

function getWeatherInfo(code) {

    if (code === 0) {
        return ["Clear Sky", "☀️"];
    }

    if (code === 1 || code === 2) {
        return ["Partly Cloudy", "🌤️"];
    }

    if (code === 3) {
        return ["Cloudy", "☁️"];
    }

    if (code === 45 || code === 48) {
        return ["Foggy", "🌫️"];
    }

    if (code >= 51 && code <= 67) {
        return ["Drizzle / Rain", "🌧️"];
    }

    if (code >= 71 && code <= 77) {
        return ["Snow", "❄️"];
    }

    if (code >= 80 && code <= 82) {
        return ["Rain Showers", "🌦️"];
    }

    if (code >= 85 && code <= 86) {
        return ["Snow Showers", "🌨️"];
    }

    if (code >= 95) {
        return ["Thunderstorm", "⛈️"];
    }

    return ["Unknown Weather", "🌡️"];

}


// Display current weather

function displayWeather(place, data) {

    const current = data.current;

    const info = getWeatherInfo(current.weather_code);

    document.getElementById("cityName").textContent =
        place.name + ", " + place.country;

    document.getElementById("temperature").textContent =
        Math.round(current.temperature_2m) + "°C";

    document.getElementById("description").textContent =
        info[0];

    document.getElementById("weatherIcon").textContent =
        info[1];

    document.getElementById("humidity").textContent =
        current.relative_humidity_2m + "%";

    document.getElementById("wind").textContent =
        current.wind_speed_10m + " km/h";

    document.getElementById("feelsLike").textContent =
        Math.round(current.apparent_temperature) + "°C";

}


// Display five day forecast

function displayForecast(data) {

    const forecast = document.getElementById("forecast");

    forecast.innerHTML = "";

    const daily = data.daily;

    for (let i = 0; i < daily.time.length; i++) {

        const info = getWeatherInfo(daily.weather_code[i]);

        const date = new Date(daily.time[i] + "T12:00:00");

        const day = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${day}</h3>

            <div class="icon">${info[1]}</div>

            <p>${info[0]}</p>

            <p>Max: ${Math.round(daily.temperature_2m_max[i])}°C</p>

            <p>Min: ${Math.round(daily.temperature_2m_min[i])}°C</p>
        `;

        forecast.appendChild(card);

    }

}


// Search when Enter key is pressed

document.getElementById("cityInput").addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            getWeather();
        }

    }
);