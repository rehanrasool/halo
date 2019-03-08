/**
 * GET /
 * Cards page.
 */
exports.getCards = (req, res) => {
  res.render('cards', {
    title: 'Cards'
  });
};
