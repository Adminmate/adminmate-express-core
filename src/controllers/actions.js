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

    // Add export ability
    if (target === 'bulk') {
      actionsList.push({
        label: 'Export CSV',
        code: 'export_csv'
      });
    }

    if (authorizedToDeleteRegardingOptions && authorizedToDelete) {
      actionsList.push({
        label: target === 'item' ? 'Delete' : 'Delete selected',
        code: 'delete'
      });
    }

    const currentModelActions = fnHelper.getModelActions(modelName, req.modelPermData.can_use_actions);
    if (!currentModelActions || currentModelActions.length === 0) {
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
    const actionsFilteredByTarget = currentModelActions
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
      actionsFilteredByTarget.forEach(sa => {
        // If the filter do not pass, remove the actions from the list
        if (typeof sa.filter === 'function' && sa.filter(item) === false) {
          sa.passFilter = false;
        }
      });
    });

    // We only keep valid actions
    const finalActions = actionsFilteredByTarget.filter(sa => sa.passFilter === true);

    // If there is both the native delete action and other actions, add a separator
    if (actionsList.length && finalActions.length) {
      actionsList.unshift({ type: 'separator' });
    }

    res.json({
      list: [
        ...finalActions,
        ...actionsList
      ]
    });
  };
};

module.exports.execute = (req, res) => {
  const modelSlug = req.params.model;
  const caCode = req.params.ca;

  const matchingModel = global._amConfig.models.find(m => m.slug === modelSlug);
  if (!matchingModel || !matchingModel.actions || !Array.isArray(matchingModel.actions)) {
    return res.status(403).json({ message: 'Invalid model' });
  }

  const matchingAction = matchingModel.actions.find(action => action.code === caCode);
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