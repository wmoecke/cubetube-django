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

 $.get('/static/js/l3d-library.js', function(data) {
      library=data;

      var vizType = getVizType();
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
      
 }, 'text');

$(function(){
    // Init!

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


    $('.run-sketch').click(function() {

        var vizType = getVizType();

        if( vizType === 'L3D') {
            translateCode(document.getElementById("code").value);
            runSparkSketch();
        } else if ( vizType === 'javascript' ) {
            runSketch();
        }
    });
});

console.log( "whsajkdhkjashdjksahdjkash" );
$('.scroll').click(function(e) {
    e.preventDefault();
    var $this = $(this);
    var url = $this.attr('url');

    $.ajax({
      type: 'get',
      url: url,
      success: function(data) {
        $this.replaceWith( data );
      }
    })
});

function setHeight() {
    $( '.CodeMirror' ).height(window.innerHeight - 180)
}

window.onresize = setHeight;

/**
 * Functions
 */
function getVizType(id) {
    var $wrapper = $('.viz-wrapper'+id);
    return $wrapper.attr('data-viz-type');
}

function getVizUrl(id) {
    var $wrapper = $('.viz-wrapper'+id);
    return $wrapper.attr('data-viz-url');
}

