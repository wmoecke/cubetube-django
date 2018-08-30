var kBoardWidth = 8;
var kBoardHeight= 8;
var kPickerWidth = 8;
var kPickerHeight= 3;
var kNumPieces = 64;
var kNumColors = 24;
var kPieceWidth = $("#cube_canvas").width() / kBoardWidth;	//50;
var kPieceHeight = $("#cube_canvas").height() / kBoardHeight;	//50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);
//var kPickerWidth = 1 + (kPickerWidth * kPieceWidth);
//var kPickerHeight= 1 + (kPickerHeight * kPieceHeight);

var gVoxelImage;
var gCanvasElement;
var gDrawingContext;
//var gPickerElement;
//var gPickerContext;
var gSelectedColor;

var gLayer;
var gPieces;
//var gColors;
var gNumPieces;
var gNumColors;
var gSelectedPieceIndex;
var gSelectedPieceArrayIndex;
//var gPickedColorIndex;
var gLayerCountElem;
var gGameInProgress;

// page globals
var isUserAlerted = false;
var currentMode = '';
var brightness = 20;
var modeList = new Array();
var populateModesTimer = null;
//var selectFromDropdownTimer = null;
var syncInterval = null;
var idxArr = 0;
var supportsLocalStorage = function() { return ('localStorage' in window) && window['localStorage'] !== null; };
//var isTouchDevice = function() { return 'ontouchstart' in window || 'onmsgesturechange' in window; };
//var isDesktop = window.screenX !== 0 && !isTouchDevice() ? true : false;

function Cell(row, column, zIndex, fillColor, isFilled) {
    this.row = row;
    this.column = column;
    this.zIndex = zIndex;
    this.fillColor = fillColor;
    this.isFilled = isFilled;
    this.clicks = 0;
}

/* #### Global Page Functions #### */
function populateInterval() {
    populateModesTimer = setInterval(function () {
        if (currentMode === null || currentMode === '' || currentMode === 'None') {
            $("div#cubeAndModeText").hide('slide', {direction: 'right'}, 600);
            $("div#updateListDiv").fadeIn(300);
            if($("select#modes").css('display') !== 'none') {
                // We only want to set these once
                $("a#updateListButton").fadeOut(100);
                $("select#modes").fadeOut(100, function() {
                    $("a#updateListButton").html("Loading, Please Wait<span class=\"one\">.</span><span class=\"two\">.</span><span class=\"three\">.</span>");
                    $("a#updateListButton").fadeIn(300);
                });
            }
            populateModes();
            populateModesList();
        }
        else {
            if ($("select#modes option:selected").val() === currentMode) {
                clearInterval(populateModesTimer);
                isUserAlerted = true;
                $("a#updateListButton").html("Update List");
                //$("span#mode").text(currentMode);
                $("select#modes").fadeIn(300);
                $('select#cubeName').fadeIn(300);
                $("div#cubeAndModeText").hide('slide', {direction: 'right'}, 600, function() {
                    $("span#device").html("Still Loading, Please Wait<span class=\"one\">.</span><span class=\"two\">.</span><span class=\"three\">.</span>");
                    $("div#cubeAndModeText").show('slide', {direction: 'left'}, 600);
                }); //.fadeIn(300);

                getBrightness();    //setBrightness();
            }
            else {
                // Set the selected mode in the modes dropdown
                // This can fail: 
                // $("select#modes").val(currentMode);
                $.each($("select#modes option"), function (index, option) {
                    if(index < $("select#modes option").length)
                        option.selected = false;
                });
                $.each($("select#modes option"), function (index, option) {
                    //console.log('option: ' + option.value);
                    if(index < $("select#modes option").length) {
                        if (option.value === currentMode) {
                            option.selected = true;
                            return false;
                        }
                    }
                });
            }
        }
    }, 1000);
}

function populateModes() {
    var deviceID = getDeviceID();
    if (deviceID !== '') {
        if (currentMode === null || currentMode === '' || currentMode === 'None') {
            // Retrieve the device's current mode from the cloud API
            $.get("https://api.particle.io/v1/devices/" + deviceID + "/mode/?access_token=" + accessToken, "json")
            .success(function (data) {
                currentMode = data.result.trim();
                console.log('success! populateModes(): ' + currentMode);
            })
            .fail(function (data) {   // API call failed to get the mode variable from the cloud;
                var message = '';     // device is likely not running Spark Pixels, or it hasn't
                if (deviceID !== '') {// successfully published the 'mode' cloud variable.
                    var device = $("select#cubeName option[value = '" + deviceID + "']").text();
                    //if (typeof device !== 'undefined' && device !== null && device !== '') {
                    /*for ( var prop in data ) {
                        console.log( "data." + prop );
                    }
                    console.log("responseText: " + data.responseText);
                    console.log("responseJSON: " + data.responseJSON);*/
                    var responseText = data.responseText;
                    console.log('fail populateModes(): ' + responseText);
                    if (responseText.indexOf("Variable not found") >= 0) {
                        message += 'The selected Cube (\"' + device.substr(device.indexOf(')') + 2)
                            + '\") does not appear to be running the Spark Pixels viz (it may be the Particle API acting up).';
                        message += '\nIf you would like to flash \"' + device.substr(device.indexOf(')') + 2) + '\" with ';
                        message += 'Spark Pixels now, just hit [OK].\nElse, click [Cancel] to return to where you were.';
                        if (!isUserAlerted) {
                            isUserAlerted = true;
                            if (confirm(message))
                                flashCube();
                            else
                                clearInterval(populateModesTimer);                            
                        }
                    }
                    else {
                        if (!isUserAlerted) {
                            isUserAlerted = true;
                            message = '';
                            message+="Oh-oh! I tried to get the cube's current MODE from the Particle cloud, but it would not retrieve it!";
                            message+="\nThis could be due to a network error. If your cube is breathing cyan,\nit may be the Particle API acting up.";
                            message+="\nClick [OK] to retry, [Cancel] to give it a rest for a while.";
                            if (confirm(message))
                                window.location.reload();
                            else
                                clearInterval(populateModesTimer);
                        }
                    }
                }
            });
        }
    }
}

function populateModesList() {
    var deviceID = getDeviceID();
    if (deviceID !== '') {
        if(!modeList.length) {
            // Retrieve the device's modes list from the cloud API
            $.get("https://api.particle.io/v1/devices/" + deviceID + "/modeList/?access_token=" + accessToken, "json")
            .success(function (data) {
                console.log('success! populateModesList(): ' + data.result.slice(0, data.result.lastIndexOf(';')));
                modeList = data.result.split(";");
                $("select#modes").empty();  //clear all the existing modes before appending new ones
                for (var index = 0; index < modeList.length - 1; index++) {
                    var mode = modeList[index].trim();
                    $("select#modes").append("<option value=\"" + mode + "\">" + mode + "</option>");
                }
                //console.log('currentMode: ' + currentMode);
            })
            .fail(function (data) {
                console.log('fail populateModesList(): ' + data.result);
                var message = '';
                var device = $("select#cubeName option[value = '" + deviceID + "']").text();
                var responseText = data.responseText;
                if (responseText.indexOf("Variable not found") >= 0) {
                    message += 'The selected Cube (\"' + device.substr(device.indexOf(')') + 2)
                        + '\") does not appear to be running the Spark Pixels viz (it may be the Particle API acting up).';
                    message += '\nIf you would like to flash \"' + device.substr(device.indexOf(')') + 2) + '\" with ';
                    message += 'Spark Pixels now, just hit [OK].\nElse, click [Cancel] to return to where you were.';
                    if (!isUserAlerted) {
                        isUserAlerted = true;
                        if (confirm(message))
                            flashCube();
                        else
                            clearInterval(populateModesTimer);
                    }
                }
                else {
                    if (!isUserAlerted) {
                        isUserAlerted = true;
                        message = '';
                        message+="Oh-oh! I tried to get the list of MODES from the Particle cloud, but it would not retrieve it!";
                        message+="\nThis could be due to a network error. If your cube is breathing cyan,\nit may be the Particle API acting up.";
                        message+="\nClick [OK] to retry, [Cancel] to give it a rest for a while.";
                        if (confirm(message))
                            window.location.reload();
                        else
                            clearInterval(populateModesTimer);
                    }
                }
            });
        }
    }
}

function logEvent(event) {
    if (typeof accessToken !== 'undefined' && accessToken !== null) {
        var output;
        var request = $.ajax({
            type: "POST",
            url: "/log_event/", /*"{% url 'log_event' %}",*/
            data: {"event": event, "accessToken": accessToken},
            dataType: "json",
            success: function (data) {
                output = "";
                if (data.success == 'true')
                    output += data.message;
                else
                    output += "Event logging unsuccessful: " + data.error;
                console.log(output);  //alert(output);
            },
            fail: function (data) {
                console.log("Event logging failed with error: " + data);
                //console.log(data);
            }
        });
    }
}

function flashCube() {
    var deviceID = getDeviceID();
    if (deviceID !== '') {
        var output;
        var request = $.ajax({
            type: "POST",
            url: "/cloudFlash/", /*"{% url 'cloudFlash' %}",*/
            data: {"code": "", "accessToken": accessToken, "deviceID": deviceID, "vizName": "", "vizId": "1438", "viz-lib": null},
            dataType: "text",
            success: function (data) {
                console.log("success flashing");
                JSONstring = data;
                console.log(JSONstring);
                var result = $.parseJSON(data);
                var result = $.parseJSON(result);
                compilerData = result;
                console.log(compilerData);
                output = "";
                if (result.ok) {
                    output += "Compilation status: " + result.message + " - Flashing device now, please wait.";
                    output += "\nOnce your Cube has restarted, you can close this message.";
                }
                else {
                    var device = $("select#cubeName option[value = '" + deviceID + "']").text();
                    output += "Compilation status: " + result.ok + "\nerrors:\n" + result.errors + "\n";
                    output += "\nPlease make sure " + device.substr(device.indexOf(')') + 2) + " is online (breathing cyan).";
                }
                alert(output);
                window.location.reload();
            },
            fail: function (data) {
                console.log("fail flashing");
                console.log(data);
            }
        });
    }
}

function getBrightness() {
    if (typeof accessToken !== 'undefined' && accessToken !== null) {
        var deviceID = getDeviceID();
        // Retrieve the device's brightness variable from the cloud API
        $.get("https://api.particle.io/v1/devices/" + deviceID + "/brightness/?access_token=" + accessToken)
            .success(function(data) {
                brightness = (parseInt(data.result) / 255) * 100;
                console.log("success! getBrightness(): " + brightness.toFixed(0) + "/" + data.result);
            }).fail(function(data) {
                console.log('fail getBrightness(): ' + data.return_value);
                if (supportsLocalStorage()) {
                    if (localStorage["spark_pixels.brightness"])
                        brightness = parseInt(localStorage["spark_pixels.brightness"]);
                }
            }).always(function() {
                $("#brightnessSlider").val(brightness.toFixed(0));
                updateBrightnessLabel(brightness.toFixed(0));
                $("div#brightnessControl").fadeIn(300);
                $("div#cubeAndModeText").hide('slide', {direction: 'right'}, 600);
            });
    }
}

function setBrightness() {
    if (typeof accessToken !== 'undefined' && accessToken !== null) {
        var deviceID = getDeviceID();
        if(deviceID !== '') {
            var commandString = 'B:' + (brightness > 0 ? brightness : 1) + ',';
            
            logEvent('CUBE PAINTER > SET BRIGHTNESS: ' + $("#brightnessSlider").val());
            
            $.post("https://api.particle.io/v1/devices/" + deviceID + "/SetMode", {
                access_token: accessToken, args: commandString
            }).success(function(data) {
                updateBrightnessLabel(brightness);
            }).fail(function(data) {
                console.log('fail setBrightness(): ' + data.return_value);
            });
        }
    }
}

function setMode() {
    if (typeof accessToken !== 'undefined' && accessToken !== null) {
        var deviceID = getDeviceID();
        if(deviceID !== '') {
            currentMode = $('#modes').find("option:selected").val();
            var commandString = 'M:' + currentMode + ',';
            
            logEvent('CUBE PAINTER > SET MODE: ' + currentMode);

            $.post("https://api.particle.io/v1/devices/" + deviceID + "/SetMode", {access_token: accessToken, args: commandString})
                .success(function(data) {console.log('success! setMode(): ' + data.return_value);})
                .fail(function (data) {console.log('fail setMode(): ' + data.return_value);});
        }
    }
}

function setVoxel(index, color, log) {
    log = typeof log !== 'undefined' ? log : true;
    
    if (typeof accessToken !== 'undefined' && accessToken !== null
        && currentMode.trim().toUpperCase() === 'CUBE PAINTER') {
        var deviceID = getDeviceID();
        if(deviceID !== '') {
            var commandString = 'I' + index + ',' + color + ',';
            
            if(log) logEvent('CUBE PAINTER > SET VOXEL: ' + commandString.substring(0, commandString.length - 1));
            
            $.post("https://api.particle.io/v1/devices/" + deviceID + "/CubePainter", {access_token: accessToken, args: commandString});
        }
    }
}

function clearVoxels(startIdx, endIdx) {
    $("div.sp-container").addClass('sp-hidden');    // Hide the palette
    if (typeof accessToken !== 'undefined' && accessToken !== null
        && currentMode.trim().toUpperCase() === 'CUBE PAINTER') {
        var deviceID = getDeviceID();
        if(deviceID !== '') {
            var commandString = 'C' + startIdx + ':' + endIdx + ',';
            
            logEvent('CUBE PAINTER > CLEAR VOXELS: ' + commandString.substring(0, commandString.length - 1));
            
            $.post("https://api.particle.io/v1/devices/" + deviceID + "/CubePainter", {access_token: accessToken, args: commandString});
            clearPieces(startIdx, endIdx);
        }
    }
}

function syncVoxels() {
    $("div.sp-container").addClass('sp-hidden');    // Hide the palette
    if (typeof accessToken !== 'undefined' && accessToken !== null
        && currentMode.trim().toUpperCase() === 'CUBE PAINTER') {
        var deviceID = getDeviceID();
        if(deviceID !== '') {
            var commandString = 'C0:' + gNumPieces + ',';
            
            logEvent('CUBE PAINTER > SYNC VOXELS: ' + commandString.substring(0, commandString.length - 1));
            
            $.post("https://api.particle.io/v1/devices/" + deviceID + "/CubePainter", {access_token: accessToken, args: commandString});

            var gDrawing = new Array();
            for (var idxArrDr = 0; idxArrDr < gNumPieces; idxArrDr++)
                if (gPieces[idxArrDr].isFilled)
                    gDrawing.push(new Cell(gPieces[idxArrDr].row, gPieces[idxArrDr].column, gPieces[idxArrDr].zIndex, gPieces[idxArrDr].fillColor, true));

            idxArr = 0;
            syncInterval = setInterval(function () {
                if (idxArr < gDrawing.length) {
                    var voxelIndex = ((gDrawing[idxArr].zIndex * kNumPieces) + (gDrawing[idxArr].column * (kNumPieces / kBoardWidth)) + (kBoardHeight - gDrawing[idxArr].row)) - 1;
                    //console.log('Setting voxel #' + voxelIndex);
                    setVoxel(voxelIndex, gDrawing[idxArr].fillColor, false);
                    idxArr++;
                }
                else
                    clearInterval(syncInterval);
            }, 60);
        }
    }
}

/* #### Canvas Functions #### */
function getCursorPosition(e, canvasElement, cellArray) {
    /* returns Cell with .row and .column properties */
    var x, newX;
    var y, newY;
    
    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    
    x -= canvasElement.offsetLeft;
    y -= canvasElement.offsetTop;
    x = Math.min(x, kBoardWidth * kPieceWidth);
    y = Math.min(y, kBoardHeight * kPieceHeight);
    
    newX = Math.floor(y/kPieceHeight);
    newY = Math.floor(x/kPieceWidth);
    return getCell(newX, newY, cellArray);
}

function getCell(row, column, cellArray) {
    if(cellArray.length > kNumColors) {
        var i = gLayer*kNumPieces;
        for (var idx=i; idx < (i+kNumPieces); idx++) {
            if ((cellArray[idx].row == row) && 
                (cellArray[idx].column == column)) {
                return cellArray[idx];
            }
        }
    }
    else {
        for (var idx=0; idx < cellArray.length; idx++) {
            if ((cellArray[idx].row == row) && 
                (cellArray[idx].column == column)) {
                return cellArray[idx];
            }
        }
    }
}

function increaseLayer() {
    if(gLayer < 7) {
        gLayer++;
        logEvent('CUBE PAINTER > INCREASE LAYER: ' + gLayer);
    }
    else
        gLayer = 7;
    drawCube();
}

function decreaseLayer() {
    if(gLayer > 0) {
        gLayer--;
        logEvent('CUBE PAINTER > DECREASE LAYER: ' + gLayer);
    }
    else
        gLayer = 0;
    drawCube();
}

function updateLayerCountElem() {
    if(gLayer === 7)
        gLayerCountElem.html("&nbsp;&nbsp;Front&nbsp;&nbsp;");
    else if(gLayer === 0)
        gLayerCountElem.html("&nbsp;&nbsp;Back&nbsp;&nbsp;");
    else
        gLayerCountElem.html("&nbsp;&nbsp;Layer: " + ((7 - gLayer) + 1) + "&nbsp;&nbsp;");
}

function cubeOnClick(e) {
    //console.log('cubeOnClick(e)!');
    var cell = getCursorPosition(e, gCanvasElement, gPieces);
    var i = gLayer*kNumPieces;
    for (var idx=i; idx < (i+kNumPieces); idx++) {
        if ((gPieces[idx].row == cell.row) && 
            (gPieces[idx].column == cell.column)) {
            //gSelectedPieceArrayIndex = idx;
            clickOnPiece(idx, gPieces);
            return;
        }
    }
}

/*function pickerOnClick(e) {
    var cell = getCursorPosition(e, gPickerElement, gColors);
    for (var idx=0; idx < kNumColors; idx++) {
        if ((gColors[idx].row == cell.row) && 
            (gColors[idx].column == cell.column)) {
            clickOnPiece(idx, gColors);
            return;
        }
    }
}*/

function clickOnPiece(pieceIndex, cellArray) {
    if(cellArray.length > kNumColors) {
        gSelectedPieceIndex = ((gLayer*kNumPieces) + (cellArray[pieceIndex].column*(kNumPieces/kBoardWidth)) + (kBoardHeight - cellArray[pieceIndex].row)) - 1;
        gSelectedPieceArrayIndex = pieceIndex;
    }
    else {
        gSelectedPieceIndex = pieceIndex;
        gPickedColorIndex = pieceIndex;
    }
    //console.log('Piece index: ' + gSelectedPieceIndex);
    
    if(cellArray.length > kNumColors) {
        var cancelButton;
        var container = $("<div class=\"sp-cf sp-palette-row sp-palette-row-selection\"></div>");
        $("div.sp-palette").find("div.sp-palette-row-selection").remove();
            
        //console.log('cellArray[pieceIndex].clicks = ' + cellArray[pieceIndex].clicks);
        //if(cellArray[pieceIndex].isFilled) {
            var left, top;
            var position = $("canvas#cube_canvas").position();
            
            switch(cellArray[pieceIndex].clicks) {
                case 0:
                default:
                    $("div.sp-container").addClass('sp-hidden');    //$("input#colorPicker").spectrum("hide");
                    cellArray[pieceIndex].isFilled = true;
                    cellArray[pieceIndex].clicks++;
                    break;
                
                case 1:
                    // Let's make the color picker visible
                    $("div.sp-container").removeClass('sp-hidden'); //$("input#colorPicker").spectrum("show");

                    // Determine where the button container and color picker will be
                    // positioned horizontally based on the location of the clicked piece
                    if(cellArray[pieceIndex].column < 4) {
                        // Create a left-aligned 'Close' button
                        cancelButton = $("<div style=\"float: left;\"><button type=\"button\">Close</button></div>");
                        left = position.left + (kPieceWidth * (cellArray[pieceIndex].column));
                    }
                    else {
                        // Create a right-aligned 'Close' button
                        cancelButton = $("<div style=\"float: right;\"><button type=\"button\">Close</button></div>");
                        left = position.left + ((kPieceWidth * (cellArray[pieceIndex].column + 1)) - $("div.sp-container").width());
                    }

                    // Add a click handler to the 'Close' button
                    cancelButton.on("click", function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        $("div.sp-container").addClass('sp-hidden');
                    });
                    // After we've determined where the 'Close' button will
                    // be located, we append it to the button container
                    container.append(cancelButton);

                    // Determine where the button container and color picker will be
                    // positioned vertically based on the location of the clicked piece
                    if(cellArray[pieceIndex].row < 4) {
                        $("div.sp-palette").prepend(container); // We place the 'Close' button at the top of the color picker
                        top = position.top + (kPieceHeight * (cellArray[pieceIndex].row + 1));
                    }
                    else {
                        $("div.sp-palette").append(container); // We place the 'Close' button at the bottom of the color picker
                        top = position.top + ((kPieceHeight * (cellArray[pieceIndex].row)) - $("div.sp-container").height());
                    }

                    // Place the color picker next to the clicked piece
                    $("div.sp-container").css({'top' : top, 'left' : left});
                    cellArray[pieceIndex].isFilled = true;
                    cellArray[pieceIndex].clicks++;
                    break;
                
                case 2:
                    $("div.sp-container").addClass('sp-hidden');    //$("input#colorPicker").spectrum("hide");
                    cellArray[pieceIndex].isFilled = false;
                    cellArray[pieceIndex].clicks = 0;
                    break;
            }
        /*}
        else  // If we have clicked in a colored piece, then hide the color picker
            $("div.sp-container").addClass('sp-hidden');    //$("input#colorPicker").spectrum("hide");*/

        cellArray[pieceIndex].zIndex = gLayer;
    	//cellArray[pieceIndex].isFilled = !cellArray[pieceIndex].isFilled; 
        cellArray[pieceIndex].fillColor = cellArray[pieceIndex].isFilled ? gSelectedColor : '#000000';
        setVoxel(gSelectedPieceIndex, cellArray[pieceIndex].fillColor);
        drawCube();
    }
    /*else {
    	gSelectedColor = cellArray[pieceIndex].fillColor;
    	drawPicker();
    }*/
}

function clearPieces(startIdx, endIdx) {
    for(var pieceIndex=startIdx; pieceIndex<endIdx; pieceIndex++) {
        gPieces[pieceIndex].isFilled = false;
        gPieces[pieceIndex].fillColor = "#000000";
    }
    drawCube();
}

function drawCube() {
    gDrawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);
    gDrawingContext.beginPath();
	
    /* voxel background image */
    drawBackground();
    
    /* vertical lines */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
    	gDrawingContext.lineWidth = ((x == 0) || (x == kPixelWidth)) ? 4 : 1;
        gDrawingContext.moveTo(0.5 + x, 0);
        gDrawingContext.lineTo(0.5 + x, kPixelHeight);
    }
    
    /* horizontal lines */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
    	gDrawingContext.lineWidth = ((y == 0) || (y == kPixelHeight)) ? 4 : 1;
        gDrawingContext.moveTo(0, 0.5 + y);
        gDrawingContext.lineTo(kPixelWidth, 0.5 +  y);
    }
    
    /* draw it! */
    gDrawingContext.strokeStyle = "#ccc";
    gDrawingContext.stroke();
	
    var i = gLayer*kNumPieces;
    for (var idx=i; idx < (i+kNumPieces); idx++)
    	drawPiece(gPieces[idx], gPieces[idx].isFilled, gSelectedPieceArrayIndex === idx);
	
    updateLayerCountElem();
    
    gGameInProgress = true;
    saveGameState();
}

/* voxel background image */
function drawBackground() {
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth)
        for (var y = 0; y <= kPixelHeight; y += kPieceHeight)
            gDrawingContext.drawImage(gVoxelImage, x, y, kPieceWidth, kPieceHeight);
}

function drawPiece(p, isFilled, isSelected) {
    var column = p.column;
    var row = p.row;
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);
    var radius = (kPieceWidth/2) - (kPieceWidth/10);
    
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    gDrawingContext.closePath();
    gDrawingContext.strokeStyle = isSelected ? "#0343df" : isFilled ? p.fillColor : "#ccc";
    gDrawingContext.lineWidth = isSelected ? 4 : 2;
    gDrawingContext.stroke();
    
    if (isFilled) {
        gDrawingContext.globalAlpha = 0.8;	// Set transparency
        gDrawingContext.fillStyle = p.fillColor;
        gDrawingContext.fill();
    }
    else {
        gDrawingContext.globalAlpha = 0.2;	// Set transparency
        gDrawingContext.fillStyle = "#ffffff";
        gDrawingContext.fill();
    }
    // Turn transparency off
    gDrawingContext.globalAlpha = 1.0;
}

/*function drawPicker() {
    gPickerContext.clearRect(0, 0, kPickerWidth, kPickerHeight);
    gPickerContext.beginPath();
    
    // vertical lines
    gPickerContext.lineWidth = 2;
    gPickerContext.moveTo(0.5, 0);
    gPickerContext.lineTo(0.5, kPickerHeight);
    gPickerContext.moveTo(kPickerWidth, 0);
    gPickerContext.lineTo(kPickerWidth, kPickerHeight);
    
    // horizontal lines
    for (var y = 0; y <= kPickerHeight; y += kPieceHeight) {
    	gPickerContext.lineWidth = ((y == 0) || (y == kPickerHeight)) ? 2 : 4;
        gPickerContext.moveTo(0, 0.5 + y);
        gPickerContext.lineTo(kPickerWidth, 0.5 +  y);
    }
    
    // draw it!
    gPickerContext.strokeStyle = "#ccc";
    gPickerContext.stroke();
    
    for (var idx=0; idx < gColors.length; idx++)
    	drawColor(gColors[idx], gColors[idx].isFilled, gPickedColorIndex === idx);
    
    gGameInProgress = true;
    saveGameState();
}

function drawColor(p, isFilled, isSelected) {
    var column = p.column;
    var row = p.row;
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);
    var radius = (kPieceWidth/2) - (kPieceWidth/10);
    
    gPickerContext.beginPath();
    gPickerContext.arc(x, y, radius, 0, Math.PI*2, false);
    gPickerContext.closePath();
    gPickerContext.strokeStyle = isSelected ? "#0343df" : "#ccc";
    gPickerContext.lineWidth = isSelected ? 4 : 2;
    gPickerContext.stroke();
    gPickerContext.fillStyle = p.fillColor;
    gPickerContext.fill();
}*/

function saveGameState() {
    if (!supportsLocalStorage()) { return false; }
    
    localStorage["cubetube.game.in.progress"] = gGameInProgress;
    
    for (var i = 0; i < gNumPieces; i++) {
        localStorage["cubetube.piece." + i + ".row"] = gPieces[i].row;
        localStorage["cubetube.piece." + i + ".column"] = gPieces[i].column;
        localStorage["cubetube.piece." + i + ".zIndex"] = gPieces[i].zIndex;
        localStorage["cubetube.piece." + i + ".fillColor"] = gPieces[i].fillColor;
        localStorage["cubetube.piece." + i + ".isFilled"] = gPieces[i].isFilled;
    }
    
    localStorage["cubetube.currentlayer"] = gLayer;
    localStorage["cubetube.selectedpiece"] = gSelectedPieceIndex;
    localStorage["cubetube.selectedarray"] = gSelectedPieceArrayIndex;
    //localStorage["cubetube.selectedcolorindex"] = gPickedColorIndex;
    localStorage["cubetube.selectedcolor"] = gSelectedColor;

    return true;
}

function resumeGame() {
    if (!supportsLocalStorage()) { return false; }
    
    gGameInProgress = (localStorage["cubetube.game.in.progress"] == "true");
    if (!gGameInProgress) { return false; }
    
    gNumPieces = kNumPieces*kBoardWidth;
    gPieces = new Array();
    
    for (var i = 0; i < gNumPieces; i++) {
        var row = parseInt(localStorage["cubetube.piece." + i + ".row"]);
        var column = parseInt(localStorage["cubetube.piece." + i + ".column"]);
        var zIndex = parseInt(localStorage["cubetube.piece." + i + ".zIndex"]);
        var fillColor = localStorage["cubetube.piece." + i + ".fillColor"];
        var isFilled = localStorage["cubetube.piece." + i + ".isFilled"] == 'true';
        gPieces.push(new Cell(row, column, zIndex, fillColor, isFilled));
    }

    /*
     * Picker horizontal (8px width x 3px height) orientation
     *
    gColors = new Array(new Cell(0, 0, -1, "#660000", true),
                        new Cell(0, 1, -1, "#FF0000", true),
                        new Cell(0, 2, -1, "#FF6666", true),
                        new Cell(0, 3, -1, "#FF9999", true),
                        new Cell(0, 4, -1, "#FFB266", true),
                        new Cell(0, 5, -1, "#FF9933", true),
                        new Cell(0, 6, -1, "#FF8000", true),
                        new Cell(0, 7, -1, "#CC3300", true),
                        new Cell(1, 0, -1, "#006600", true),
                        new Cell(1, 1, -1, "#00FF00", true),
                        new Cell(1, 2, -1, "#99FF99", true),
                        new Cell(1, 3, -1, "#029386", true),
                        new Cell(1, 4, -1, "#FFFF99", true),
                        new Cell(1, 5, -1, "#FFFF14", true),
                        new Cell(1, 6, -1, "#666600", true),
                        new Cell(1, 7, -1, "#929591", true),
                        new Cell(2, 0, -1, "#000066", true),
                        new Cell(2, 1, -1, "#0000FF", true),
                        new Cell(2, 2, -1, "#0066CC", true),
                        new Cell(2, 3, -1, "#0080FF", true),
                        new Cell(2, 4, -1, "#00FFFF", true),
                        new Cell(2, 5, -1, "#C20078", true),
                        new Cell(2, 6, -1, "#7E1E9C", true),
                        new Cell(2, 7, -1, "#FFFFFF", true));*/
	
    gLayer = parseInt(localStorage["cubetube.currentlayer"]);
    gSelectedPieceIndex = parseInt(localStorage["cubetube.selectedpiece"]);
    gSelectedPieceArrayIndex = parseInt(localStorage["cubetube.selectedarray"]);
    //gPickedColorIndex = parseInt(localStorage["cubetube.selectedcolorindex"]);
    gSelectedColor = localStorage["cubetube.selectedcolor"];
    $("input#colorPicker").spectrum("set", gSelectedColor);
    drawCube();
    //drawPicker();
    return true;
}

function newGame() {
    gPieces = new Array();
    for (var z=0; z<kBoardWidth; z++)
        for (var r=0; r<kBoardHeight; r++)
            for (var c=0; c<kBoardWidth; c++)
                gPieces.push(new Cell(r, c, -1, "#00000", false));

    /*
     * Picker horizontal (8px width x 3px height) orientation
     *
    gColors = new Array(new Cell(0, 0, -1, "#660000", true),
                        new Cell(0, 1, -1, "#FF0000", true),
                        new Cell(0, 2, -1, "#FF6666", true),
                        new Cell(0, 3, -1, "#FF9999", true),
                        new Cell(0, 4, -1, "#FFB266", true),
                        new Cell(0, 5, -1, "#FF9933", true),
                        new Cell(0, 6, -1, "#FF8000", true),
                        new Cell(0, 7, -1, "#CC3300", true),
                        new Cell(1, 0, -1, "#006600", true),
                        new Cell(1, 1, -1, "#00FF00", true),
                        new Cell(1, 2, -1, "#99FF99", true),
                        new Cell(1, 3, -1, "#029386", true),
                        new Cell(1, 4, -1, "#FFFF99", true),
                        new Cell(1, 5, -1, "#FFFF14", true),
                        new Cell(1, 6, -1, "#666600", true),
                        new Cell(1, 7, -1, "#929591", true),
                        new Cell(2, 0, -1, "#000066", true),
                        new Cell(2, 1, -1, "#0000FF", true),
                        new Cell(2, 2, -1, "#0066CC", true),
                        new Cell(2, 3, -1, "#0080FF", true),
                        new Cell(2, 4, -1, "#00FFFF", true),
                        new Cell(2, 5, -1, "#C20078", true),
                        new Cell(2, 6, -1, "#7E1E9C", true),
                        new Cell(2, 7, -1, "#FFFFFF", true));*/

    gNumPieces = gPieces.length;
    gSelectedPieceIndex = -1;
    gSelectedPieceArrayIndex = -1;
    //gPickedColorIndex = -1;
    gSelectedColor = "#ffebcd";
    $("input#colorPicker").spectrum("set", gSelectedColor);
    gLayer = 7;
    gGameInProgress = false;
	
    drawCube();
    //drawPicker();
}

//function initGame(canvasElement, pickerElement) {
function initGame(canvasElement) {
    gCanvasElement = canvasElement;
    gCanvasElement.width = kPixelWidth;
    gCanvasElement.height = kPixelHeight;
    //gCanvasElement.addEventListener("click", cubeOnClick, false);
    gDrawingContext = gCanvasElement.getContext("2d");
    /*gPickerElement = pickerElement;
    gPickerElement.width = kPickerWidth;
    gPickerElement.height = kPickerHeight;
    gPickerElement.addEventListener("click", pickerOnClick, false);
    gPickerContext = gPickerElement.getContext("2d");*/
    gLayerCountElem = $("span#currentLayer");

    /* voxel background image */
    gVoxelImage = new Image();
    gVoxelImage.src = "/static/images/voxel.png";
    gVoxelImage.onload = function() {
        logEvent('CUBE PAINTER: LOADED');
        
        // At this point, the image is fully loaded
        if (!resumeGame())
            newGame();
    };
}