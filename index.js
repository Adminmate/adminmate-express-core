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

const Adminmate = ({ projectId, secretKey, authKey, masterPassword, models, authorizedIps, api }) => {
  global._amConfig = {};
  global._amConfig.projectId = projectId;
  global._amConfig.secretKey = secretKey;
  global._amConfig.authKey = authKey;
  global._amConfig.masterPassword = masterPassword;
  global._amConfig.models = models;
  global._amConfig.authorizedIps = authorizedIps || null;
  global._amConfig.devMode = !!global.AM_DEV_MODE;

  router.use(cookieParser());
  router.use(accessControl);

  // Installation checks
  router.post('/api/check_connection', installController.checkConnection);
  router.post('/api/check_models', installController.checkModels);

  // Login
  router.post('/api/login', isAuthorizedIP, authController.login);

  // Models
  router.get('/api/models', isAuthorizedIP, isAuthorized, modelsCtrl.getModels(api));
  router.get('/api/models/properties', isAuthorizedIP, isAuthorized, modelsCtrl.getModelsProperties(api));

  // Custom Actions
  router.get('/api/models/customactions', isAuthorizedIP, isAuthorized, customActionsCtrl.getAll(api));
  router.get('/api/models/:model/customactions', isAuthorizedIP, isAuthorized, customActionsCtrl.getMatching(api));
  router.post('/api/models/:model/customactions/:ca', isAuthorizedIP, isAuthorized, customActionsCtrl.execute);

  // Segments
  router.get('/api/models/segments', isAuthorizedIP, isAuthorized, segmentsCtrl.getAll);

  // CRUD endpoints
  router.post('/api/models/:model', isAuthorizedIP, isAuthorized, api.modelGetAll);
  router.post('/api/models/:model/autocomplete', isAuthorizedIP, isAuthorized, api.modelGetAutocomplete);
  router.post('/api/models/:model/create', isAuthorizedIP, isAuthorized, api.modelPostOne);
  router.post('/api/models/:model/:id', isAuthorizedIP, isAuthorized, api.modelGetOne);
  router.put('/api/models/:model/:id', isAuthorizedIP, isAuthorized, api.modelPutOne);
  router.delete('/api/models/:model', isAuthorizedIP, isAuthorized, api.modelDeleteSome);

  // Custom query
  router.post('/api/query', isAuthorizedIP, isAuthorized, api.modelCustomQuery);

  return router;
};

module.exports = {
  init: Adminmate,
  isAuthorized,
};