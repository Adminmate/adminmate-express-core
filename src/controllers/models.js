module.exports.getModelsProperties = api => {
  return (req, res) => {
    const modelsProperties = [];

    global._amConfig.models.forEach(modelConfig => {
      const modelProperties = api.getModelProperties(modelConfig.model);
      modelProperties.map(property => {
        modelsProperties.push({
          model: modelConfig.slug,
          path: property.path
        });
      });
    });

    res.json({ properties: modelsProperties });
  };
};

module.exports.getModels = api => {
  return (req, res) => {
    let models = [];

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

    res.json({ models });
  };
};
