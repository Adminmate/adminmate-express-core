const router = require('express').Router();
const cookieParser = require('cookie-parser');

// Middlewares
const { isAuthorized, isAuthorizedIP } = require('./src/middlewares/auth');
const { parseQuery } = require('./src/middlewares/guard');
const perm = require('./src/middlewares/perm');

// Controllers
const authController = require('./src/controllers/auth');
const configCtrl = require('./src/controllers/config');
const actionsCtrl = require('./src/controllers/actions');
const chartsCtrl = require('./src/controllers/charts');
const exportCtrl = require('./src/controllers/export');

// Helpers
const fnHelper = require('./src/helpers/functions');

const accessControl = (req, res, next) => {
  const origin = global._amConfig.devMode ? 'http://localhost:3002' : 'https://app.adminmate.io';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, AM-Admin-Token, AM-Admin-Perm-Token, AM-Admin-Model-Perm-Token, AM-Model-Fields, AM-Ref-Fields');
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

  // Login
  router.post(`${endpointPrefix}/login`, isAuthorizedIP, authController.login);

  // Config
  router.get(`${endpointPrefix}/config`, isAuthorizedIP, isAuthorized, configCtrl.getConfig(api));

  // Actions
  router.get(`${endpointPrefix}/models/:model/actions`, isAuthorizedIP, isAuthorized, actionsCtrl.getMatching(api));
  router.post(`${endpointPrefix}/models/:model/actions/:ca`, isAuthorizedIP, isAuthorized, perm.canExecuteCA, actionsCtrl.execute);

  // CRUD endpoints
  router.get(`${endpointPrefix}/models/:model`, isAuthorizedIP, isAuthorized, perm.canAccessModel, parseQuery, api.modelGetAll);
  router.get(`${endpointPrefix}/models/:model/autocomplete`, isAuthorizedIP, isAuthorized, parseQuery, api.modelGetAutocomplete);
  router.post(`${endpointPrefix}/models/:model/create`, isAuthorizedIP, isAuthorized, perm.canAccessModel, perm.canCreate, api.modelPostOne);
  router.get(`${endpointPrefix}/models/:model/:id`, isAuthorizedIP, isAuthorized, perm.canAccessModel, parseQuery, api.modelGetOne);
  router.put(`${endpointPrefix}/models/:model/:id`, isAuthorizedIP, isAuthorized, perm.canAccessModel, perm.canUpdate, api.modelPutOne);
  router.delete(`${endpointPrefix}/models/:model`, isAuthorizedIP, isAuthorized, perm.canAccessModel, perm.canDelete, api.modelDeleteSome);

  // Other endpoints
  router.post(`${endpointPrefix}/models/:model/export_csv`, isAuthorizedIP, isAuthorized, perm.canAccessModel, exportCtrl.exportCSV(api));

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