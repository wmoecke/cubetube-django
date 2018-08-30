/**
 * Viz Cards
 */

var $cards = $('.viz-card');
var frameTemplate = '<iframe class="viz-template"></iframe>';
var createTemplate = '<iframe class="create-template"></iframe>';
var $body = $(document.body);
var $glass = $('.glass');

$('.create').click(function(e) {
    e.preventDefault();
    openCreate();
})

$('.glass').click(function() {
    closeViz();
    closeCreate();
});

function bindListener() {
    window.addEventListener("message", receiveMessage, false);
}

function receiveMessage(event) {

    // Open code area even more!
    if( event.data === "open" ) {
        $('.viz-template').addClass('more-open');
    } else if (event.data === "close") {
        $('.viz-template').removeClass('more-open');
    }
}

function bindCards() {
    $( "body" ).on( "click", ".viz-card", function(e) {
      e.preventDefault();
      var $this = $(e.currentTarget);
      openViz( $this.attr('href') );
    });
}

function openViz( url ) {

    var frame = $( frameTemplate );
    frame.attr('src', url );

    $body.append( frame );
    $glass.show();
    $body.addClass('no-scroll');
};

function closeViz() {

    var $viz = $( '.viz-template' );
    if( $viz.length ) {
        $viz.removeClass('more-open');
        $glass.hide();
        $viz.remove();
        $body.removeClass('no-scroll');
    }
}

function openCreate() {
    var $header = $('nav:not(.always-small)');
    $header.addClass('small');
    
    var frame = $( createTemplate );
    frame.attr('src', '/create/' );

    $body.append( frame );
    $glass.show();
    $body.addClass('no-scroll');
}

function closeCreate() {
    var $viz = $( '.create-template' );
    if( $viz.length ) {
        $glass.hide();
        $viz.remove();
        $body.removeClass('no-scroll');
    }
}

if( $cards.length ) {
    bindCards();
    bindListener();

    var cards = $('.viz-cards');
    if( cards.length )  {

        id = cards.attr('data-viz');
        if( id ) {
            openViz( '/viz/' + id);
        }

    }
}
