"use strict";
var Promise 		= require('bluebird'); 
var fs 					= require('fs'); 
var uuid 				= require('node-uuid');
var _ 					= require('underscore'); 
var mkdirp 			= Promise.promisify(require('mkdirp'));
var path 				= require('path'); 
var url 				= require('url'); 
var redis 			= require('redis'), client = redis.createClient();


class FileManager{

	initialize(){

	}

	storeFiles(files, data){
		return Promise.all(_.map(files, (file) => {
			return this.store(file, data);
		})).then(files => {
			return {
				"files": _.map(files, function(file){
					console.log(file);
					return {
						name: 			file.originalname, 
						size: 			file.size, 
						url: 				file.url, 
						deleteUrl: 	file.deletionURL, 
						deleteType: "DELETE"
					}
				})
			}
		});
	}

	store(file, data){
		const destination = path.join(__dirname, file.destination, data.context); 
		return mkdirp(destination).then(() => {
			return new Promise(function(resolve, reject){
				fs.rename(path.join(__dirname, file.path), path.join(destination, file.originalname), function(err){
					if(err){
						reject(err);
					}else{
						resolve();
					}
				})				
			})
		}).then(() => {
			file.location 		= destination
			file.url 					= "http://localhost:4000" + path.join("/uploads", data.context, file.originalname)
			file.deletionURL	= "http://localhost:4000" + path.join("/delete", data.context, file.originalname)
			return file
		});
	}

	deleteFile(data){
		const destination = url.parse(data.file); 
		// This is of course super-temporary, we should verify here that
		// this file is allowed to be deleted!
		return new Promise(function(resolve, reject){
			fs.unlink(path.join(".", destination.path), function(err){
				if(err){
					reject(err);
				}else{
					resolve();
				}
			}); 
		});
	}

	fetch(key){

	}

}

module.exports = new FileManager();