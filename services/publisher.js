const PubNub = require('pubnub');

module.exports = class Publisher {
  constructor(config) {
    this._channel = config.channel;
    this._pubNub = new PubNub({
      publishKey: config.publishKey,
      subscribeKey: config.subscribeKey,
      secretKey: config.secretKey,
      ssl: true
    });
  }

  publish(message, meta) {
    if (!this._pubNub) {
      throw new Error('PubNub is not initialized');
    }

    this._pubNub.publish(
      {
        message,
        channel: this._channel,
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
};
