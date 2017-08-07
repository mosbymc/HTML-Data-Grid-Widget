'use strict';
require('rootpath')();
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    router = express.Router(),
    PORT = process.env.port || 3000;

app.use(bodyParser.json());
app.use('/dev', express.static('dev'));
app.use('/build', express.static('build'));
app.use('/src/scripts', express.static('src/scripts'));
app.use('/docs', express.static('yuidoc'));

require('./routes')(router);
app.use('/', router);   //localhost:3000/dev/grid.html

app.listen(PORT);

console.log("Static file server running at\n => http://localhost:" + PORT + "/\nCTRL + C to shutdown");

/*
 dpd -p 5500 grid-data/app.dpd
 dashboard
 Deployd Server: http://localhost:5500/auto-repairs

 */