document.addEventListener("DOMContentLoaded", (_event) => {
  alert("After DOM has loaded");

  const searchInput = document.getElementById("autocomplete");
  const suggestionsContainer = document.getElementById("suggestions");
  const resultsList = document.getElementById("results");
  const heartButton = document.getElementById("heartButton");  const loadingSpinner = document.getElementById("loading-spinner");
  
//cheile si URL-urile necesare
  const apiKey = '873a0a75cd954d06b70f8cec2b1b1a5a';
  const apiKeyWeather = '917d9b5f775743d98a0202127241401';
  const currentWeatherURL='http://api.weatherapi.com/v1/current.json';
  const forecastURL='http://api.weatherapi.com/v1/forecast.json';
  //const pexelsAPI='hCJPUxh1kAoav4bf8IUw3yK5csN6Zln6EYFZlvmL2MrOU88aZ41ReiWF';

//afisarea si ascunderea spinner-ului
 function showSpinner() {
  loadingSpinner.classList.add("visible");
}

function hideSpinner() {
  loadingSpinner.classList.remove("visible");
}
  
//functia se foloseste de cheia API si URL-ul corespunzator pentru a lua numele oraselor de pe site si a le aduaga in bara de sugestii, iar inainte de a introduce orice litera se v a afisa lista de favorite
  searchInput.addEventListener("input", function() {
    const value = searchInput.value.trim();

    if (value.length === 0) {
      displayFavorites();
    } else if (value.length >= 3) {
      fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value)}&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          const apiSuggestions = data.features.map(feature => feature.properties.formatted);
          displaySuggestions(apiSuggestions);
        })
        .catch(error => console.error('Error fetching suggestions ', error));
    }
  });

//momentul initial in care se apasa bara de cautare, se afiseaza favoritele
  searchInput.addEventListener("focus", function() {
    displayFavorites();
  });

  //functia pentru sugestii
  function displaySuggestions(suggestions) {
    resultsList.innerHTML = "";

    if (suggestions.length > 0) {
      suggestions.forEach(suggestion => {
        const li = document.createElement("li");
        li.textContent = suggestion;
        li.addEventListener("click", function () {//momentul in care butonul este apasat, parametrul city se incarca cu sugestia orasului selectata si se afiseaza vremea curenta si pe urmatoarele 5 zile
          searchInput.value = suggestion;
          resultsList.innerHTML = "";
          suggestionsContainer.style.display = "none";
        });
        resultsList.appendChild(li);
      });

      suggestionsContainer.style.display = "block";
    } else {
      suggestionsContainer.style.display = "none";
    }
  }

  //afisarea listei de favorite
  function displayFavorites() {
    resultsList.innerHTML = "";

    if (favoriteCities.length > 0) {
      favoriteCities.forEach(favorite => {
        const li = document.createElement('li');
        li.textContent = favorite;
        li.addEventListener('click', function () {
          searchInput.value = favorite;
          resultsList.innerHTML = "";
          suggestionsContainer.style.display = "none";
          addToFavorites(favorite);
        });
        resultsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = "No favorites added";
      resultsList.appendChild(li);
    }

    suggestionsContainer.style.display = "block";
  }

  searchButton.addEventListener("click", async function () {
    const cityName = searchInput.value.trim();
    if (cityName.length === 0) {
      alert('Please enter a city name.');
      return;
    }
    showSpinner();
    getWeatherData(cityName)
        .then(weatherData => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000); 
            });
        })
        .then(() => {
            return getForecastData(cityName);
        })
        .then(forecastData => {
            console.log("Weather data:", weatherData);
            console.log("Forecast data:", forecastData);

            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000); 
            });
        })
        .then(() => {
            hideSpinner();
        })
        .catch(error => {
            console.error("Error fetching data:", error);

            hideSpinner();
        });
  });

  async function getBackgroundImage(city) {
    const pexelsApiKey = 'hCJPUxh1kAoav4bf8IUw3yK5csN6Zln6EYFZlvmL2MrOU88aZ41ReiWF';
  
    try {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(city)}&per_page=1`, {
        headers: {
          Authorization: pexelsApiKey,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching image data. Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.photos && data.photos.length > 0) {
        const imageUrl = data.photos[0].src.large;
        applyBackgroundImage(imageUrl);
        return imageUrl;
      } else {
        console.error('No images found for the city.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching image data:', error);
    } 
  }
  
  function applyBackgroundImage(imageUrl) {
    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;
    imageElement.alt = 'City Photo';

    const containerElement = document.querySelector('.shape-container');
    containerElement.innerHTML = ''; 
    containerElement.appendChild(imageElement);
  }
  
//folosim functia fetch pentru a obtine date dintr-o baza de date ce contine vremea curenta pentru un oras ales de utilizator
  function getWeatherData(city) {

    Promise.all([
      fetch(`${currentWeatherURL}?key=${apiKeyWeather}&q=${city}`)
      .then(response => response.json()),
      getBackgroundImage(city),
    ])
      .then(([weatherData, backgroundImage]) => {
        const weatherIcon = weatherData.current.condition.icon;
        const temperature = weatherData.current.temp_c;
        const cityName = weatherData.location.name;
        const humidity = weatherData.current.humidity;
        const windSpeed = weatherData.current.wind_kph;
  
        upWeatherUI(weatherIcon, temperature, cityName, humidity, windSpeed);
  
        if (backgroundImage) {
          document.body.style.backgroundImage = `url('${backgroundImage}')`;
        }
      })
        .catch(error => console.error('Error fetching weather data:', error))
        return new Promise(resolve => {
          setTimeout(() => {
              resolve();
          }, 2000); 
      });
}

//incarca parametrii alesi cu valorile din baza de date
  function upWeatherUI(icon, temperature, city, humidity, windSpeed) {
    const weatherIconElement = document.querySelector('.weather-icon');
    const temperatureElement = document.querySelector('.temp');
    const cityNameElement = document.querySelector('.city');
    const humidityElement = document.querySelector('.humidity');
    const windSpeedElement = document.querySelector('.wind');

    weatherIconElement.src = icon;
    temperatureElement.textContent = `${temperature}°C`;
    cityNameElement.textContent = city;
    humidityElement.textContent = `Humidity: ${humidity}%`;
    windSpeedElement.textContent = `Wind: ${windSpeed}km/h`;
}

function getForecastData(city) {
  const forecastUrl = `${forecastURL}?key=${apiKeyWeather}&q=${city}&days=5`;

  fetch(forecastUrl)
      .then(response => response.json())
      .then(data => {
          const forecastDays = data.forecast.forecastday;
          updateForecastUI(forecastDays);
      })
      .catch(error => console.error('Error fetching forecast data:', error))
      
}


function updateForecastUI(forecastDays) {
  const forecastCards = document.querySelectorAll('.day-card');

  forecastDays.forEach((day, index) => {
      const temperatureElement = forecastCards[index].querySelector('h6:nth-child(1)');
      const humidityElement = forecastCards[index].querySelector('h6:nth-child(2)');
      const windSpeedElement = forecastCards[index].querySelector('h6:nth-child(3)');

      temperatureElement.textContent = `Temperature: ${day.day.avgtemp_c}°C`;
      humidityElement.textContent = `Humidity: ${day.day.avghumidity}%`;
      windSpeedElement.textContent = `Wind speed: ${day.day.maxwind_kph} km/h`;
  });
}


document.addEventListener("click", function (event) {
  if (!event.target.closest(".search")) {
    suggestionsContainer.style.display = "none";
  }
});

const sampleSuggestions = ["London", "New York", "Paris", "Tokyo", "Sydney"];


function addCity() {
  const cityName = document.getElementById('autocomplete').value;

  if (cityName.trim() === '') {
    alert('Please enter a city name.');
    return;
  }

  const cityList = document.getElementById('cityList');
  const listItem = document.createElement('li');
  listItem.className = 'cityItem';

  const heartButton = document.createElement('span');
  heartButton.className = 'heartButton';
  heartButton.innerHTML = '&#10084;';
  heartButton.onclick = function() {
    addToFavorites(cityName);
  };

  listItem.innerHTML = cityName;
  listItem.appendChild(heartButton);

  cityList.appendChild(listItem);

  document.getElementById('autocomplete').value = '';
}

const favoriteCities = [];

//Apdatarea listei cu orase favorite
function updateFavoriteCitiesList() {
    cityList.innerHTML = "";
    favoriteCities.forEach(city => {
      const listItem = document.createElement('li');
      listItem.textContent = city;
      cityList.appendChild(listItem);
    });
  }

  //functia pentru a adauga orasele la favorit
  async function addToFavorites(cityName) {
    if (!favoriteCities.includes(cityName)) {
      favoriteCities.push(cityName);
      alert('Added to favorites: ' + cityName);
      updateFavoriteCitiesList();
      await getWeatherData(cityName);
    } else {
      alert('City already in favorites: ' + cityName);
    }
  }

  //adaugarea orasului curent la favorite
  heartButton.addEventListener("click", function () {
    const cityName = searchInput.value.trim();
    if (cityName.length === 0) {
      alert('Please enter a city name.');
      return;
    }
    addToFavorites(cityName);
  });


});