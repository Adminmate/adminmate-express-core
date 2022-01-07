const { Parser } = require('json2csv');
const fnHelper = require('../helpers/functions');

module.exports.exportCSV = api => {
  return async (req, res) => {
    const modelName = req.params.model;
    const itemIds = req.body.data.ids;

    if (!itemIds || !itemIds.length) {
      return res.status(403).json({ message: 'Invalid request' });
    }

    const currentModel = fnHelper.getModelObject(modelName);
    if (!currentModel) {
      return res.status(403).json({ message: 'Invalid request' });
    }

    // Get corresponding items
    const itemsDB = await api.modelGetIn(modelName, itemIds);

    if (!itemsDB) {
      return res.status(403).json({ message: 'No item selected' });
    }

    const fields = Object.keys(itemsDB[0]);
    const json2csv = new Parser({ fields, header: false });
    const csv = json2csv.parse(itemsDB);

    // Add the quote-free csv header
    const finalCsv = fields.join(',') + '\n' + csv;

    res.json({
      action: 'download',
      data: finalCsv,
      filename: `export-${modelName}.csv`
    });
  };
};
