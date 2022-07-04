module.exports = (_conf, api) => {
  const fnHelper = require('../helpers/functions')(_conf);

  const getMatching = async (req, res) => {
    const modelSlug = req.params.model;
    const items = req.query.ids || '';
    const target = req.query.target || '';

    if (!items || typeof items !== 'string' || !target || !['item', 'bulk'].includes(target)) {
      return res.status(403).json({ message: 'Invalid request' });
    }

    const currentModel = fnHelper.getModelObject(modelSlug);
    if (!currentModel || !items) {
      return res.status(403).json({ message: 'Invalid request' });
    }

    // Get model options
    const currentModelOptions = fnHelper.getModelOptions(modelSlug);
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

    const currentModelActions = fnHelper.getModelActions(modelSlug, req.modelPermData.can_use_actions);
    if (!currentModelActions || currentModelActions.length === 0) {
      return res.json({ list: actionsList });
    }

    // Ids list
    const itemsArray = items.split(',');

    // Get corresponding items
    const itemsDB = await api.modelGetIn(modelSlug, itemsArray);

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

  const getExecute = (req, res) => {
    const modelSlug = req.params.model;
    const caCode = req.params.ca;

    const currentModel = fnHelper.getModelObject(modelSlug);
    if (!currentModel) {
      return res.status(403).json({ message: 'Invalid request' });
    }

    const matchingModel = _conf.models.find(m => m.slug === modelSlug);
    if (!matchingModel || !matchingModel.actions || !Array.isArray(matchingModel.actions)) {
      return res.status(403).json({ message: 'Invalid model' });
    }

    const matchingAction = matchingModel.actions.find(action => action.code === caCode);
    if (!matchingAction || !matchingAction.handler || typeof matchingAction.handler !== 'function') {
      return res.status(403).json({ message: 'Invalid model' });
    }

    // Construct where clause
    const whereClause = api.getModelWhereClause(currentModel, req.body.item_ids);

    const attrs = {
      ids: req.body.item_ids,
      data: req.body.data,
      whereClause
    };

    matchingAction.handler(
      attrs,
      json => {
        res.json(json || {});
      },
      json => {
        res.status(403).json(json || {});
      }
    );
  };

  return {
    getMatching,
    getExecute
  }
};
