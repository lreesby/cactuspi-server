var Mta = require('mta-gtfs');
var _ = require('lodash');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

module.exports = class Subway {
  constructor(config, publisher) {
    this._publisher = publisher;
    this._lineRef = config.lineRef;
    this._directionRef = config.directionRef;
    this._feed_id = config.feed_id;

    this._mta = new Mta({
      key: config.key, // only needed for mta.schedule() method
      feed_id: config.feed_id
    });
  }

  async fetch() {
    var results;
    await this._mta.schedule(this._lineRef, this._feed_id).then(function (result) {
      results = result;
    }).catch(function (err) {
      console.log(err);
    });
    var nextTrains = _.get(results, `schedule.${this._lineRef}.${this._directionRef}`, []);
    console.log(JSON.stringify(nextTrains, null, 2));
    this._publisher.publish('Hello World!', {
      'repeat': false,
      'name': 'hello',
      'duration': 5,
      'priority': true
    });
  }
};
