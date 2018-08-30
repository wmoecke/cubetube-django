//this file is in charge of going through the vizs in the gallery and starting each sketch

function activatePreviews(){
  $("canvas.js-preview:not(.canvas-active)").each(function(){
        console.log( "hi" );
	  var id=$(this).attr('id');
	  var canvas=$(this)[0];
	  var type=$(this).attr("type");
	  var interactive=$(this).attr("interactive");
	  var source=$("div.code#viz"+id).text();
//      console.log(type);
//      console.log(interactive);
      if(interactive==="False"){
	  try{
	  if(type==="javascript")
	      runSketch(canvas, source);
	  if(type==="L3D")
	      runL3DSketch(canvas, source);
	  }
	  catch(err)
	  {
	      console.log(err);
	  }
      }
      });
}

function activateAdditionalPreviews(data){
    thumbnails=$(data);
    console.log(data);
  thumbnails.find("canvas.js-preview").each(function(){
	  var id=$(this).attr('id');
	  var canvas=$(this)[0];
	  var type=$(this).attr("type");
	  var interactive=$(this).attr("interactive");
	  var source=thumbnails.find("div.code#viz"+id).text();

      if(interactive==="False"){
	  try{
	  if(type==="javascript")
	      runSketch(canvas, source);
	  if(type==="L3D")
	      runL3DSketch(canvas, source);
	  }
	  catch(err)
	  {
	      console.log(err);
	  }
      }

      $(this).addClass('canvas-active');
    });
}