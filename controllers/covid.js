const fetch = require("node-fetch");

var Time = require('../helpers/time');

module.exports = class Covid {
  constructor(publisher) {
    this._publisher = publisher;

  }

  async fetchData(input) {
    const timeHelper = new Time();

    var date = timeHelper.convertTimestamp(null, 'YYYYMMDD');
    var state = input == null ? 'NY' : input;
    var covidUrlState = `https://covidtracking.com/api/states?state=${state}`;
    var covidUrlStateDaily = `https://covidtracking.com/api/states/daily?state=${state}&date=${date}`;
    var covidUrlUs = `https://covidtracking.com/api/us`;
    var covidUrlUsDaily = `https://covidtracking.com/api/us/daily?date=${date}`;

    let message = '';
    await fetch(covidUrlState)
      .then((resp) => resp.json())
      .then(function(data) {
        console.log('covidUrlState: ' + data.positive);
        message += `${data.positive},`;
      })
      .catch(function(err) {
        console.log('err: ' + err);
      });

    await fetch(covidUrlStateDaily)
      .then((resp) => resp.json())
      .then(function(data) {
        console.log('covidUrlStateDaily: ' + data.positiveIncrease);
        message += `${data.positiveIncrease},`;
      })
      .catch(function(err) {
        console.log('err: ' + err);
      });

    await fetch(covidUrlUs)
      .then((resp) => resp.json())
      .then(function(data) {
        console.log('covidUrlUs: ' + data[0].positive);
        message += `${data[0].positive},`;
      })
      .catch(function(err) {
        console.log('err: ' + err);
      });

    await fetch(covidUrlUsDaily)
      .then((resp) => resp.json())
      .then(function(data) {
        console.log('covidUrlUsDaily: ' + data.positiveIncrease);
        message += `${data.positiveIncrease},`;
      })
      .catch(function(err) {
        console.log('err: ' + err);
      });

    console.log('covid: ' + message);
    this._publisher.publish(message, {
      'repeat': false,
      'name': 'covid',
      'duration': 20,
      'priority': 3,
    });
  }
};
