const jwt = require('jwt-simple');

module.exports = _conf => {
  const loginCheck = (req, res, next) => {
    const accessToken = req.body.loginToken;

    setTimeout(() => {
      if (!accessToken) {
        return res.status(403).json({ message: 'Invalid request' });
      }

      try {
        const decoded_loginToken = jwt.decode(accessToken, _conf.secretKey);

        if (!decoded_loginToken || !decoded_loginToken.exp_date) {
          return res.status(403).json({ message: 'Invalid request' });
        }

        // Compute delay before token expiration
        const validDelay = Math.round((decoded_loginToken.exp_date * 1000 - Date.now()) / 1000);

        // If the login token is expired
        if (validDelay <= 0) {
          return res.status(403).json({ message: 'Invalid request' });
        }

        next();
      }
      catch(e) {
        return res.status(403).json({ code: 'not_authorized' });
      }
    }, 2000);
  };

  const isAuthorized = (req, res, next) => {
    const accessToken = req.headers['am-admin-token'];
    const permToken = req.headers['am-admin-perm-token'];
    const modelPermToken = req.headers['am-admin-model-perm-token'];

    try {
      const decoded_accessToken = jwt.decode(accessToken, _conf.authKey);

      if (!decoded_accessToken || !decoded_accessToken.exp_date || decoded_accessToken.project_id !== _conf.projectId) {
        return res.status(403).json({ code: 'not_authorized', type: 'access_token' });
      }

      if (permToken) {
        const decoded_permToken = jwt.decode(permToken, _conf.secretKey);

        if (!decoded_permToken || !decoded_permToken.exp_date) {
          return res.status(403).json({ code: 'not_authorized', type: 'perm_token' });
        }

        req.permData = decoded_permToken.data;
      }

      if (modelPermToken) {
        const decoded_modelPermToken = jwt.decode(modelPermToken, _conf.secretKey);

        if (!decoded_modelPermToken || !decoded_modelPermToken.exp_date) {
          return res.status(403).json({ code: 'not_authorized', type: 'model_perm_token' });
        }

        // Check if the model is matching with the one in the permissions token
        if (req.params.model && (!decoded_modelPermToken.data.model || decoded_modelPermToken.data.model !== req.params.model)) {
          return res.status(403).json({ code: 'not_authorized', type: 'model_perm_token' });
        }

        req.modelPermData = decoded_modelPermToken.data;
      }

      next();
    }
    catch(e) {
      return res.status(403).json({ code: 'not_authorized' });
    }
  };

  const isAuthorizedIP = (req, res, next) => {
    if (_conf.authorizedIps && _conf.authorizedIps.length) {
      // const currIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const currIp = req.ip;
      if (_conf.devMode === true || _conf.authorizedIps.includes(currIp)) {
        return next();
      }
      res.status(403).json({ code: 'not_authorized_ip' });
    }
    else {
      next();
    }
  };

  return {
    loginCheck,
    isAuthorized,
    isAuthorizedIP
  };
};
