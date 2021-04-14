const router = require('express').Router();
const cookieParser = require('cookie-parser');

// Middlewares
const { isAuthorized, isAuthorizedIP } = require('./src/middlewares/auth');

// Controllers
const authController = require('./src/controllers/auth');
const installController = require('./src/controllers/install');
const modelsCtrl = require('./src/controllers/models');
const customActionsCtrl = require('./src/controllers/customactions');
const segmentsCtrl = require('./src/controllers/segments');

const accessControl = (req, res, next) => {
  const origin = global._amConfig.devMode ? 'http://localhost:3002' : 'https://my.adminmate.io';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token, X-Perm-Token, X-Model-Perm-Token');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
};

// Endpoints prefix
const endpointPrefix = '/adminmate/api';

const Adminmate = ({ projectId, secretKey, authKey, masterPassword, models, authorizedIps, api }) => {
  global._amConfig = {};
  global._amConfig.projectId = projectId;
  global._amConfig.secretKey = secretKey;
  global._amConfig.authKey = authKey;
  global._amConfig.masterPassword = masterPassword;
  global._amConfig.models = models;
  global._amConfig.authorizedIps = authorizedIps || null;
  global._amConfig.devMode = !!global.AM_DEV_MODE;

  router.use(`${endpointPrefix}/`, cookieParser());
  router.use(`${endpointPrefix}/`, accessControl);

  // Installation checks
  router.post(`${endpointPrefix}/check_connection`, installController.checkConnection);
  router.post(`${endpointPrefix}/check_models`, installController.checkModels);

  // Login
  router.post(`${endpointPrefix}/login`, isAuthorizedIP, authController.login);

  // Models
  router.get(`${endpointPrefix}/models`, isAuthorizedIP, isAuthorized, modelsCtrl.getModels(api));
  router.get(`${endpointPrefix}/models/properties`, isAuthorizedIP, isAuthorized, modelsCtrl.getModelsProperties(api));

  // Custom Actions
  router.get(`${endpointPrefix}/models/customactions`, isAuthorizedIP, isAuthorized, customActionsCtrl.getAll(api));
  router.get(`${endpointPrefix}/models/:model/customactions`, isAuthorizedIP, isAuthorized, customActionsCtrl.getMatching(api));
  router.post(`${endpointPrefix}/models/:model/customactions/:ca`, isAuthorizedIP, isAuthorized, customActionsCtrl.execute);

  // Segments
  router.get(`${endpointPrefix}/models/segments`, isAuthorizedIP, isAuthorized, segmentsCtrl.getAll);

  // CRUD endpoints
  router.post(`${endpointPrefix}/models/:model`, isAuthorizedIP, isAuthorized, api.modelGetAll);
  router.post(`${endpointPrefix}/models/:model/autocomplete`, isAuthorizedIP, isAuthorized, api.modelGetAutocomplete);
  router.post(`${endpointPrefix}/models/:model/create`, isAuthorizedIP, isAuthorized, api.modelPostOne);
  router.post(`${endpointPrefix}/models/:model/:id`, isAuthorizedIP, isAuthorized, api.modelGetOne);
  router.put(`${endpointPrefix}/models/:model/:id`, isAuthorizedIP, isAuthorized, api.modelPutOne);
  router.delete(`${endpointPrefix}/models/:model`, isAuthorizedIP, isAuthorized, api.modelDeleteSome);

  // Custom query
  router.post(`${endpointPrefix}/query`, isAuthorizedIP, isAuthorized, api.modelCustomQuery);

  return router;
};

module.exports = {
  init: Adminmate,
  isAuthorized,
};