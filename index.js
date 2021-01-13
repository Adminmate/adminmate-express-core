const router = require('express').Router();
const cookieParser = require('cookie-parser');
const authController = require('./src/controllers/auth');
const installController = require('./src/controllers/install');
const { isAuthorized, isAuthorizedIP } = require('./src/middlewares/auth');

const accessControl = (req, res, next) => {
  const origin = global._amConfig.devMode ? 'http://localhost:3002' : 'https://my.adminmate.io';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token, X-Perm-Token, X-Model-Perm-Token');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
};

const Adminmate = ({ projectId, secretKey, authKey, masterPassword, models, authorizedIps, devMode, api }) => {
  global._amConfig = {};
  global._amConfig.projectId = projectId;
  global._amConfig.secretKey = secretKey;
  global._amConfig.authKey = authKey;
  global._amConfig.masterPassword = masterPassword;
  global._amConfig.models = models;
  global._amConfig.authorizedIps = authorizedIps || null;
  global._amConfig.devMode = devMode || false;

  router.use(cookieParser());
  router.use(accessControl);

  // Installation checks
  router.post('/api/check_connection', installController.checkConnection);
  router.post('/api/check_models', installController.checkModels);

  // Login
  router.post('/api/login', isAuthorizedIP, authController.login);

  // Get models list
  router.get('/api/model', isAuthorizedIP, isAuthorized, api.getModels);
  router.get('/api/model/properties', isAuthorizedIP, isAuthorized, api.getModelsProperties);

  // Get available Smart Actions for the items list
  router.get('/api/model/smartactions', isAuthorizedIP, isAuthorized, api.getSmartActions);
  router.get('/api/model/:model/smartactions', isAuthorizedIP, isAuthorized, api.getSmartAction);

  // Segments
  router.get('/api/model/segments', isAuthorizedIP, isAuthorized, api.getSegments);

  // CRUD endpoints
  router.post('/api/model/:model', isAuthorizedIP, isAuthorized, api.modelGet);
  router.post('/api/model/:model/autocomplete', isAuthorizedIP, isAuthorized, api.modelGetAutocomplete);
  router.post('/api/model/:model/:id', isAuthorizedIP, isAuthorized, api.modelGetOne);
  router.post('/api/model/:model/create', isAuthorizedIP, isAuthorized, api.modelPostOne);
  router.put('/api/model/:model/:id', isAuthorizedIP, isAuthorized, api.modelPutOne);
  router.delete('/api/model/:model', isAuthorizedIP, isAuthorized, api.modelDeleteSome);

  // Custom query
  router.post('/api/query', isAuthorizedIP, isAuthorized, api.modelCustomQuery);

  return router;
};

module.exports = {
  init: Adminmate,
  isAuthorized,
};