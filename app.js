var winston								= require('winston');
var express								= require('express');
var cors 									= require('cors'); 
var bodyParse							= require('body-parser');
var multer								= require('multer');
var path									= require('path');
var glob									= require('glob');
var _											= require('underscore');
var methodOverride 		    = require('method-override')
var router 								= express.Router();
var crypto 								= require('crypto');
var moment 								= require('moment');

GLOBAL.logger = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)({
			timestamp: true
		})
	]
});

var app = express();

// Setup app with http body parsing, multibody (file upload) management, method overrides, and a static folder.
app.use(methodOverride('_method'))
app.use(bodyParse.urlencoded({
	extended: true
}));

var upload = multer({dest: 'uploads/'}); 

router.get('/', function(req, res){
	res.send("File Service is running...");
});

var validateSignature = function(req, res, next){
	const hmac = crypto.createHmac('sha256', 'secret-user-thing');
	hmac.update(req.body.circle);
	hmac.update(moment().format('YYYYMMDD')); 
	const localSignature = hmac.digest('hex'); 
	if(localSignature === req.body.signature){
		next()
	}else{
		res.status(401); 
		res.end();
	}
}

router.post('/', cors(), upload.array('files'), validateSignature, function(req, res){
	console.log(req.files);
	// Here - save files!
	res.send({}); 
});

router.options('/', cors()); 

app.use(router);

module.exports = app