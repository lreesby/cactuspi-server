const fetch = require("node-fetch");

module.exports = class Covid {
  constructor(publisher) {
    this._publisher = publisher;

  }

  async fetchData(input) {
    var state = input == null ? 'NY' : input;
    var covidUrlState = `https://covidtracking.com/api/v1/states/${state}/current.json`;
    var covidUrlStateDaily = `https://covidtracking.com/api/v1/states/${state}/daily.json`;
    var covidUrlUs = `https://covidtracking.com/api/v1/us/current.json`;
    var covidUrlUsDaily = `https://covidtracking.com/api/v1/us/daily.json`;

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
        console.log('covidUrlStateDaily: ' + data[0].positiveIncrease);
        message += `${data[0].positiveIncrease},`;
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
        console.log('covidUrlUsDaily: ' + data[0].positiveIncrease);
        message += `${data[0].positiveIncrease},`;
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
