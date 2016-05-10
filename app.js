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
var FileStorage 					= require('./filestorage'); 

GLOBAL.logger = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)({
			timestamp: true
		})
	]
});

var app = express();

app.use(methodOverride('_method'))
app.use(bodyParse.urlencoded({
	extended: true
}));

var upload = multer({dest: 'uploads/'}); 

app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

router.get('/', function(req, res){
	res.send("File Service is running...");
});

var validateSignature = function(req, res, next){
	// Secret-user-thing is something fetched based on the passed authentication-token from
	// the user service. It's a user-specific salt which should be tied to the users password (that is, if a user
	// changes their password, the salt must be updated as well). It's never displayed in the raw form to the user. 
	const hmac = crypto.createHmac('sha256', 'secret-user-thing');
	// Note here that we're using the circle-id as part of the hmac, which verifies the context of the upload. 
	// In theory, one could pass along almost anything as part of the hmac - anything that should be verified as 
	// part of the "correct" context.
	hmac.update(req.body.circle);
	// We're also adding the date in order to prevent replay-attacks. This timestamp should be as narrow as UX allows.
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
	FileStorage.storeFiles(req.files, req.body).then((data) =>{
		res.send(data); 
	}).catch(err => {
		logger.error(err); 
		process.exit(1);
	})
});

router.delete('/delete', cors(), validateSignature, function(req, res){
	FileStorage.deleteFile(req.body).then(() => {
		res.status(200); 
		res.end();
	}).catch(err => {
		if(err.errno == -2){
			res.status(204); 
		}else{
			res.status(500); 			
		}
		res.end();
	})
});

router.options('/', cors()); 
router.options('/delete', cors()); 

app.use(router);

module.exports = app