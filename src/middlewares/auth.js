const jwt = require('jwt-simple');

module.exports.isAuthorized = (req, res, next) => {
  const accessToken = req.headers['am-admin-token'];
  const permToken = req.headers['am-admin-perm-token'];
  const modelPermToken = req.headers['am-admin-model-perm-token'];

  try {
    const decoded_accessToken = jwt.decode(accessToken, global._amConfig.authKey);

    if (!decoded_accessToken || !decoded_accessToken.exp_date) {
      return res.status(403).json({ code: 'not_authorized' });
    }

    if (permToken) {
      const decoded_permToken = jwt.decode(permToken, global._amConfig.secretKey);

      if (!decoded_permToken || !decoded_permToken.exp_date) {
        return res.status(403).json({ code: 'not_authorized' });
      }

      req.permData = decoded_permToken.data;
    }

    if (modelPermToken) {
      const decoded_modelPermToken = jwt.decode(modelPermToken, global._amConfig.secretKey);

      if (!decoded_modelPermToken || !decoded_modelPermToken.exp_date) {
        return res.status(403).json({ code: 'not_authorized' });
      }

      // Check if the model is matching with the one in the permissions token
      if (req.params.model && (!decoded_modelPermToken.data.model || decoded_modelPermToken.data.model !== req.params.model)) {
        return res.status(403).json({ code: 'not_authorized' });
      }

      req.modelPermData = decoded_modelPermToken.data;
    }

    next();
  }
  catch(e) {
    return res.status(403).json({ code: 'not_authorized' });
  }
};

module.exports.isAuthorizedIP = (req, res, next) => {
  if (global._amConfig.authorizedIps && global._amConfig.authorizedIps.length) {
    // const currIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const currIp = req.ip;
    if (global._amConfig.devMode === true || global._amConfig.authorizedIps.includes(currIp)) {
      return next();
    }
    res.status(403).json({ code: 'not_authorized_ip' });
  }
  else {
    next();
  }
};