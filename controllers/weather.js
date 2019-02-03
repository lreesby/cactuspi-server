const request = require('request');

module.exports = class Weather {
  constructor(config, publisher) {
    this._publisher = publisher;
    this._city = config.city;
    this._unit = config.unit;
    this._apiKey = config.apiKey;
  }

  fetch(zipCode) {
    this._city = zipCode == null ? this._city : zipCode;
    this._weatherUrl = `http://api.openweathermap.org/data/2.5/weather?zip=${this._city}&units=${this._unit}&appid=${this._apiKey}`;
    request(this._weatherUrl, (err, response, body) => {
      if (err) {
        throw new Error(`Weather: ${err}`);
      }

      const result = JSON.parse(body);
      if (result.main === undefined){
        throw new Error('Weather: failed to get weather data, please try again.');
      }

      const TEMP_UNITS = {
        'default': 'K',
        'metric': 'C',
        'imperial': 'F'
      };
      const unit = TEMP_UNITS[this._unit];
      const temperature = `${Math.round(result.main.temp_max)}-${Math.round(result.main.temp_min)}`;
      const condition = `${result.weather[0].main}`;
      const message = `${temperature}\n${condition}`;
      const icon = `http://openweathermap.org/img/w/${result.weather[0].icon}.png`;

      console.log('weather', message);
      this._publisher.publish(message, {
        'repeat': false,
        'name': 'weather',
        'duration': 20,
        'priority': icon
      });
    });
  }
};
