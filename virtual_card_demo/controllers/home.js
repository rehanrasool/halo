var request = require('request');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

/**
 * POST /sendCard
 * Send a contact form via Nodemailer.
 */
exports.sendCard = (req, res) => {
  console.log("send halo card!");

  var request = require('request');

  var headers = {
      'accept': 'application/json',
      'Authorization': 'Basic dXNlcjU0OTYxNTQ4NTQ5MDg1OmI4ZTI2YWViLTg3Y2QtNDI1ZS05NzI1LTI5ODU0MzY3YmU2NA=='
  };

  var options = {
      url: 'https://shared-sandbox-api.marqeta.com/v3/cards/1234',
      headers: headers
  };

  function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("> success");
        console.log(body);
      } else {
        console.log("> failure");
        console.log(error);
        console.log(response);
      }
  }

  request(options, callback);

  return res.redirect('/');
};
