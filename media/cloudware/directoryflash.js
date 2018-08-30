/*jslint node: true */
"use strict";

var spark =require('spark');
var accessToken=process.argv[2];
var deviceID=process.argv[3];
var directory=process.argv[4];

var walk    = require('walk');
var files   = [];

// Walker options
var walker  = walk.walk(directory, { followLinks: false });

walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    files.push(root + '/' + stat.name);
    next();
});


//once we've logged in, program the core with the given core ID with a given binary located in the uploads directory of the server                                                   
spark.on('login', function() {
    spark.getDevice(deviceID, function(err, device) {
	device.flash(files, function(err, data) {
	    if (err) {
		console.log(err);
	    } else {
		console.log(data);
	    }
	});
    });

});

// Login first with the access token                                                                                                                                                 
walker.on('end', function() {
    spark.login({ accessToken: accessToken });
});

