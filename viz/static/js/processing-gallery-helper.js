var library;
var mouseListener="void mouseOut() {noLoop();}void mouseOver() {loop();}";

$.ajax({
    url: '/static/js/l3d-library.js',
    dataType: 'text',
    success: function(data){
	library=data;
	activatePreviews();
    },
    done: function(data){
	library=data;
	activatePreviews();
    },
    cache: false
});

(function(global) {
   
  function waitForExit() {
    var checkbox = document.getElementById('expect-exit-callback');
    if (!checkbox) {
      return false;
    }
    return checkbox.checked || checkbox.value;
  }

  global.runSketch = function(canvas, sketchCode) {
      console.log("running javascript sketch id#"+canvas.id);
      sketchCode=sketchCode.concat(mouseListener).concat(library);
	var sketchLines=sketchCode.split('\n');
	sketchCode="";
	var setup=false, setupStarted=false;
	for(var i=0;i<sketchLines.length;i++)
	{
	    if(sketchLines[i].indexOf("size(500,500, P3D);")==-1)  //stray size() arguments break the viz
		sketchCode+=sketchLines[i]+'\n';
	    if(!setup)
		if(sketchLines[i].indexOf("setup()")!=-1)
		    setup=true;
	    if((setup)&&(!setupStarted))
	       {
		if(sketchLines[i].indexOf("{")!=-1)
		   {
		       setupStarted=true;
		       sketchCode+="\nsize("+canvas.width+","+canvas.height+",P3D);\nsmooth();\nnoLoop();\n";  //insert the boilerplate
		   }
	       }
	}
      var sketch = Processing.compile(sketchCode);
      instance = new Processing(canvas, sketch);
  };

  global.runL3DSketch = function(canvas, sketchCode) {
  try {
      console.log("running L3D sketch id#"+canvas.id);
      var translatedCode=translateCode(sketchCode);
      var sketchCode=translatedCode.concat(mouseListener).concat(library);
      sketchCode=sketchCode.replace("size(500,500, P3D);", "\nsize("+canvas.width+","+canvas.height+", P3D);\nnoLoop();");
    var sketch = Processing.compile(sketchCode);
    instance = new Processing(canvas, sketch);
  } catch (e) {
    console.log("Error! Error was:\n" + e.toString());
  }
};

 
}(window));
