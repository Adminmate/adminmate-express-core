
const getModel = modelCode => {
  if (!modelCode) {
    return null;
  }

  const currentModel = global._amConfig.models.find(m => m.slug === modelCode);

  return currentModel;
};

module.exports.initModels = models => {
  return models.map(m => {
    const defaultModelConfig = {
      slug: m.slug,
      model: m.model,
      segments: m.segments || [],
      customActions: m.customActions || [],
      options: {
        canCreate: m.options && typeof m.options.canCreate === 'boolean' ? m.options.canCreate : true,
        canUpdate: m.options && typeof m.options.canUpdate === 'boolean' ? m.options.canUpdate : true,
        canDelete: m.options && typeof m.options.canDelete === 'boolean' ? m.options.canDelete : true
      }
    };
    return defaultModelConfig;
  });
};

module.exports.getModelObject = modelCode => {
  const currentModel = getModel(modelCode);
  if (!currentModel) {
    return null;
  }

  return currentModel.model;
};

module.exports.getModelOptions = modelCode => {
  const currentModel = getModel(modelCode);
  if (!currentModel) {
    return null;
  }

  return currentModel.options;
};

module.exports.getModelCustomActions = (modelCode, onlyIn) => {
  const currentModel = getModel(modelCode);
  if (!currentModel) {
    return null;
  }

  if (onlyIn && Array.isArray(onlyIn) && !onlyIn.includes('*')) {
    return currentModel.customActions.filter(ca => onlyIn.includes(ca.code));
  }

  return currentModel.customActions;
};


module.exports.getModelSegments = modelCode => {
  const currentModel = getModel(modelCode);
  if (!currentModel) {
    return null;
  }

  return currentModel.segments;
};