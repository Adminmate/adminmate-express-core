
module.exports = _conf => {
  const getModel = modelCode => {
    if (!modelCode) {
      return null;
    }

    return _conf.models.find(m => m.slug === modelCode);
  };

  // module.exports.initModels = models => {
  //   return models.map(m => {
  //     const defaultModelConfig = {
  //       slug: m.slug,
  //       model: m.model,
  //       segments: m.segments || [],
  //       actions: m.actions || [],
  //       options: {
  //         canCreate: m.options && typeof m.options.canCreate === 'boolean' ? m.options.canCreate : true,
  //         canUpdate: m.options && typeof m.options.canUpdate === 'boolean' ? m.options.canUpdate : true,
  //         canDelete: m.options && typeof m.options.canDelete === 'boolean' ? m.options.canDelete : true
  //       }
  //     };
  //     return defaultModelConfig;
  //   });
  // };

  const getModelObject = modelCode => {
    const currentModel = getModel(modelCode);
    if (!currentModel) {
      return null;
    }

    return currentModel.model;
  };

  const getModelOptions = modelCode => {
    const currentModel = getModel(modelCode);
    if (!currentModel) {
      return null;
    }

    return currentModel.options;
  };

  const getModelActions = (modelCode, onlyIn) => {
    const currentModel = getModel(modelCode);
    if (!currentModel) {
      return null;
    }

    if (onlyIn && Array.isArray(onlyIn) && !onlyIn.includes('*')) {
      return currentModel.actions.filter(action => onlyIn.includes(action.code));
    }

    return currentModel.actions;
  };


  const getModelSegments = modelCode => {
    const currentModel = getModel(modelCode);
    if (!currentModel) {
      return null;
    }

    return currentModel.segments;
  };

  return {
    getModelObject,
    getModelOptions,
    getModelActions,
    getModelSegments
  };
};
