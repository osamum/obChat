
    // This is called with the results from from FB.getLoginStatus().
    function statusChangeCallback(response) {
        if (response.status === 'connected') {
            // Logged into your app and Facebook.
            FbConnected();
        } else {
            // The person is not logged into your app or we are unable to tell.
            document.getElementById('status').innerHTML = '☝ Facebook ログインボタンをクリックしてログインしてください。';
        }
    }

    // This function is called when someone finishes with the Login
    // Button.  See the onlogin handler attached to it in the sample
    // code below.
    function checkLoginState() {
        FB.getLoginStatus(function (response) {
            statusChangeCallback(response);
        });
    }



    //html から呼び出し
    function setFbAsncInit() {
        window.fbAsyncInit = function () {
            FB.init({
                //Azure
                appId: '142273419202390',
                //debug
                //appId: '1456944887863138',
                cookie: true,  // enable cookies to allow the server to access 
                // the session
                xfbml: true,  // parse social plugins on this page
                version: 'v2.8' // use graph api version 2.8
            });

            FB.getLoginStatus(function (response) {
                statusChangeCallback(response);
            });
        };

        // Load the SDK asynchronously
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }


    // Here we run a very simple test of the Graph API after login is
    // successful.  See statusChangeCallback() for when this call is made.
    function FbConnected() {
        FB.api('/me', function (response) {
            document.getElementById('status').innerText =  response.name + ' さん、Nicebook にようこそ!';
            FbConnected.callBack(response.name,response.id);
        });
    }
/**
 * Facebook のページとプロフィール写真の URL を返す
 * @mkFbLink
 * @param {string} accountId ユーザー ID
 * @return {object}
 */
function mkFbLink(accountId) {
    return {
        'fbUrl': 'https://www.facebook.com/' + accountId,
        'imgUrl': 'https://graph.facebook.com/' + accountId + '/picture'
    };
}





