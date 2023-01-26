const cors = require('cors');
const cookieParser = require('cookie-parser');

// Access control config
const accessControl = () => {
  return cors({
    origin: [/\.adminmate\.io$/, /localhost:\d{4}$/],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'AM-Admin-Token', 'AM-Admin-Perm-Token', 'AM-Admin-Model-Perm-Token', 'AM-Model-Fields', 'AM-Ref-Fields', 'AM-Inline-Actions'],
  });
};

const initModels = models => {
  return models.map(m => {
    const defaultModelConfig = {
      slug: m.slug,
      model: m.model,
      segments: m.segments || [],
      actions: m.actions || [],
      options: {
        canCreate: m.options && typeof m.options.canCreate === 'boolean' ? m.options.canCreate : true,
        canUpdate: m.options && typeof m.options.canUpdate === 'boolean' ? m.options.canUpdate : true,
        canDelete: m.options && typeof m.options.canDelete === 'boolean' ? m.options.canDelete : true
      }
    };
    return defaultModelConfig;
  });
};

// Endpoints prefix
const endpointPrefix = '/adminmate/api';

const Adminmate = ({ config, api }) => {
  const _conf = { ...config };
  _conf.models = initModels(_conf.models || []);

  // Middlewares
  const { loginCheck, isAuthorized, isAuthorizedIP } = require('./src/middlewares/auth')(_conf, api);
  const { parseQuery } = require('./src/middlewares/guard');
  const perm = require('./src/middlewares/perm');

  // Controllers
  const authController = require('./src/controllers/auth')(_conf);
  const configCtrl = require('./src/controllers/config')(_conf, api);
  const actionsCtrl = require('./src/controllers/actions')(_conf, api);
  const chartsCtrl = require('./src/controllers/charts')(_conf);
  const exportCtrl = require('./src/controllers/export')(_conf, api);

  const express = require('express');
  const router = express.Router();

  router.use(`${endpointPrefix}/`, express.json());
  router.use(`${endpointPrefix}/`, cookieParser());
  router.use(`${endpointPrefix}/`, accessControl());

  // Login
  router.post(`${endpointPrefix}/login`, isAuthorizedIP, loginCheck, authController.login);

  // Config
  router.get(`${endpointPrefix}/config`, isAuthorizedIP, isAuthorized, configCtrl.getConfig);

  // Actions
  router.get(`${endpointPrefix}/models/:model/actions`, isAuthorizedIP, isAuthorized, actionsCtrl.getMatching);
  router.post(`${endpointPrefix}/models/:model/actions/:ca`, isAuthorizedIP, isAuthorized, perm.canExecuteCA, actionsCtrl.getExecute);

  // CRUD endpoints
  router.get(`${endpointPrefix}/models/:model`, isAuthorizedIP, isAuthorized, perm.canAccessModel, parseQuery, api.modelGetAll);
  router.get(`${endpointPrefix}/models/:model/autocomplete`, isAuthorizedIP, isAuthorized, parseQuery, api.modelGetAutocomplete);
  router.get(`${endpointPrefix}/models/:model/refs`, isAuthorizedIP, isAuthorized, parseQuery, api.modelGetRefs);
  router.post(`${endpointPrefix}/models/:model/create`, isAuthorizedIP, isAuthorized, perm.canAccessModel, perm.canCreate, api.modelPostOne);
  router.get(`${endpointPrefix}/models/:model/:id`, isAuthorizedIP, isAuthorized, perm.canAccessModel, parseQuery, api.modelGetOne);
  router.put(`${endpointPrefix}/models/:model/:id`, isAuthorizedIP, isAuthorized, perm.canAccessModel, perm.canUpdate, api.modelPutOne);
  router.delete(`${endpointPrefix}/models/:model`, isAuthorizedIP, isAuthorized, perm.canAccessModel, perm.canDelete, api.modelDeleteSome);

  // Other endpoints
  router.post(`${endpointPrefix}/models/:model/export_csv`, isAuthorizedIP, isAuthorized, perm.canAccessModel, exportCtrl.exportCSV);

  // Custom query
  router.post(`${endpointPrefix}/query`, isAuthorizedIP, isAuthorized, api.modelCustomQuery);

  // Execute custom charts
  router.post(`${endpointPrefix}/charts/:chart_code`, isAuthorizedIP, isAuthorized, chartsCtrl.execute);

  return router;
};

module.exports = {
  init: Adminmate
};
