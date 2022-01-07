module.exports.getConfig = api => {
  return (req, res) => {
    // Models list
    const models = [];
    global._amConfig.models.forEach(modelConfig => {
      // Get model primary keys
      const primaryKeys = api.getModelPrimaryKeys(modelConfig.model);

      const modelObject = {
        slug: modelConfig.slug,
        realname: api.getModelRealname(modelConfig.model),
        properties: api.getModelProperties(modelConfig.model),
        relationships: api.getModelRelationships(modelConfig.model),
        idField: primaryKeys.length > 1 ? 'amCompositeId' : primaryKeys[0],
        primaryKeys,
        actions: [],
        segments: [],
        options: modelConfig.options
      };

      // Add actions if present
      if (modelConfig.actions) {
        modelObject.actions = modelConfig.actions.map(action => ({ label: action.label, code: action.code }));
      }

      // Add segments if present
      if (modelConfig.segments) {
        modelObject.segments = modelConfig.segments.map(segment => ({ label: segment.label, code: segment.code }));
      }

      models.push(modelObject);
    });

    // Charts list
    const charts = [];
    if (global._amConfig.charts.length) {
      global._amConfig.charts.map(chartConfig => {
        charts.push({
          code: chartConfig.code,
          label: chartConfig.label
        });
      });
    }

    // App config
    const appConfig = api.getAppConfig();

    res.json({
      models,
      charts,
      app: appConfig
    });
  };
};
