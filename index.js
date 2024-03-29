const router = require('express').Router();
const cookieParser = require('cookie-parser');

// Middlewares
const { isAuthorized, isAuthorizedIP } = require('./src/middlewares/auth');
const perm = require('./src/middlewares/perm');

// Controllers
const authController = require('./src/controllers/auth');
const installController = require('./src/controllers/install');
const configCtrl = require('./src/controllers/config');
const actionsCtrl = require('./src/controllers/actions');
const chartsCtrl = require('./src/controllers/charts');

// Helpers
const fnHelper = require('./src/helpers/functions');

const accessControl = (req, res, next) => {
  const origin = global._amConfig.devMode ? 'http://localhost:3002' : 'https://app.adminmate.io';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token, X-Perm-Token, X-Model-Perm-Token');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
};

// Endpoints prefix
const endpointPrefix = '/adminmate/api';

const Adminmate = ({ projectId, secretKey, authKey, masterPassword, models, charts, authorizedIps, api }) => {
  global._amConfig = {};
  global._amConfig.projectId = projectId;
  global._amConfig.secretKey = secretKey;
  global._amConfig.authKey = authKey;
  global._amConfig.masterPassword = masterPassword;
  global._amConfig.models = fnHelper.initModels(models || []);
  global._amConfig.charts = charts || [];
  global._amConfig.authorizedIps = authorizedIps || null;
  global._amConfig.devMode = !!global.AM_DEV_MODE;

  router.use(`${endpointPrefix}/`, cookieParser());
  router.use(`${endpointPrefix}/`, accessControl);

  // Installation checks
  router.post(`${endpointPrefix}/check_connection`, installController.checkConnection);
  router.post(`${endpointPrefix}/check_models`, installController.checkModels);

  // Login
  router.post(`${endpointPrefix}/login`, isAuthorizedIP, authController.login);

  // Config
  router.get(`${endpointPrefix}/config`, isAuthorizedIP, isAuthorized, configCtrl.getConfig(api));

  // Actions
  router.get(`${endpointPrefix}/models/:model/actions`, isAuthorizedIP, isAuthorized, actionsCtrl.getMatching(api));
  router.post(`${endpointPrefix}/models/:model/actions/:ca`, isAuthorizedIP, isAuthorized, perm.canExecuteCA, actionsCtrl.execute);

  // CRUD endpoints
  router.post(`${endpointPrefix}/models/:model`, isAuthorizedIP, isAuthorized, perm.canAccessModel, api.modelGetAll);
  router.post(`${endpointPrefix}/models/:model/autocomplete`, isAuthorizedIP, isAuthorized, api.modelGetAutocomplete);
  router.post(`${endpointPrefix}/models/:model/create`, isAuthorizedIP, isAuthorized, perm.canAccessModel, perm.canCreate, api.modelPostOne);
  router.post(`${endpointPrefix}/models/:model/:id`, isAuthorizedIP, isAuthorized, perm.canAccessModel, api.modelGetOne);
  router.put(`${endpointPrefix}/models/:model/:id`, isAuthorizedIP, isAuthorized, perm.canAccessModel, perm.canUpdate, api.modelPutOne);
  router.delete(`${endpointPrefix}/models/:model`, isAuthorizedIP, isAuthorized, perm.canAccessModel, perm.canDelete, api.modelDeleteSome);

  // Custom query
  router.post(`${endpointPrefix}/query`, isAuthorizedIP, isAuthorized, api.modelCustomQuery);

  // Execute custom charts
  router.post(`${endpointPrefix}/charts/:chart_code`, isAuthorizedIP, isAuthorized, chartsCtrl.execute);

  return router;
};

module.exports = {
  init: Adminmate,
  isAuthorized,
};