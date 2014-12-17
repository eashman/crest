/**
 * Copyright 2013 Ricard Aspeljung. All Rights Reserved.
 *
 * server.js
 * crest
 */

var fs = require("fs"),
  mongodb = require("mongodb"),
  express = module.exports.express = require("express"),
  bodyParser = require('body-parser'),
  cluster =  require('express-cluster'),
  server = null;

var DEBUGPREFIX = "DEBUG: ";

var config = {
  "db": {
    "port": 27017,
    "host": "localhost"
  },
  "server": {
    "port": 3500,
    "address": "0.0.0.0",
    "threads" : 5
  },
  "flavor": "mongodb",
  "debug": false,

};
var debug = module.exports.debug = function (str, obj) {
  if (config.debug) {
    console.log(DEBUGPREFIX + str, typeof obj === "undefined" ? "" : obj);
  }
};

try {
  config = JSON.parse(fs.readFileSync(process.cwd() + "/config.json"));
} catch (e) {
  debug("No config.json file found. Fall back to default config.");
}

module.exports.config = config;
cluster(function(worker) {
  var server = express();
  // server.acceptable = ['application/json'];
  // server.use(express.acceptParser(server.acceptable));
  server.use(bodyParser.urlencoded({ extended: true, limit : '50mb' }));
  // server.use(bodyParser());
  // server.use(express.fullResponse());
  // server.use(express.queryParser());
  server.use(bodyParser.json({limit: '50mb'}));
  module.exports.server = server;

  require('./lib/rest');

  server.listen(config.server.port, config.server.address, function () {
    console.log("%s listening at %s", config.server.port, config.server.address);
    console.log("Using instance : %s:%s", config.db.host, config.db.port);
  });
}, {count: config.server.threads});

