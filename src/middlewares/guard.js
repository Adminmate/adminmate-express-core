module.exports.parseQuery = (req, res, next) => {
  if (req.headers['am-model-fields'] && typeof req.headers['am-model-fields'] === 'string') {
    req.headers['am-model-fields'] = JSON.parse(req.headers['am-model-fields']);
  }
  if (req.headers['am-ref-fields'] && typeof req.headers['am-ref-fields'] === 'string') {
    req.headers['am-ref-fields'] = JSON.parse(req.headers['am-ref-fields']);
  }
  if (req.headers['am-inline-actions'] && typeof req.headers['am-inline-actions'] === 'string') {
    req.headers['am-inline-actions'] = JSON.parse(req.headers['am-inline-actions']);
  }
  if (req.query.filters && typeof req.query.filters === 'string') {
    req.query.filters = JSON.parse(req.query.filters);
  }
  if (req.query.segment) {
    req.query.segment = JSON.parse(req.query.segment);
  }
  // If passed, check if the ids parameter is an array
  if (req.query.ids && !Array.isArray(req.query.ids)) {
    return res.status(403).json();
  }
  next();
};
