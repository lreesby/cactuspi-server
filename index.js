const fs = require('fs');
const request = require('request');
const PubNub = require('pubnub');
const express = require('express');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);
const { weather, pubnub } = config;

const pubNub = new PubNub({
  publishKey: pubnub.publishKey,
  subscribeKey: pubnub.subscribeKey,
  secretKey: pubnub.secretKey,
  ssl: true
});

const app = express();

app.get('/weather', function (req, res) {
  getWeather();
});

app.get('/hello', function (req, res) {
  publishMessage('Hello World!', {
    'repeat': false,
    'name': 'hello',
    'duration': 5,
    'priority': true
  });
});

const server = app.listen(8081, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Cactus Pi Server started at http://%s:%s", host, port);
});

function getWeather() {
  const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?zip=${weather.city}&units=${weather.unit}&appid=${weather.openWeatherMapApi}`;

  request(weatherUrl, (err, response, body) => {
    if (err) {
      console.error('weather', err);
      return;
    }

    const result = JSON.parse(body);
    if (result.main === undefined){
      console.error('weather', 'failed to get weather data, please try again.');
      return;
    }

    const TEMP_UNITS = {
      'default': 'K',
      'metric': 'C',
      'imperial': 'F'
    };
    const unit = TEMP_UNITS[weather.unit];
    const temperature = `Now: ${Math.round(result.main.temp)}'${unit}. Today ${Math.round(result.main.temp_min)}'${unit} to ${Math.round(result.main.temp_max)}'${unit}.`;
    const condition = `Forecast: ${result.weather[0].description}. Humidity: ${result.main.humidity}%.`;
    const message = `${result.name} - ${temperature} ${condition}`;
    console.log('weather', message);

    publishMessage(message, {
      'repeat': true,
      'name': 'weather',
      'duration': 60,
      'priority': false
    });
  });
}

function publishMessage(message, meta) {
  pubNub.publish(
    {
      message,
      channel: pubnub.channel,
      sendByPost: false,
      storeInHistory: false,
      meta
    }, (status, response) => {
      if (status.error) {
        console.log('PubNub', status)
      } else {
        console.log('PubNub: Published with timetoken', response.timetoken)
      }
    }
  );
}