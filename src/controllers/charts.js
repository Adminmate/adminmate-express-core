module.exports.execute = (req, res) => {
  const chartCode = req.params.chart_code;

  if (!chartCode) {
    return res.status(403).json({ message: 'Invalid request' });
  }

  const matchingChart = global._amConfig.charts
    .find(chart => chart.code === chartCode);

  if (!matchingChart) {
    return res.status(403).json({ message: 'Invalid model' });
  }

  if (!matchingChart.handler) {
    return res.status(403).json({ message: 'This custom chart does not have any handler function' });
  }

  matchingChart.handler(
    req.body.data,
    json => {
      res.json(json || {});
    },
    json => {
      res.status(403).json(json || {});
    }
  );
};