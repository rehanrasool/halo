/**
 * GET /
 * Redeem page.
 */
exports.getRedeem = (req, res) => {
  res.render('redeem', {
    title: 'Redeem'
  });
};
