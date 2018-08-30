var localIP;
var isStreaming=false;
var streaming = null;
var frame=0;
var r, g, b;
var port = 2525;
var publicMessage=null;
var processor="";
function getLocalIP(accessToken, coreID)
{
    url="https://api.spark.io/v1/devices/"+coreID+"/ip?access_token="+accessToken;
    $.get(url, function(data){
	    localIP=data['result'];
	    console.log(localIP);
	if(processor=="Core")
	{
	    streaming=new Streaming("ws://" + localIP + ":" + port);
	    streaming.rate=5;
	}
	else
	{
	    streaming=new PhotonStreaming("ws://" + localIP + ":" + port);
	    streaming.rate=30;
	}
    });    
}

function checkForListener(coreID)
{
    url="https://api.spark.io/v1/devices/"+coreID+"/vizName?access_token="+accessToken;
    $.ajax({
	url: url,
	success: function(data){
	    vizName=data['result'];
	    if(vizName=="websocketsListener")		
		getLocalIP(accessToken, coreID);   //great!  commence the streaming!
	    else
	    {
		flashWebsocketsListener();  //load the websockets listener
	    }
	},
	error: function(){
	    flashWebsocketsListener();
	},
	timeout: 1000,
    });
    
}

function flashWebsocketsListener()
{
    alert("your cube needs to run the listener.  Take a dance break for 20 seconds while we load it onto your cube, and try again when the light on the bottom of your core turns cyan");
    coreUrl=flashWebsocketsUrl.replace("coreId", coreID).replace("processor", processor);
    console.log(coreUrl);
    $.get(coreUrl);
}

function stream()
{
    processor=$('option:selected', $("#cubeName")).attr("processor");
    console.log(processor);
    checkForListener(coreID);  
}

function Streaming(address) {
    this.clearToSend = true;
    this.rate = 1000;
    this.size = 8; // TODO support 16^3
    this.frameSize = 512;
    this.address=address;
    this.frameBuffer = new ArrayBuffer(this.frameSize);

    // open connection
    this.ws = new WebSocket(address);
    console.log("Connecting!");
    var cube = this;

    this.ws.onclose = function() {
        if(cube.onclose !== undefined) {
            cube.onclose(streaming);
        }
    };


    this.ws.onopen = function() {
	console.log("opened websocket");
        if(cube.onopen !== undefined) {
            cube.onopen(cube);
        }
	console.log("refreshing");
        cube.refresh();
    };


/*
    this.ws.onmessage = function(evt) {
        var msg = evt.data;
        console.log("got msg: " + msg);

        if(parseInt(msg) == cube.frameSize) {
            cube.clearToSend = true;
            }
	    };
*/

    this.ws.onmessage = function(evt) {
        var msg = evt.data;
	publicMessage=msg;
        console.log("got msg: " + msg);
	console.log(streaming.frameSize);
	console.log(parseInt(msg));
        if(parseInt(msg) == streaming.frameSize) {
            streaming.clearToSend = true;
	    console.log("clear to send");
        }
    };
}

Streaming.prototype={
    onopen: function() {},
    onclose: function() {},
    onrefresh: function() {},
    refresh: function() {
	var cube = this;
    
    if(this.clearToSend && this.ws.bufferedAmount == 0) {
	if(this.onrefresh !== undefined) {
	    this.onrefresh(this);
	}
	frame++;
	console.log("sent frame "+frame);
//	console.log(this.frameBuffer);
/*
	var dummy = new ArrayBuffer(this.frameSize);
	for(var a=0;a<this.frameSize;a++)
	    dummy[a]=224;
	this.frameBuffer = new ArrayBuffer(this.frameSize);
*/
	streaming.ws.send(streaming.frameBuffer);
	streaming.clearToSend = false; // must get reply before sending again
	
	setTimeout(function() { cube.refresh(); }, cube.rate);
    } else {
	// check for readiness every 5 millis
	setTimeout(function() { cube.refresh(); }, 5);
    }
    },
    bufferVoxels: function(red, green, blue){
	var frameView = new Uint8Array(streaming.frameBuffer);
    for(var x=0;x<8;x++)
	for(var y=0;y<8;y++)
	    for(var z=0;z<8;z++)
	{
	    frameView[z*64+y*8+x]=((red[x][y][z] >> 5) << 5) | ((green[x][y][z] >> 5) << 2) | (blue[x][y][z] >> 6); 
	}
	

    }
}


function clamp(x, a, b) {
    return Math.max(a, Math.min(x, b));
}

var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

var crc32 = function(buf, len) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    var bufView = new Uint8Array(buf);
    for (var i = 0; i < bufView.length && i < len; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ bufView[i]) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

function PhotonStreaming(address) {
    this.address = address;

    this.timeout = 1000; // reconnect after no reply in this # of ms
    this.clearToSend = false;
    this.timeOfLastReply = null; // ms since last response
    this.waiting = false; // true if waiting for ack
    
    this.rate = 1000;
    this.size = 8; // TODO support 16^3
    this.frameSize = 512 + 4;

    this.frameBuffer = new ArrayBuffer(this.frameSize);

    this.stream();
}

PhotonStreaming.prototype = {
    /*  Start transmitting the frame buffer to the cube */
    stream: function() {
        function refresh() {
            if (streaming.clearToSend && streaming.ws.bufferedAmount == 0) {
                // give user chance to modify frame
                if(streaming.onrefresh !== undefined) {
                    streaming.onrefresh(streaming);
                }

                // add crc32
                var crc = crc32(streaming.frameBuffer, 512);
                var bufView = new Uint8Array(streaming.frameBuffer);
                bufView[512] = (crc >> 24) & 0xff;
                bufView[513] = (crc >> 16) & 0xff;
                bufView[514] = (crc >> 8) & 0xff;
                bufView[515] = crc & 0xff;

                streaming.ws.send(streaming.frameBuffer);
                streaming.clearToSend = false; // must get reply before sending again

                streaming._clock.postMessage(["set", streaming.rate]);
            } else {
                // try to reconnect if timed out
                if (streaming.timeOfLastReply != null && Date.now() - streaming.timeOfLastReply > streaming.timeout) {
                    streaming.timeOfLastReply = null;
                    streaming.ws.close();
                }
            }
        }

        if (window.Worker) {
            this._clock = new Worker(staticRoot+"js/clockworker.js");

            this._clock.onerror = function(err) {
                console.log("cube worker error!", err.message);
            };

            var cube = this;
            this._clock.addEventListener('message', function(e) {
                if (e.data === "tick") {
                    refresh();
                }
            });
        } else {
            this._clock = {
                interval: null,
                setInterval: function(ms) {
                    this.interval = setInterval(function() {
                        refresh();
                    }, ms);
                },
                clearInterval: function() {
                    clearInterval(this.interval);
                    this.interval = null;
                },
                postMessage: function(msg) {
                    if (msg[0] === "set") {
                        if (this.interval !== null)
                            this.clearInterval();
                        this.setInterval(msg[1]);
                    } else if (msg[0] === "stop") {
                        this.clearInterval();
                    }
                }
            };
        }

        // open connection
        this.ws = new WebSocket(this.address);
        console.log("Connecting!");

        var cube = this;

        this.ws.onclose = function() {
            streaming.clearToSend = false;
            streaming._clock.postMessage(["stop"]);

            if(streaming.onclose !== undefined) {
                streaming.onclose(cube);
            }

            // try to reconnect
            streaming.stream();
        };

        this.ws.onopen = function() {
            if(streaming.onopen !== undefined) {
                streaming.onopen(cube);
            }

            console.log("connected!");
            
            // start streaming
            streaming.clearToSend = true;
            streaming._clock.postMessage(["set", streaming.rate]);
        };

        this.ws.onmessage = function(evt) {
            var msg = evt.data;
            console.log("got msg: " + msg);

            if(parseInt(msg) == streaming.frameSize) {
                streaming.clearToSend = true;
                streaming.timeOfLastReply = Date.now();
            } else {
                // TODO reconnect, because something is wrong
            }
        };
    },

    stop: function() {
        this._clock.postMessage(["stop"]);
    },

    onopen: function() {},
    onclose: function() {},
    onrefresh: function() {},
    bufferVoxels: function(red, green, blue){
	var frameView = new Uint8Array(streaming.frameBuffer);
    for(var x=0;x<8;x++)
	for(var y=0;y<8;y++)
	    for(var z=0;z<8;z++)
	{
	    frameView[z*64+y*8+x]=((red[x][y][z] >> 5) << 5) | ((green[x][y][z] >> 5) << 2) | (blue[x][y][z] >> 6); 
	}
	

}
}
