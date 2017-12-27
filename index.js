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

app.get('/weather', (req, res) => {
  res.send('getting weather...');
  getWeather();
});

app.get('/hello', (req, res) => {
  res.send('hello...');
  publishMessage('Hello World!', {
    'repeat': false,
    'name': 'hello',
    'duration': 5,
    'priority': true
  });
});

app.get('/message/:message', (req, res) => {
  const message = req.params.message;
  res.send(`displaying "${message}"...`);
  publishMessage(message, {
    'repeat': req.param('repeat') || false,
    'name': req.param('name') || 'message',
    'duration': req.param('duration') || 10,
    'priority': req.param('message') || true
  });
});

app.get('/clear', (req, res) => {
  res.send('clearing all messages...');
  publishMessage('clear', {
    'command': 'clear'
  });
});

app.get('/stop', (req, res) => {
  res.send('stopping...');
  publishMessage('stop', {
    'command': 'stop'
  });
});

app.get('/start', (req, res) => {
  res.send('starting...');
  publishMessage('start', {
    'command': 'start'
  });
});

app.get('/end', (req, res) => {
  res.send('ending...');
  publishMessage('end', {
    'command': 'end'
  });
});

const server = app.listen(8081, () => {
  const address = server.address();
  console.log('Cactus Pi Server started at http://%s:%s', address.address, address.port);
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