$(function(){
    $("#flashCube").click( function(e){
	e.preventDefault();  //prevent the page from reloading
	flash($("#binaryPath").val());
    });
});

function flash(binary){
    var binaryPath=$("#binaryPath").val());
    window.spark.flashCore([binary], function(err, data) {
    	if (err) {
    	    console.log('An error occurred while flashing the core:', err);
        } else {
    	   console.log('Core flashing started successfully:', data);
        }
    });
}
