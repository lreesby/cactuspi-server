const BusTime = require('mta-bustime');

module.exports = class Bustime {
  constructor(config, publisher) {
    this._publisher = publisher;
    this._lineRef = config.lineRef;
    this._directionRef = config.directionRef;
    this._monitoringRef = config.monitoringRef;
    this._maximumStopVisits = config.maximumStopVisits;
    this._busTime = new BusTime(config.apiKey);
  }

  fetch() {
    const options = {
      LineRef: this._lineRef,
      DirectionRef: this._directionRef,
      MonitoringRef: this._monitoringRef,
      MaximumStopVisits: this._maximumStopVisits
    };
    this._busTime.stopMonitoring(options, (err, res, body) => {
      if (err) {
        throw new Error(`BusTime: ${err}`);
      }
      let total = 0;
      let message = '';
      console.log(body.Siri.ServiceDelivery);
      const stopMonitoringDelivery = body.Siri.ServiceDelivery.StopMonitoringDelivery;
      stopMonitoringDelivery.forEach(stopMonitoring => {
        const monitoredStopVisit = stopMonitoring.MonitoredStopVisit;
        monitoredStopVisit.forEach(stopVisit => {
          const monitoredVehicleJourney = stopVisit.MonitoredVehicleJourney;
          const { PresentableDistance, StopsFromCall } = monitoredVehicleJourney.MonitoredCall.Extensions.Distances;
          message += `${monitoredVehicleJourney.LineRef.replace('MTA NYCT_', '')} is ${StopsFromCall > 0 ? `${StopsFromCall} stop${StopsFromCall === 1 ? '' : 's'} away and ` : ''}${PresentableDistance}. `;
          total ++;
        });
      });

      console.log(message);
      if (total > 0) {
        this._publisher.publish(message, {
          'repeat': false,
          'name': 'bustime',
          'duration': 15 * total,
          'priority': false
        });
      }
    });
  }
};
