'use strict';

const express = require('express');

// Create express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// Init
const amConfig = {
  config: {
    projectId: '6037b459cbb0f63c219789eb',
    secretKey: '7dn6m0zrcsqta5b57hug52xlira4upqdempch65mwy5guehr33vt0r1s8cyrnmko',
    authKey: 'authkey_secret',
    masterPassword: 'demo-password',
    devMode: true, // If you want to be in dev mode
    testMode: true,
    models: []
  },
  api: {
    modelGetAll: (req, res) => {},
    modelGetIn: (modelName, ids) => {},
    modelGetOne: (req, res) => {},
    modelGetRefs: (req, res) => {},
    modelPostOne: (req, res) => {},
    modelPutOne: (req, res) => {},
    modelDeleteSome: (req, res) => {},
    modelGetAutocomplete: (req, res) => {},
    modelCustomQuery: (req, res) => {}
  }
};

const plugin = require('../index.js');
app.use(plugin.init(amConfig));

module.exports = app;
