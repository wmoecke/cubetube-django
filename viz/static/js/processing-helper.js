(function(global) {
    
  var canvas = document.querySelector('.sketch'),
    output = document.querySelector('.output'),
    instance = null;

  function createCanvas() {

    // Make a new canvas, in case we're switching from 2D to 3D contexts.
    var sketch = document.querySelector('.demo-canvas');
    var container = sketch.parentNode;
    container.removeChild(sketch);

    sketch = document.createElement('canvas');
    sketch.id = 'sketch';
    sketch.className = 'demo-canvas';
    container.appendChild(sketch);

    return sketch;
  }

  function waitForExit() {
    var checkbox = document.getElementById('expect-exit-callback');
    if (!checkbox) {
      return false;
    }
    return checkbox.checked || checkbox.value;
  }

global.runSketch = function(callback) {
	  var output=$("textarea.output");
    try {
          canvas = createCanvas();
          var sketchCode=$(".code").val().concat(library);
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
		       sketchCode+="size(500,500,P3D);\nsmooth();\n";  //insert the boilerplate
		   }
	       }
	}
      var sketch = Processing.compile(sketchCode);
        instance = new Processing(canvas, sketch);
    } catch (err) {
/*
	// for firefox / opera 
	var linenumber = parseInt(err.lineNumber); 

	// for webkit 
	if (!linenumber) linenumber = parseInt(err.line); 

	if (linenumber) { 
	    linenumber = "Processing.js error on line "+(linenumber-2); 
	} else { 
	    // for chrome 
	    linenumber = ""; 
	} 
*/
	$("textarea.output").val(err);//+"\n"+linenumber);
	console.log(err);
	//output.val(linenumber + err); 
	// so firebug can still catch it 
	throw(err); 
    }
  };

global.runSparkSketch = function(callback) {
  var output=$(".output");
  try {
      canvas = createCanvas();
      var sketchCode=$(".code").val();
      var translatedCode=translateCode(sketchCode);
      sketchCode=translatedCode.concat(library);
//      console.log(translatedCode);
 //     console.log(sketchCode);
    var sketch = Processing.compile(sketchCode);
      instance = new Processing(canvas, sketch);
  } catch (err) {
  /*    
	// for firefox / opera 
	var linenumber = err.lineNumber; 

	// for webkit 
	if (!linenumber) linenumber = err.line; 

	if (linenumber) { 
	    linenumber = "Processing.js error on line "+linenumber+".<br />"; 
	} else { 
	    // for chrome 
	    linenumber = ""; 
	}
*/
//      console.log(linenumber);
	console.log(err);
//	output.val(linenumber + err); 
	// so firebug can still catch it 
	//	throw(err); 
	//    output.val("Error! Error was:\n" + e.toString());
  }
};

  global.convertToJS = function() {
    try {
      output.value = js_beautify(Processing.compile(code.value).sourceCode).replace(/\n\n\n+/g, '\n\n');
      var l, last, count=5;
      for(l=0, last=output.value.length; l<last; l++) {
        if(output.value[l]==="\n") {
          count++;
        }
      }
      output.setAttribute("rows", count);
      output.select();
    } catch (e) {
      output.value = "Parser Error! Error was:\n" + e.toString();
    }
  };

  global.generateDataURI = function() {
    // Run the sketch first, in case the user hasn't
    runSketch();
    output.value = canvas.toDataURL();
    output.select();
  };

  function buildRefTest() {
    try {
      // if the test was 2d, we can just call getImageData
      if (!instance.use3DContext) {
        var context = canvas.getContext('2d');
        var imgData = context.getImageData(0, 0, canvas.width, canvas.height).data;
      // else, we'll need to call WebGL's readPixels.
      } else {
        // The order of the pixels go from bottom to top, left to right.
        var context = canvas.getContext("experimental-webgl");
        var imgData = new Uint8Array(canvas.width * canvas.height * 4);
          context.readPixels(0, 0, canvas.width, canvas.height, context.RGBA, context.UNSIGNED_BYTE, imgData);
        }

        var pixels = [];
        for(var i = 0, idl = imgData.length; i < idl; i++) {
          pixels[i] = imgData[i];
        }

        var dimensions = "[" + canvas.width + "," + canvas.height + "]";
        // Opera doesn't have btoa() so this won't work there.
        document.location.href= "data:text/plain;charset=utf-8;base64," +
          btoa('//' + dimensions + pixels + '\n' + code.value);
    } catch (e) {
        output.value = "Error creating ref test! Error was: " + e.toString();
    }
  };

  global.generateRefTest = function() {
    // Run the sketch first, in case the user hasn't
    runSketch(buildRefTest);
  };

}(window));
