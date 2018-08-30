/*jslint node: true */
"use strict";

var spark =require('spark');
var accessToken=process.argv[2];
var deviceID=process.argv[3];
//var directory=process.argv[4];

//once we've logged in, program the core with the given core ID with a given binary located in the uploads directory of the server                                                   
spark.on('login', function() {
    spark.getDevice(deviceID, function(err, device) {
	device.flash(['./library/beta-cube-library.cpp', './library/beta-cube-library.h', './library/neopixel.cpp', './library/neopixel.h', './application.ino'], function(err, data) {
	    if (err) {
		console.log('An error occurred while flashing the device:', err);
	    } else {
		console.log('Device flashing started successfully:', data);
	    }
	});
    });

});

// Login first with the access token                                                                                                                                                 
spark.login({ accessToken: accessToken });

