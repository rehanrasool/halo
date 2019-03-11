/**
 * GET /
 * Cards page.
 */
exports.getCards = (req, res) => {
  res.render('cards', {
    title: 'Cards'
  });
};

var request = require('request');

// -------------------------- CONFIGS ---------------------------- //

var parent="c2e632ad-ab41-42b8-9d9e-9091e170aa4d";

var headers = {
  'accept': 'application/json',
  'Authorization': 'Basic dXNlcjU0OTYxNTQ4NTQ5MDg1OmI4ZTI2YWViLTg3Y2QtNDI1ZS05NzI1LTI5ODU0MzY3YmU2NA=='
};

// -------------------------- GET HALO USERS ---------------------------- //

var getUsersOptions = {
  url: 'https://shared-sandbox-api.marqeta.com/v3/users/' + parent + '/children?count=2&start_index=0&sort_by=-lastModifiedTime',
  headers: headers
};

// -------------------------- GET HALO CARDS ---------------------------- //

var getCardsOptions = {
  headers: headers
};

// -------------------------- GET VELOCITY CONTROL ---------------------------- //

var getVelocityControlsOptions = {
  headers: headers
};

// -------------------------- CALLBACKS ---------------------------- //

users = []

function getVelocityControlsCallback(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("##### get velocity control: success");
    body = JSON.parse(body);
    console.log(body);
    for (i = 0; i < users.length; i++) {
      if (users[i]['token'] == body.data[0]['association']['user_token']) {
        users[i]['velocity_control']=body.data[0];
      }
    }
    console.log(users);
  } else {
    console.log("##### get velocity control: failure");
    console.log(error);
    console.log(response);
  }
}

function getCardsCallback(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("##### get cards: success");
    body = JSON.parse(body);
    console.log(body);
    for (i = 0; i < users.length; i++) {
      if (users[i]['token'] == body.data[0]['user_token']) {
        users[i]['card']=body.data[0];
        users[i]['card']['pan_hidden']='xxxx-xxxx-xxxx-'+users[i]['card']['last_four'];
        users[i]['card']['cvv']=users[i]['card']['barcode'].substring(0,3);
      }
    }
    console.log(users);
  } else {
    console.log("##### get cards: failure");
    console.log(error);
    console.log(response);
  }
}

function getUsersCallback(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("##### get users: success");
    body = JSON.parse(body);
    var i;
    for (i = 0; i < body.count; i++) {
      users.push(body.data[i]);

      // get card for user
      getCardsOptions['url']='https://shared-sandbox-api.marqeta.com/v3/cards/user/' + body.data[i]['token'];
      request(getCardsOptions, getCardsCallback);

      // get velocity control for user
      getVelocityControlsOptions['url']='https://shared-sandbox-api.marqeta.com/v3/velocitycontrols?user='+body.data[i]['token'];
      request(getVelocityControlsOptions, getVelocityControlsCallback);
    }
    console.log(body);
  } else {
    console.log("##### get users: failure");
    console.log(error);
    console.log(response);
  }
}

request(getUsersOptions, getUsersCallback);

// return res.redirect('/');
