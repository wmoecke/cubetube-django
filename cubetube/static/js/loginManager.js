/**
 * Login Management. 
 * - Built off Alex's spark login system.
 */
//var checkbox;
$(function(){
/*
    checkbox = $("#ToS");   // keep reference of checkbox

    $("#ToS").click(function() {
        var checked = checkbox.prop("checked");      // check checkbox status
	console.log(checked);
        checkbox.prop("checked", checked);
    });
*/

    var $popover = $( '.login-signup-popover' );
    var $glass   = $( '.glass' );
    if( $popover.length ) {

        // Show login signup
        $('.login').click(function(e) {
            e.preventDefault();
            $popover.show();
            $glass.show();
        });
        
        // Sign up forms exist, change type.
        $('.login-title .link').click(function() {
            if( $popover.hasClass('login') ) {
                $popover.removeClass('login').addClass('join');
            } else {
                $popover.removeClass('join').addClass('login');
            }
            clearError();
        });

        // Close the glass layer.
        $('.glass').click(function() {
            $popover.removeClass('join').addClass('login');
            $popover.hide();
            $glass.hide();
        });

        /**
         * Sign up... Registers a new user.
         */
        $('.signup-component .signup-button').click(function() {
            var email = $('.signup-component .email').val();
            var nickname = $('.signup-component .nickname').val();
            var password = $('.signup-component .password').val();
//	    var ToS=checkbox.prop("checked");
//	    console.log(ToS);
            clearError();
            createNewUser(email, nickname, password);
        });

        /**
         * Sign in
         */
        $('.login-component .login').click(function() {
            var email = $('.login-component .email').val();
            var password = $('.login-component .password').val();
            clearError();
            sparkLogin(email, password);
        });
    }

    /**
     * Log out
     */
    $('.logout').click(function(e) {
        e.preventDefault();
        $.removeCookie("accessToken", { path: '/' });
        $.removeCookie("username", { path: '/' });
        $.removeCookie("nickname", { path: '/' });
        $.removeCookie("coreID", { path: '/' });
        location.reload();
    })
});

function createNewUser(email, nickname, password) {
    
    // Register with spark.
    window.spark.createUser(email, password, function(err, data) {
    
        // We try to login and get back an accessToken to verify user creation
        if (!err) {
            sparkSignup(email, nickname, password);
        } else {
            if(err.message.indexOf("already exists")>-1) {
                sparkSignup(email, nickname, password);
            } else {
                displayError(err);
            }
        }
    });
}

// Signs up to spark, and then logs you in.
function sparkSignup(email, nickname, password) {
    var loginPromise = window.spark.login({ username: email, password: password });
    loginPromise.then(function(data){
        // They have logged in with spark.

        var accessToken = data.access_token;
        $.cookie("accessToken", data.access_token, { expires: data.expires_in/86400 , path: '/'});

        //let the server know that we're logged in
        $.post("/login/", {
            email: email,
            accessToken: data.access_token,
            dataType: 'script',
        }).success(function(data) {
            
            // Logged in.
            if( data['status'] == "ok" ) {
                nickname=data['nickname'];
                $.cookie("nickname", nickname, { expires: data.expires_in/86400 , path: '/'});
                location.reload();

            // Create new user
            } else if ( data['status'] == "newUser" ) {
                cubetubeSignup(email, accessToken, nickname)
            }
        }).error(function(data) {});

    }, function(error){
        displayError(error);
    });
}

//looks to see                
function checkCookie()
{
    accessToken=$.cookie("accessToken");
    username=$.cookie("username");
    nickname=$.cookie("nickname");
    coreID=$.cookie("coreID");
    if(!(accessToken === undefined || accessToken === null))
	{
	    loginWithAccessToken();
	}
    //    else
    //    setLoggedOut();
}

function loginWithAccessToken()
{
    var loginPromise = window.spark.login({ accessToken: accessToken });
    loginPromise.then(
		      function(data) {
			  console.log("logged in");
		      });
}

// Logs into spark, or errors.
function sparkLogin(email, password) {
    var loginPromise = window.spark.login({ username: email, password: password });
    loginPromise.then(function(data){
        // They have logged in with spark.

        var accessToken = data.access_token;
        $.cookie("accessToken", data.access_token, { expires: data.expires_in/86400 , path: '/'});

        //let the server know that we're logged in
        $.post("/login/", {
            email: email,
            accessToken: data.access_token,
            dataType: 'script',
        }).success(function(data) {
            
            // Logged in.
            if( data['status'] == "ok" ) {
                nickname=data['nickname'];
                $.cookie("nickname", nickname, { expires: data.expires_in/86400 , path: '/'});
                location.reload();
            } else {
                cubetubeSignup(email, accessToken, email.split('@')[0]);
            }

        }).error(function(data) {
            cubetubeSignup(email, accessToken, email.split('@')[0]);
        });

    }, function(error){
        displayError(error, "Sorry, already used username or email!");
    });
}

function cubetubeSignup(email, accessToken, nickname) {
    $.ajax({
        type: 'post',
        url: '/newUser/',
        data: {
            email: email,
            accessToken: accessToken,
            nickname: nickname
        },
        success: function( data ) {
            nickname=data['nickname'];
            $.cookie("nickname", nickname, { expires: data.expires_in/86400 , path: '/'});
            location.reload();
        },
        error: function( errorMessage ) {
            console.log( errorMessage );
        }
    })
}

function displayError(error, message) {

    if( message ) {
        $('.error-area').html(message);
        return;
    }
    
    // Invalid username or password
    if( error.message === 'invalid_grant' ) {
        $('.error-area').html('Sorry, invalid name or password');
    } else if (error.message === 'Username must be an email address.') {
        $('.error-area').html('Urp, username must be an email address!');
    }
}

function clearError() {
    $('.error-area').html('')
}