var sparkCode;
var translatedCode="";
var canvasControl="";

var translation={};
translation["loop()"]="draw()";
translation["cube.show()"]="cube.draw()";
translation["=Point("]="=new PVector(";
translation[" =Point("]="=new PVector(";
translation[" = Point("]="=new PVector(";
translation["Point"]="PVector";
translation["black)"]= "color(0x00, 0x00, 0x00))";
translation["grey)"]= "color(0x92, 0x95, 0x91))";
translation["yellow)"]= "color(0xff, 0xff, 0x14))";
translation["magenta)"]= "color(0xc2, 0x00, 0x78))";
translation["orange)"]= "color(0xf9, 0x73, 0x06))";
translation["teal)"]= "color(0x02, 0x93, 0x86))";
translation["red)"]= "color(0xe5, 0x00, 0x00))";
translation["brown)"]= "color(0x65, 0x37, 0x00))";
translation["pink)"]= "color(0xff, 0x81, 0xc0))";
translation["blue)"]= "color(0x03, 0x43, 0xdf))";
translation["green)"]= "color(0x15, 0xb0, 0x1a))";
translation["purple)"]= "color(0x7e, 0x1e, 0x9c))";
translation["white)"] = "color(0xff, 0xff, 0xff))";

translation["int "]="var ";
translation["unsigned int "]="var ";
translation["char "]="var ";
translation["unsigned char "]="var ";
translation["String "]="var ";
translation["float "]="var ";


translation["Color "]="color ";
translation["Color("]="color(";
translation["rand()"]="random(1000000)";

var parts;
var ignoreList=["include", "cube.begin", "//"];
var reserved=["if", "while", "for", "void"];
var flagList={};
flagList["Cube "]=0;
flagList["draw()"]=0;
flagList["PVector"]=0;
flagList["setup()"]=0;

function parseSparkCode( url, after ) {

    $.get(url, function(data) {

        translateCode(data);
        after();
    });
}

//not all replaceAll functions can handle code safely.  This one is a beaut!  Thanks, http://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

function translateCode( data ) {
    translatedCode = "";
    sparkCode=data.split('\n');  //sparkCode is an array of lines in the data file
    jsCode=[];
    var cubeObject;
    var cubeObjectName;
    
    for( var i=0; i<sparkCode.length; i++ ) {
        $("#sparkCode").append(sparkCode[i]+"<br/>");
        var ignoreFlag=false;
        
        for(var j=0;j<ignoreList.length;j++) {
            if(sparkCode[i].indexOf(ignoreList[j])>=0) {
                ignoreFlag=true;
            }
        }

        //if the line is valid, we should check first for function definitions
        if(ignoreFlag==false) {
            
            line=sparkCode[i];
	    
	    //no semicolon in a line, but an open parenthesis is a good indicator of a function definition
	    //!!! Has anyone reading this ever seen a syntax parser?  How do you do this for real?
	    // TODO / TO-ASK:  how does this fail if it's not a function definition line?

	    /*
	    if((line.indexOf("(")!=-1)&&(line.indexOf(";")==-1))
	    {
		var reservedFlag=false;
		for(var j=0;j<reserved.length;j++)
		    if(line.indexOf(reserved[j])>=0)
			reservedFlag=true;
		if(!reservedFlag){
		var parts=line.split(' ');
		
		//drop off the return value at the beginning of a c++ function definition and return a 
		//javascript-file function definition, with none of that type bullshit

		//  C++ style:                 int calculate(float a, char b){
		//  javascript style:          function calculate(a,b){
		line="function ";		
		for(var k=1;k<parts.length;k++)
		    line+=parts[k]+" ";
		}
	    }
	    */
	    /*
		
		//now we need to drop the types from the function definition
		var beginningOfLine=line.substring(0,line.indexOf("("));
		var parameterString=line.substring(line.indexOf("(")+1, line.indexOf(")"));
		var ending=line.substring(line.indexOf(")"));
		parameters=parameterString.split(",");
		parameterString="";
		for(int m=0;m<parameters.length;m++)
		{
		    parameterParts=parameters[m].split(' ');
		    var parameter="";
		    //remove the first word in a parameter definition, such as _int_ i or _Point_ p
		    for(int n=1;n<parameterParts.length;n++)
			parameter.append(parameterParts[n]+" ");
		    parameterString.append(parameter);
		    if(m<parameters.length-1)
			parameterString.append(",");
					 
		}
		console.log("parsed function definition)");
		line=beginningOfLine+parameterString+ending;
	    }
	    */
	    //now loop through all the translations and apply them to the line
            for(var key in translation){
		line=line.replace(key, translation[key], line);
            }

            //now add the translated line to the JS code
            jsCode.push(line)
        }
    }

    for(var i=0;i<jsCode.length;i++) {
        var line=jsCode[i];
        for(var key in flagList) {
            if(line.indexOf(key)>=0) {
                flagList[key]++;
            }
        }

        //we've initialized the cube object, let's find out its name
        if(flagList["Cube "]==1) {
            parts=line.split(/=| /);
            cubeObjectName=parts[1];
            console.log("cube object name: "+cubeObjectName);
            flagList[cubeObjectName]="0";
            line="Cube "+cubeObjectName+";";
            jsCode[i]=line;
            flagList["Cube "]=0;
        }


        if(flagList["setup()"]==1) {
            if(line.indexOf("{")>=0) {
                parts=line.split("{");
                line=parts[0]+"{"+"\nsize(500,500, P3D);\n"+cubeObjectName+"=new Cube(this);\nsmooth();\n"+parts[1];
                jsCode[i]=line;
                flagList["setup()"]=0;
            }    
        }

        if(flagList["PVector"]==1) {
            line=line.replace("{", "new PVector(");
            line=line.replace("}", ")");
            jsCode[i]=line;     //replace the line in the code
            flagList["PVector"]=0;
        }

        if(flagList["draw()"]==1) {
            if(line.indexOf("{")>=0) {
                parts=line.split("{");
                line=parts[0]+"{"+canvasControl+parts[1];
                jsCode[i]=line;
                flagList["draw()"]=0;
            }
        }

        $("#jsCode").append(line+"<br/>");
        translatedCode+=line+"\n";
    }
    return translatedCode;
}

