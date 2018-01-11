/*
 * Author: Rohit Kumar
 * Date: 22-07-2015
 * App Name: Nodejs-Paypal
 * Website: iamrohit.in
 * Description: Program to Integrate paypal payment gateway in nodejs
 */
var http=require('http');
var express    = require("express");
var paypal = require('paypal-rest-sdk');
var bodyParser = require('body-parser');
var app = express();
var transaction_values = [];
var port = Number(process.env.PORT || 5000);
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));
app.locals.baseurl = 'http://localhost:5000';
 
// paypal auth configuration
var config = {
  "port" : 5000,
  "api" : {
    "host" : "api.sandbox.paypal.com",
    "port" : "",            
    "client_id" : "AZjaFzSviZ6-QvyIPPhgETUTO301OdiXulwzY2rVXKye6SgAyQIFMkzOYu37VyE067XFA1ge-qt4mDv3",  // your paypal application client id
    "client_secret" : "EDxIJQitACq1aS8XlZ6NlJ2NYMCu9Z-h75LqcsD5UogRGWgVBOeWb1daVmIisVPYZRy_dLSfVVJD0UNF" // your paypal application secret id
  }
}
 
paypal.configure(config.api);
 
// Page will display after payment has beed transfered successfully
app.get('/success', function(req, res) {
 /// res.send("Payment transfered successfully.");
 const payerid = req.query.PayerID;
 const payment = req.query.paymentId;
 
 const execute_payment_json = {
	 "payer_id":payerid,
	 "transactions" : [{
		 "amount" :{
			"currency":transaction_values['currency'] ,
      "total":transaction_values['total']
		 }
	 }]
	 
 }
 
 paypal.payment.execute(payment, execute_payment_json,function (error, payment) {
    if (error) {
        console.log(error.response);
		throw error;
    } else {
		console.log("get response");
		console.log(JSON.stringify(payment));
		res.send("Payment transfered successfully.");
    }
});
 
 
});
 
// Page will display when you canceled the transaction 
app.get('/cancel', function(req, res) {
  res.send("Payment canceled successfully.");
});
 
app.get('/', function(req, res) {
   res.sendFile(__dirname+'/index.html');
});
 
app.post('/paynow', function(req, res) {
   // paypal payment configuration.
   transaction_values['total'] = parseInt(req.body.amount);
   transaction_values['currency'] = req.body.currency;
  var payment = {
  "intent": "sale",
  "payer": {
    "payment_method": "paypal"
  },
  "redirect_urls": {
    "return_url": app.locals.baseurl+"/success",
    "cancel_url": app.locals.baseurl+"/cancel"
  },
  "transactions": [{
    "amount": {
		"currency":transaction_values['currency'] ,
      "total":transaction_values['total']
      
    },
    "description": req.body.description
  }]
};
 
  paypal.payment.create(payment, function (error, payment) {
  if (error) {
    console.log(error);
  } else {
    if(payment.payer.payment_method === 'paypal') {
      req.paymentId = payment.id;
      var redirectUrl;
      console.log(payment);
      for(var i=0; i < payment.links.length; i++) {
        var link = payment.links[i];
		console.log(link);
        if (link.method === 'REDIRECT') {
          redirectUrl = link.href;
        }
      }
      res.redirect(redirectUrl);
    }
  }
});
});
 
// Starting server
var server = http.createServer(app).listen(port, function() {
console.log("Listening on " + port);
});