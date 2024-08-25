const weather_element = document.getElementById("weather");
const temperature_main_element = document.getElementById("temperature-main");
const weather_des_element = document.getElementById("weather-description");
const weather_icon_element = document.getElementById("icon");
const temperature_element = document.getElementById("temperature");
const humidity_element = document.getElementById("humidity");
const wind_speed_element = document.getElementById("wind-speed");
const country_element = document.getElementById("country");
const town_element = document.getElementById("town");
const city_element = document.getElementById("city");
const form = document.getElementById("form");
const image_element = document.getElementById("image-main");
const forecast_element = document.getElementById("forecast");
const dropdown = document.getElementById("dropdown");
const recentCitiesList = document.getElementById("recent-cities");
const location_btn = document.getElementById("location");

const apikey = "8f8db628d39d5e39346fd493a8602ddf";

// event listner for form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = city_element.value.trim();
  if (city) {
    fetchWeatherData(city);
    fetchForecastData(city);
  }
});

// fetching weather data for user
const fetchWeatherData = (city) => {
  const apiurl = `https://api.openweathermap.org/data/2.5/weather?&appid=${apikey}&q=${city}&units=metric`;

  fetch(apiurl)
    .then((res) => {
      if (!res.ok) {
        throw new Error("city not found");
      }
      return res.json();
    })
    .then((data) => {
      displayWeatherData(data);
      saveRecentCity(city);
    })
    .catch((err) => {
      alert(err.message);
    });
};

//fetching forecast data of 5days
const fetchForecastData = (city) => {
  const apiurl = `https://api.openweathermap.org/data/2.5/forecast?&appid=${apikey}&q=${city}&units=metric`;

  fetch(apiurl)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Forcast data is not available");
      }
      return res.json();
    })
    .then((data) => {
      displayForecastData(data);
    })
    .catch((err) => {
      alert(err.message);
    });
};

// extracting necessary data from fetched obj and puting it in its place in html
const displayWeatherData = (data) => {
  const weather = data.weather[0].main;
  const weather_des = data.weather[0].description;
  const weather_icon = data.weather[0].icon;
  const temperature = data.main.temp;
  const humidity = data.main.humidity;
  const wind_speed = data.wind.speed;
  const country = data.sys.country;
  const town = data.name;

  weather_element.innerText = weather;
  country_element.innerText = country;
  town_element.innerText = town;
  weather_des_element.innerText = weather_des;
  temperature_main_element.innerText = `${temperature}°C`;
  humidity_element.innerText = `${humidity}%`;
  wind_speed_element.innerText = `${wind_speed}m/s`;
  temperature_element.innerText = `${temperature}°C`;
  weather_icon_element.src = `https://openweathermap.org/img/wn/${weather_icon}@2x.png`;
  image_element.src = `https://openweathermap.org/img/wn/${weather_icon}@2x.png`;
};

// extracting necessary data from fetched obj and puting it in its place in html
const displayForecastData = (data) => {
  forecast_element.innerHTML = "";
  console.log(data);
  const dailyData = [];

  // Filter data to get forecast at the same time each day
  data.list.forEach((item) => {
    const date = new Date(item.dt_txt);
    console.log(date.getHours());
    if (date.getHours() === 12) {
      // Get data at noon for each day
      dailyData.push(item);
    }
  });

  // Display forecast
  dailyData.forEach((day) => {
    const date = new Date(day.dt_txt).toDateString();
    const weather = day.weather[0].main;
    const weather_icon = day.weather[0].icon;
    const temperature = day.main.temp;

    const dayElement = document.createElement("div");
    dayElement.className =
      "flex flex-col justify-center item-center p-6 bg-white/20 rounded-xl backdrop-blur-sm text-blue-600 shadow-lg ease-in-out duration-500 hover:scale-[105%]";

    dayElement.innerHTML = `
          <p class="font-semibold text-2xl">${date}</p>
          <img src="https://openweathermap.org/img/wn/${weather_icon}@2x.png" class="w-20 h-20" alt="Weather icon" />
          <p class="text-xl font-bold">${temperature}°C</p>
          <p>${weather}</p>
        `;

    forecast_element.appendChild(dayElement);
  });
};

//saving seached city in local storage
const saveRecentCity = (city) => {
  let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (!recentCities.includes(city)) {
    recentCities.unshift(city); // Add city to the beginning of the array
    if (recentCities.length > 5) {
      recentCities.pop(); // Keep only the last 5 cities
    }
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
  }
  updateDropdown(recentCities);
};

// handling visibility of dropdown
city_element.addEventListener("click", (e) => {
  let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (recentCities.length) {
    // Show or hide the dropdown
    dropdown.classList.toggle("hidden");
    updateDropdown(recentCities);
  }
});

//updateing dropdown
const updateDropdown = (recentCities) => {
  recentCitiesList.innerHTML = "";

  if (recentCities.length > 0) {
    // dropdown.classList.remove("hidden");
    recentCities.forEach((city) => {
      const li = document.createElement("li");
      li.textContent = city;
      li.className =
        "cursor-pointer bg-white/20 hover:scale-[105%] duration-500 ease-in-out  w-full text-white text-center";
      li.addEventListener("click", () => {
        city_element.value = city;
        fetchWeatherData(city);
        fetchForecastData(city);
        dropdown.classList.add("hidden"); // Hide dropdown after selecting a city
      });

      recentCitiesList.appendChild(li);
    });
  } else {
    dropdown.classList.add("hidden");
  }
};

//for current location
document.getElementById("location").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      getWeatherByLocation,
      handleLocationError
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

const getWeatherByLocation = (position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;
  const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;

  // Fetch the weather data using latitude and longitude
  fetch(weatherApiUrl)
    .then((res) => res.json())
    .then((data) => {
      displayWeatherData(data);
      saveRecentCity(data.name);
    })
    .catch((err) => alert("Unable to retrieve weather data"));

  // Fetch the forecast data using latitude and longitude
  fetch(forecastApiUrl)
    .then((res) => res.json())
    .then((data) => displayForecastData(data))
    .catch((err) => alert("Unable to retrieve forecast data"));
};

const handleLocationError = (error) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
};
