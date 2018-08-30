/**
 * Comment manager
 * -- Handles user comments.
 */

var commentTemplate = '<div class="viz-comment"><span class="author"></span> <span class="said">said</span><p>This is amazing!</p></div>';

$(function(){

    $('.submit-comment').click(function() {

        var comment = $('.comments-input').val();
        
        // Loose validation.
        if( comment === '') {
            return;
        }

        var vizId  = parseInt($('.viz-wrapper').attr('data-viz-id'));

        postComment(comment, vizId)
    });

});

function postComment(comment, vizId) {

    $.ajax({
        type: 'post',
        url: '/newComment/',
        data: {
            comment: comment,
            viz: vizId
        },
        success: function(data) {
            appendComment(data, comment);
        },
        error: function(data) {
            console.log( data );
        }
    })
}

function appendComment(data, comment) {
    var $comment = $(commentTemplate);
    $comment.find('.author').html(data.nickname);
    $comment.find('p').html(comment);
    $('.comments-go-here').append($comment);
    
    // Clear current input & scroll to bottom
    $('.comments-input').val('');
    document.body.scrollTop = document.body.scrollHeight;
}
