/**
 * GET /
 * Cards page.
 */
exports.getCards = (req, res) => {
  res.render('cards', {
    title: 'Cards'
  });

  var parent="c2e632ad-ab41-42b8-9d9e-9091e170aa4d";

  var request = require('request');

  var headers = {
    'accept': 'application/json',
    'Authorization': 'Basic dXNlcjU0OTYxNTQ4NTQ5MDg1OmI4ZTI2YWViLTg3Y2QtNDI1ZS05NzI1LTI5ODU0MzY3YmU2NA=='
  };

  var options = {
    url: 'https://shared-sandbox-api.marqeta.com/v3/users/' + parent + '/children?count=50&start_index=0&sort_by=-lastModifiedTime',
    headers: headers
  };
  users = []
  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      var i;
    for (i = 0; i < body.count; i++) { 
      var user = {first_name:""};
      // user['first_name'] = body.data[i].first_name; 
      users.push(body.data[i]);
    }
    console.log(body);
      console.log("> success");
    } else {
      console.log("> failure");
      console.log(error);
      console.log(response);
    }
  }

  request(options, callback);

};




// return res.redirect('/');
