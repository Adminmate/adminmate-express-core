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

  // Express 5 made `req.query` a getter that re-parses `req.url` on every access,
  // so direct mutation (`req.query.segment = parsed`) doesn't persist. Build a
  // plain object with the parsed values and replace `req.query` entirely.
  const parsedQuery = { ...req.query };
  if (parsedQuery.filters && typeof parsedQuery.filters === 'string') {
    parsedQuery.filters = JSON.parse(parsedQuery.filters);
  }
  if (parsedQuery.segment && typeof parsedQuery.segment === 'string') {
    parsedQuery.segment = JSON.parse(parsedQuery.segment);
  }
  Object.defineProperty(req, 'query', { value: parsedQuery, writable: true, configurable: true });

  // If passed, check if the ids parameter is an array
  if (req.query.ids && !Array.isArray(req.query.ids)) {
    return res.status(403).json();
  }
  next();
};
