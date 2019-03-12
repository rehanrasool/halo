var request = require('request');

// var parent="c2e632ad-ab41-42b8-9d9e-9091e170aa4d";
// var parent="e1187d4e-991d-4bb0-9339-9ab0425819e6";
var parent="d3b824ab-9621-4cb2-95ab-b2282e66ffe5";

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
  // console.log(req.body);

  // -------------------------- USER INPUT ---------------------------- //
  var amount = req.body.amount;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var birthdate = req.body.birthdate;
  var address = req.body.address;
  var city = req.body.city;
  var state = req.body.state;

  console.log("\n\n\n##### send halo card to: "+firstname+" "+lastname+"\n");

  var headers = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Basic dXNlcjU0OTYxNTQ4NTQ5MDg1OmI4ZTI2YWViLTg3Y2QtNDI1ZS05NzI1LTI5ODU0MzY3YmU2NA=='
  };

  // -------------------------- CREATE USER ---------------------------- //
  var userData = '{"parent_token":"'+parent+'","first_name":"'+firstname+'","last_name":"'+lastname+'","email":"'+email+'","birth_date":"'+birthdate+'","address1":"'+address+'","address2":"'+address+'","city":"'+city+'","state":"'+state+'","country":"US"}';

  var userOptions = {
      url: 'https://shared-sandbox-api.marqeta.com/v3/users/',
      method: 'POST',
      headers: headers,
      body: userData
  };

  // -------------------------- CREATE CARD PRODUCT ---------------------------- //

  var cardProductName = "halo-card-product-1";
  var cardProductStartDate = "2019-01-01";
  var cardProductData = '{"name":"'+cardProductName+'","start_date":"'+cardProductStartDate+'","config":{"fulfillment":{"payment_instrument":"VIRTUAL_PAN"},"card_life_cycle":{"activate_upon_issue" : true,"expiration_offset": {"unit": "YEARS","value": 51}}}}';

  var cardProductOptions = {
      url: 'https://shared-sandbox-api.marqeta.com/v3/cardproducts/',
      method: 'POST',
      headers: headers,
      body: cardProductData
  };

  // -------------------------- CREATE CARD ---------------------------- //

  var cardUserToken; // filled through callback
  var cardProductToken; // filled through callback

  var cardOptions = {
      url: 'https://shared-sandbox-api.marqeta.com/v3/cards/',
      method: 'POST',
      headers: headers,
      // body: cardData
  };

  // -------------------------- CREATE VELOCITY CONTROL ---------------------------- //

  var velocityControlOptions = {
      url: 'https://shared-sandbox-api.marqeta.com/v3/velocitycontrols/',
      method: 'POST',
      headers: headers,
      // body: velocityControlData
  };

  function velocityControlCallback(error, response, body) {
      if (!error && response.statusCode == 201) {
        console.log("##### velocity control: success");
        // console.log(body);
      } else {
        console.log("##### velocity control: failure");
        console.log(response);
        console.log(error);
      }
  }

  function createCardCallback(error, response, body) {
      if (!error && response.statusCode == 201) {
        console.log("##### card: success");
        // console.log(body);

        // create velocity control for the card
        var velocityControlData = '{"association":{"user_token":"'+cardUserToken+'"},"amount_limit":"'+amount+'","velocity_window":"LIFETIME","currency_code":"USD"}';
        velocityControlOptions['body']=velocityControlData;
        request(velocityControlOptions, velocityControlCallback);
      } else {
        console.log("##### card: failure");
        console.log(response);
        console.log(error);
      }
  }

  function createCardProductCallback(error, response, body) {
      if (!error && response.statusCode == 201) {
        console.log("##### card product: success");
        // console.log(body);
        data = JSON.parse(body);
        cardProductToken = data['token'];

        // create card for user
        var cardData = '{"user_token":"'+cardUserToken+'","card_product_token":"'+cardProductToken+'"}';
        cardOptions['body']=cardData;
        request(cardOptions, createCardCallback);
      } else {
        console.log("##### card product: failure");
        console.log(response);
        console.log(error);
      }
  }

  function createUserCallback(error, response, body) {
      if (!error && response.statusCode == 201) {
        // console.log(body);
        data = JSON.parse(body);
        cardUserToken = data['token'];

        // create card product
        request(cardProductOptions, createCardProductCallback);
      } else {
        console.log("##### user: failure");
        console.log(error);
        console.log(response);
      }
  }

  request(userOptions, createUserCallback); // create user

  return res.redirect('/');
};
