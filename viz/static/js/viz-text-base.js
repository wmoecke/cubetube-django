/**
 *  Viz base.
 *  - Code specific to the viz tab. Saving, editing, forking etc.
 */

/**
 * Vars
 */

var library;
var editor;

/**
 * App
 */

 $.get('/static/js/l3d-library-text.js', function(data) {
      library=data;

      var vizType = getVizType();


      // I've got a canvas, lets render!
      if( $('canvas').length ) {

        if( vizType === 'L3D') {

            parseSparkCode( getVizUrl(), function() {
                setTimeout( function() {
                    formatCode();
                    runSparkSketch();
                    setHeight();
                }, 1);
            } );

        } else if ( vizType === 'javascript' ) {

            setTimeout( function() {
                formatCode();  //applies codeMirror formatting to the code
                runSketch();
                setHeight();
            }, 1)
        }
      } else {

        var $videoContainer = $('.youtube-video');
        if( $videoContainer.length ) {

          formatCode();
          setHeight();

          var url = $videoContainer.attr('data-url');
          var id = youtube_parser(url);
          createVideo( id, $videoContainer);
        }
      }

      
 }, 'text');

$(function(){
    // Init!

    var checkContext = $('.create-wrapper');
    if( checkContext.length ) {
      return;
    }

    // View code
    $('.view-code').click(function() {

        var state = $( '.viz-wrapper' ).hasClass('code-active');

        if( state == true ) {
            $('.view-code').text('View Code')
            $( '.viz-wrapper' ).toggleClass('code-active', !state);
            parent.postMessage( "close", "*" );
            $body.removeClass('no-scroll');
        } else {
            
            $('body').animate( 
                {scrollTop:'0px'},
                300,
                'swing',
                function(){ 
                    parent.postMessage( "open", "*" );
                    $( '.viz-wrapper' ).toggleClass('code-active', !state);
                    $('.view-code').text('Hide Code');
                    $body.addClass('no-scroll');
                } 
            )
        }
    });

    // Send to cube.
    $('.sent-to-cube').click(function() {
    });

    $('.run-sketch').click(function() {

        var vizType = getVizType();

        if( vizType === 'L3D') {
            translateCode(document.getElementById("code").value);
            runSparkSketch();
        } else if ( vizType === 'javascript' ) {
            runSketch();
        }
    });

    $('.save-sketch').click(function() {
    });

    $('.fork-sketch').click(function() {
    });

    $('.twitter').click(function() {
        openTwitterPopup();
    })

    $('.facebook').click(function() {
        openFBPopup();
    })
});

function setHeight() {
    $( '.CodeMirror' ).height(window.innerHeight - 180)
}

window.onresize = setHeight;

/**
 * Functions
 */
function getVizType() {
    var $wrapper = $('.viz-wrapper');
    return $wrapper.attr('data-viz-type');
}

function getVizUrl() {
    var $wrapper = $('.viz-wrapper');
    return $wrapper.attr('data-viz-url');
}

function formatCode() {

    // Applies codeMirror formatting code.
    editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true
    });
    editor.setOption("theme", "tomorrow-night-eighties");
    editor.on("change", function(cm, change) {
        document.getElementById("code").value = cm.getValue();
    })
}

function openTwitterPopup() {
   var width  = 575,
       height = 250,
       left   = (screen.width / 2)  - (width  / 2),
       top    = (screen.height / 2) - (height / 2),
       url    = 'http://twitter.com/share?url=',
       opts   = 'status=1' +
                ',width='  + width  +
                ',height=' + height +
                ',top='    + top    +
                ',left='   + left;

        url = url + window.location.origin + '/gallery/newestFirst/' + $('.viz-wrapper').attr('data-viz-id') + '/';
        url = url + '&text=' + $('.title').text().trim() + ' on cubetube!'
   
   window.open(url, 'twitter', opts);

   return false;
}

function openFBPopup() {

    // var fbpopup = window.open("https://www.facebook.com/sharer/sharer.php?u=http://stackoverflow.com", "pop", "width=600, height=400, scrollbars=no");
    // FB.ui({
    //   method: 'share',
    //   href: '/gallery/newestFirst/' + $('.viz-wrapper').attr('data-viz-id'),
    // }, function(response){});
    var url = window.location.origin + '/gallery/newestFirst/' + $('.viz-wrapper').attr('data-viz-id') + '/'
    // var title = $('.title').text().trim();
    // var descr = "Check out " + $('.title').text().trim() + " on cubetube!";

    var winWidth = $(window).width();
    var winHeight = $(window).height();
    var winTop = (screen.height / 2) - (winHeight / 2);
    var winLeft = (screen.width / 2) - (winWidth / 2);

    window.open('http://www.facebook.com/sharer.php?u=' + url, 'pop', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
}

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    }else{
        return 'fail';
    }
}

function createVideo( id, container ) {
  var frame = $( '<iframe id="video-iframe" width="100%" height="100%" src="//www.youtube.com/embed/' + id + '?rel=0" frameborder="0" allowfullscreen></iframe>' );
  container.append(frame);
}
