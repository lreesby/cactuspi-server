const fs = require('fs');
const express = require('express');

const Publisher = require('./services/publisher');
const Weather = require('./controllers/weather');
const Bustime = require('./controllers/bustime');
const Subway = require('./controllers/subway');
const CommandManager = require('./controllers/command-manager');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);

const publisher = new Publisher(config.pubnub);
const weather = new Weather(config.weather, publisher);
const bustime = new Bustime(config.bustime, publisher);
const subway = new Subway(config.subway, publisher);
const commandManager = new CommandManager(publisher);

const app = express();

app.get('/weather', (req, res) => {
  var zip = req.param('zip');
  weather.fetch(zip);
  res.send('Weather fetched');
});

app.get('/bustime', (req, res) => {
  bustime.fetch();
  res.send('Bustime fetched');
});

app.get('/subway', (req, res) => {
  var lineRef = req.param('line');
  var direction = req.param('dir');
  var feed = req.param('feed');

  subway.fetch(lineRef, direction, feed);
  res.send('Subway fetched');
});

app.get('/hello', (req, res) => {
  publisher.publish('Hello World!', {
    'repeat': false,
    'name': 'hello',
    'duration': 5,
    'priority': true
  });
  res.send('Hello World!');
});

app.get('/message/:message', (req, res) => {
  const message = req.params.message;
  publisher.publish(`Message: ${message}`, {
    'repeat': req.param('repeat') || false,
    'name': req.param('name') || 'message',
    'duration': req.param('duration') || 10,
    'priority': req.param('message') || true
  });
  res.send(`Message: "${message}"`);
});

app.get('/clear', (req, res) => {
  commandManager.command('clear');
  res.send('Clear');
});

app.get('/stop', (req, res) => {
  commandManager.command('stop');
  res.send('Stop');
});

app.get('/start', (req, res) => {
  commandManager.command('start');
  res.send('Start');
});

app.get('/end', (req, res) => {
  commandManager.command('end');
  res.send('End');
});

const server = app.listen(8081, () => {
  const address = server.address();
  console.log('Cactus Pi Server started at http://%s:%s', address.address, address.port);
});
