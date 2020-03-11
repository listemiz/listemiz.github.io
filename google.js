// Client ID and API key from the Developer Console
var CLIENT_ID = '676098131753-moe956gvg3b76kms29bhjoqufdqid9ki.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDHqXCo6WfXcqRouWwIGTGMMcAI0UV4ljE';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

var googleButton = document.getElementById('google');
var welcomeText = document.getElementById('welcome');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle the initial sign-in state.  
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        googleButton.onclick = handleGoogle;
    }, function (error) {
        console.log(JSON.stringify(error, null, 2));
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        currentUser = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        googleButton.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
        // googleButton.innerHTML = '<img style="border-radius: 50%" src="' + currentUser.getImageUrl() + '"/>'        
        if (welcomeText != null) {
            welcomeText.innerHTML = 'Hi ' + currentUser.getGivenName() + '! <p class="subtitle"><a href="./movies">Movies</a> or <a href="tv">TV Shows</a>?</p>';
        }
    } else {
        googleButton.innerHTML = '<i class="fab fa-google"></i>';
        if (welcomeText != null) {
            welcomeText.innerHTML = 'First, sign in with Google!';
        }
    }
}

function handleGoogle() {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        gapi.auth2.getAuthInstance().signOut();
    } else {
        gapi.auth2.getAuthInstance().signIn();
    }
}