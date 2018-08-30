
var library;
$.get('/static/js/l3d-library.js', function(data) {
    library=data;
}, 'text');

var editing = false;

$(function(){

    $.get("/");

});

function checkProgramValidity(data){
    var vizType = data['viz-type'];
    var code=data['sourceCode'];
        if( vizType === 'L3D') {
            compileCode();
        } else if ( vizType === 'JS' ) {
	    try{
		runSketch();
	    }
	    catch(err){
		console.log(err);
		makePrivate();
	    }
        }

}

function compileCode(){
    var request=$.ajax({
	type:"POST",
	url:"/justCompile/",
	data: {"code": $(".code").val(), "accessToken":accessToken, "coreID":$("#cubeName").val()},
	dataType:"text",
	success: function(data){
	    data = $.parseJSON(data);
	    console.log(data);
	    output="";
	    if(data.compilation_status==="ok")
	    {
		output+="compilation status:  ok\n";
		output+="flashing status: "+data.flash_output;
	    }
	    else
	    {
		output+="compilation status: "+data.compilation_status+"\nerrors:\n"+data.error+"\n";
		makePrivate();
	    }
	    $("textarea.output").val(output);
	},
	error: function(data){
	    console.log("fail");
	    console.log(data);
	}
    });
}

function makePrivate(){
    console.log("viz doesn't run -- making it private");
}

function checkDataAfterSave( data ) {
    
    if ( data.success ) {
        alert("Viz Updated!");
    } else {
        console.log( "Error!", data );
    }
}

function checkData( data ) {

    // console.log( data );
    // var data = JSON.parse(data.responseText);
    if ( data.success ) {
        onCreateSuccess( data.id );
    } else {
        console.log( "Error!", data );
    }
}

// Switch to "fork" mode
function onCreateSuccess( id ) {
    
    editing = true;
    $( '.create-wrapper' ).attr('viz-id', id);
    $('.save-code').html('Update Viz');
    alert("Viz Created!");
}

function validate(data) {

    if( data.name === '') {
        showConsoleError("Oh no, you need a viz name!");
        return false;
    }

    if( data.description === '') {
        showConsoleError("Aww, snap, we need a description to save this!");
        return false;
    }


    if( data.sourceCode === '') {
        showConsoleError("Hey, we need some code to save this!");
        return false;
    }

    if( data.interactive === true && ( data.videoURL.indexOf("youtube") == -1) ) {
        showConsoleError("Oh no, this interactive viz needs a youtube url to save!");
        return;
    }

    return true;
}

function showConsoleError( error ) {
    $('.console').val( error );
}

function getEditVizType() {

    var type;
    var $onElement = $('.viz-type .on');
    var onVal = $onElement.html();
    return onVal;
}

function getData() {

    var name = $('.viz-name').val();
    var description = $('.description').val();
    var published = ($('.published .on').html() === 'Public');
    var interactive = ($('.interactive .on').html() === 'Yes');
    var videoURL = $( '.video-url' ).val();

    var vizType = getEditVizType();
    if( vizType === 'JS') {
        vizType = 'javascript';
    } else {
        vizType = 'L3D'
    }

    var code = $('.code').val();

    return {
        name: name,
        description: description,
        published: published,
        interactive: interactive,
        "viz-type": vizType,
        videoURL: videoURL,
        sourceCode: code
    }
}