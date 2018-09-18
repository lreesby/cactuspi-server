var Mta = require('mta-gtfs-lr');
var _ = require('lodash');
var Time = require('../helpers/time');

const timeHelper = new Time();

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
    var toPrint = "";
    var trainsPrinted = 0;
    var trainIndex = 0;
    var numTrains = 1;

    console.log(JSON.stringify(nextTrains, null, 2));

    var prio = 3;
    while (trainsPrinted <= numTrains && trainIndex < _.size(nextTrains)) {
      var diff = timeHelper.getTimeDif(nextTrains[trainIndex].arrivalTime, null);
      if(diff >= 0) {
        var minTilTrain = parseInt(timeHelper.convertTimestamp(diff, 'min'), 10);
        if(minTilTrain == 0) {
          toPrint += `${nextTrains[trainIndex].routeId} now\n`;
        } else {
          toPrint += `${nextTrains[trainIndex].routeId} ${minTilTrain} min\n`;
        }
        if(minTilTrain <= 5) {
          prio = 1;
        }
        else if(minTilTrain <= 10) {
          prio = prio > 2 ? 2 : prio;
        }
        trainsPrinted++;
      }
      trainIndex++;
    }

    console.log(toPrint.trim());
    this._publisher.publish(toPrint.trim(), {
      'repeat': false,
      'name': 'subway',
      'duration': 5,
      'priority': prio
    });
  }
};
