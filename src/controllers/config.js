module.exports.getConfig = api => {
  return (req, res) => {
    // Models list
    const models = [];
    global._amConfig.models.forEach(modelConfig => {
      const modelObject = {
        slug: modelConfig.slug,
        realname: api.getModelRealname(modelConfig.model),
        properties: api.getModelProperties(modelConfig.model),
        customactions: [],
        segments: []
      };

      // Add custom actions if present
      if (modelConfig.customActions) {
        modelObject.customactions = modelConfig.customActions;
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

    res.json({
      models,
      charts
    });
  };
};