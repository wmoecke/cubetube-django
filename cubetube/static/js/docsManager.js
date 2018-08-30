var $sidebar = $('.docs-nav');
var $docs    = $('.docs-main')
var turningPoint = 0;
var endingPoint = 0;

if( $sidebar.length ) {

    $sidebar.height
    turningPoint = $sidebar.offset().top - 55; // added header height.
    endingPoint = $docs.offset().top + $docs.height() - $sidebar.height();

    var $window = $(window);
    $window.scroll(function() {
        var scrollPos = $window.scrollTop();
        if( scrollPos > endingPoint ) {
            $sidebar.removeClass('fixed').addClass('absolute');
        } else if ( scrollPos > turningPoint ) {
            $sidebar.addClass('fixed').removeClass('absolute');
        } else {
            $sidebar.removeClass('fixed').removeClass('absolute');
        }
    })

    // Set height of sidebar & handle resizes

    // Click events on the sidebar
    $('.docs-nav li').click(function() {

        var $this = $(this);
        var className = $(this).attr('class');
        className = jQuery.trim(className.split('bolder').join(''));

        var moveTo = $('#' + className);
        $('html, body').animate({
                scrollTop: moveTo.offset().top - 80
        }, 500);
    });

}