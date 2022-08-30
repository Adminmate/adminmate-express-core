const jwt = require('jwt-simple');

module.exports = _conf => {
  const login = async (req, res) => {
    const { password } = req.body;

    if (!password) {
      return res.status(403).json({ message: 'Invalid request' });
    }

    if (password !== _conf.masterPassword) {
      return res.status(403).json({ message: 'Invalid master password' });
    }

    // Generate the Admin token
    const expireDays = 7;
    const expDate = Date.now() + (expireDays * 24 * 3600 * 1000);
    const tokenData = {
      exp_date: expDate,
      project_id: _conf.projectId
    };
    const adminToken = jwt.encode(tokenData, _conf.authKey);

    res.json({
      admin_token: adminToken
    });
  };

  return {
    login
  };
};
