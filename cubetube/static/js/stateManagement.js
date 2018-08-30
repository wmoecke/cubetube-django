/**
 * Javascript state management. For applicable areas.
 * - Viz page cube management
 */

var isActive = true;

window.onfocus = function () {
    isActive = true;
};
window.onblur = function () {
    isActive = false;
};

$(function(){
	checkCookie();
	// If user is logged in, check for cubes via spark.
		$cubeOptions = $( '.cube-options' );
	if( $cubeOptions.length ) {
	    listCubes();
		setInterval('listCubes()', 15000);  //update the list of cubes every 15 seconds
	    }
	else
	    console.log("no cube options");
    })

function listCubes() {

    var devicesPr = spark.listDevices();
    var deviceInList = false;
    var deviceID;
    var connectedCores = 0;

    devicesPr.then(

        function(devices){
	    $("#cubeName").empty();//clear the list
//            console.log('Devices: ', devices);
            for( var i = 0; i < devices.length; i++ ) {
        
                var device = devices[i];
//		    console.log(device.name+" "+device.connected+" "+device.productId);
                if( device.connected ){
                    connectedCores++;
                
                    if( deviceID != 'undefined' ) {
                        deviceID=device.id;
//                         console.log(deviceID);
                    }

//                     console.log(device.name+" is connected");
		    deviceType=device.productId;
		    if(deviceType=='0')
			deviceType="Core";
		    else
			deviceType="Photon";
                    $("#cubeName").append($("<option></option>").val(device.id).attr("processor", deviceType).html("("+deviceType+") "+device.name));  //append the cube name and ID to thr dropdown list
		    
                    if(device.name == coreID) {
                        deviceInList = true;
                    }
                }
            }

            if( deviceInList == true ) {
                 $('#cubeName').val(coreID);     
            } else {
                 $('#cubeName').val(deviceID);       
                coreID = deviceID;
                var date = new Date();
                 $.cookie("coreID", coreID, { expires: date.getTime()+86400 , path: '/'});   
            }
    
            if(devices.length==0) {
                $("#cubeName").append($("<option></option>").html('Add a core to get started'));  //append the cube name and ID to thr dropdown list
            } else if(connectedCores==0) {
                 $("#cubeName").append($("<option></option>").html('No cores online :('));  //append the cube name and ID to thr dropdown list
            }
        },
        function(err) {
//             console.log('List devices call failed: ', err);
        }
    );
}

