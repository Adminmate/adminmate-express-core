module.exports.canExecuteCA = (req, res, next) => {
  const caCode = req.params.ca;

  const authorizedCA = caCode && (
    req.modelPermData.can_use_custom_actions.includes('*') ||
    req.modelPermData.can_use_custom_actions.includes(caCode)
  );

  if (authorizedCA) {
    next();
  }
  else {
    res.status(403).json({ code: 'not_authorized' });
  }
};

module.exports.canAccessModel = (req, res, next) => {
  const modelSlug = req.params.model;

  const authorizedModel = modelSlug && (
    req.permData.authorized_models.includes('*') ||
    req.permData.authorized_models.includes(modelSlug)
  );

  if (authorizedModel) {
    next();
  }
  else {
    res.status(403).json({ code: 'not_authorized' });
  }
};

module.exports.canCreate = (req, res, next) => {
  if (req.modelPermData.can_create === true) {
    next();
  }
  else {
    res.status(403).json({ code: 'not_authorized' });
  }
};

module.exports.canUpdate = (req, res, next) => {
  const data = req.body.data || {};
  const keys = Object.keys(data);

  if (req.modelPermData.can_update.includes('*') || keys.every(key => req.modelPermData.can_update.includes(key))) {
    next();
  }
  else {
    res.status(403).json({ code: 'not_authorized' });
  }
};

module.exports.canDelete = (req, res, next) => {
  if (req.modelPermData.can_delete === true) {
    next();
  }
  else {
    res.status(403).json({ code: 'not_authorized' });
  }
};