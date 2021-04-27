const fnHelper = require('../helpers/functions');

module.exports.getMatching = api => {
  return async (req, res) => {
    const modelName = req.params.model;
    const items = req.query.ids || '';
    const target = req.query.target || '';

    if (!items || typeof items !== 'string' || !target || !['item', 'bulk'].includes(target)) {
      return res.status(403).json({ message: 'Invalid request' });
    }

    const currentModel = fnHelper.getModelObject(modelName);
    if (!currentModel || !items) {
      return res.status(403).json({ message: 'Invalid request' });
    }

    // Get model options
    const currentModelOptions = fnHelper.getModelOptions(modelName);
    const authorizedToDeleteRegardingOptions = currentModelOptions && currentModelOptions.canDelete === true;
    const authorizedToDelete = req.modelPermData && req.modelPermData.can_delete === true;

    const actionsList = [];
    if (authorizedToDeleteRegardingOptions && authorizedToDelete) {
      actionsList.push({
        label: target === 'item' ? 'Delete' : 'Delete selected',
        code: 'delete'
      });
    }

    const currentModelCustomActions = fnHelper.getModelCustomActions(modelName, req.modelPermData.can_use_custom_actions);
    if (!currentModelCustomActions || currentModelCustomActions.length === 0) {
      return res.json({ list: actionsList });
    }

    // Ids list
    const itemsArray = items.split(',');

    // Get corresponding items
    const itemsDB = await api.modelGetIn(modelName, itemsArray);

    if (!itemsDB) {
      return res.json({ list: actionsList });
    }

    // Filter by target
    const customActionsFilteredByTarget = currentModelCustomActions
      .filter(sa => {
        const isStringAndValid = typeof sa.target === 'string' && sa.target === target;
        const isArrayAndValid = Array.isArray(sa.target) && sa.target.includes(target);
        return isStringAndValid || isArrayAndValid;
      })
      .map(sa => {
        sa.passFilter = true;
        return sa;
      });

    itemsDB.forEach(item => {
      customActionsFilteredByTarget.forEach(sa => {
        // If the filter do not pass, remove the custom actions from the list
        if (typeof sa.filter === 'function' && sa.filter(item) === false) {
          sa.passFilter = false;
        }
      });
    });

    // We only keep valid custom actions
    const finalCustomActions = customActionsFilteredByTarget.filter(sa => sa.passFilter === true);

    // If there is both the native delete action and other custom actions, add a separator
    if (actionsList.length && finalCustomActions.length) {
      actionsList.unshift({ type: 'separator' });
    }

    res.json({
      list: [
        ...finalCustomActions,
        ...actionsList
      ]
    });
  };
};

module.exports.execute = (req, res) => {
  const modelSlug = req.params.model;
  const caCode = req.params.ca;

  const matchingModel = global._amConfig.models.find(m => m.slug === modelSlug);
  if (!matchingModel || !matchingModel.customActions || !Array.isArray(matchingModel.customActions)) {
    return res.status(403).json({ message: 'Invalid model' });
  }

  const matchingAction = matchingModel.customActions.find(ca => ca.code === caCode);
  if (!matchingAction || !matchingAction.handler || typeof matchingAction.handler !== 'function') {
    return res.status(403).json({ message: 'Invalid model' });
  }

  matchingAction.handler(
    req.body.item_ids,
    req.body.data,
    json => {
      res.json(json || {});
    },
    json => {
      res.status(403).json(json || {});
    }
  );
};