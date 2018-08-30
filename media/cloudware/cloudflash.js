/*jslint node: true */
"use strict";

var spark=require('spark');
var accessToken=process.argv[2];
var deviceID=process.argv[3];
var filename=process.argv[4];
var vizLib=process.argv[5];

//once we've logged in, program the core with the given core ID with a given binary located in the uploads directory of the server                                                   
spark.on('login', function() {
    spark.getDevice(deviceID, function(err, device) {
        if(vizLib=='NEOPIXEL')
            device.flash(['./library/beta-cube-library.cpp', './library/beta-cube-library.h', './library/neopixel.cpp', './library/neopixel.h', filename], 
                function(err, data) {
                    if (err) {
                        console.log(JSON.stringify(err));
                    } else {
                        console.log(JSON.stringify(data));
                    }
            });
        else
            device.flash(['./library/beta-cube-library-fastled.cpp', './library/beta-cube-library-fastled.h', './library/FastLED.cpp', './library/FastLED.h', './library/bitswap.h', './library/chipsets.h', './library/clockless_arm_stm32.h', './library/color.h', './library/colorpalettes.cpp', './library/colorpalettes.h', './library/colorutils.cpp', './library/colorutils.h', './library/controller.h', './library/delay.h', './library/dmx.h', './library/fastled_arm_stm32.h', './library/fastled_config.h', './library/fastpin.h', './library/fastpin_arm_stm32.h', './library/fastspi.h', './library/fastspi_bitbang.h', './library/fastspi_dma.h', './library/FastSPI_LED2.h', './library/fastspi_nop.h', './library/fastspi_ref.h', './library/fastspi_types.h', './library/hsv2rgb.cpp', './library/hsv2rgb.h', './library/led_sysdefs.h', './library/led_sysdefs_arm_stm32.h', './library/lib8tion.cpp', './library/lib8tion.h', './library/noise.cpp', './library/noise.h', './library/pixeltypes.h', './library/platforms.h', './library/power_mgt.cpp', './library/power_mgt.h', './library/wiring.cpp', filename], 
                function(err, data) {
                    if (err) {
                        console.log(JSON.stringify(err));
                    } else {
                        console.log(JSON.stringify(data));
                    }
            });
    });

});

// Login first with the access token                                                                                                                                                 
spark.login({ accessToken: accessToken });

