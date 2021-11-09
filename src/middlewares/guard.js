module.exports.parseQuery = (req, res, next) => {
  if (req.headers['am-model-fields'] && typeof req.headers['am-model-fields'] === 'string') {
    req.headers['am-model-fields'] = JSON.parse(req.headers['am-model-fields']);
  }
  if (req.headers['am-ref-fields'] && typeof req.headers['am-ref-fields'] === 'string') {
    req.headers['am-ref-fields'] = JSON.parse(req.headers['am-ref-fields']);
  }
  if (req.query.filters && typeof req.query.filters === 'string') {
    req.query.filters = JSON.parse(req.query.filters);
  }
  if (req.query.segment) {
    req.query.segment = JSON.parse(req.query.segment);
  }
  next();
};
