/*jslint node: true */
"use strict";

var spark =require('spark');
var accessToken=process.argv[2];
var coreID=process.argv[3];
var binaryPath=process.argv[4];

//once we've logged in, program the core with the given core ID with a given binary located in the uploads directory of the server
spark.on('login', function() {

      // callback to be executed by each core
	    var signalCb = function(err, data) {
		if (err) {
		    console.log('An error occurred while flashing the core:', err);
		} else {
		    console.log('Core flashing started successfully:', data);
		}
	    };

	    console.log("trying to flash core");
    spark.flashCore(coreID, binaryPath, signalCb);
});

// Login first with the access token
spark.login({ accessToken: accessToken });