const fs = require('fs');
const request = require('request');
const PubNub = require('pubnub');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);

async function run(config) {
  const { weather, pubnub } = config;

  const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?zip=${weather.city}&units=${weather.unit}&appid=${weather.openWeatherMapApi}`;
  
  const pubNub = new PubNub({
    publishKey: pubnub.publishKey,
    subscribeKey: pubnub.subscribeKey,
    secretKey: pubnub.secretKey,
    ssl: true
  });
  
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
    
    let unit = 'K';
    if (weather.unit === 'metric') {
      unit = 'C';
    } else if (weather.unit === 'imperial') {
      unit = 'F';
    }
    const temperature = `Now: ${Math.round(result.main.temp)}'${unit}. Today ${Math.round(result.main.temp_min)}'${unit} - ${Math.round(result.main.temp_max)}'${unit}.`;
    const condition = `Forecast: ${result.weather[0].description}. Humidity: ${result.main.humidity}%.`;
    const message = `${result.name} - ${temperature} ${condition}`;
    console.log(message);

    pubNub.publish(
      {
        message: {
          display: message
        },
        channel: pubnub.channel,
        sendByPost: false,
        storeInHistory: false,
        meta: {
          "repeat": 1
        }
      }, (status, response) => {
        if (status.error) {
          console.log("PubNub", status)
        } else {
          console.log("PubNub: Published with timetoken", response.timetoken)
        }
      }
    );
  });
}

run(config).then(() => console.log('Done!'));
