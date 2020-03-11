// Client ID and API key from the Developer Console
var CLIENT_ID = '676098131753-moe956gvg3b76kms29bhjoqufdqid9ki.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDHqXCo6WfXcqRouWwIGTGMMcAI0UV4ljE';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

var googleButton = document.getElementById('google');
var welcomeText = document.getElementById('welcome');

var cardHolder = document.getElementById('movies');
var movies;

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
    if (welcomeText != null) {
      welcomeText.innerHTML = 'Hi ' + currentUser.getGivenName() + '! <p class="subtitle"><a href="./movies">Movies</a> or <a href="tv">TV Shows</a>?</p>';
    }
    showWatchlist();
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

function showWatchlist() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1Mc1uBsKIMJP9ouEgEMPhZ3Asr2j9_BORXCorvRMSAGk',
    range: 'Watchlist'
  }).then((response) => {
    movies = response.result.values;
    showMovies(movies);
  });
}

function showMovies(movies) {
  var columns = {}
  header = movies[0]
  for (i = 0; i < header.length; i++) {
    columns[header[i]] = i;
  }

  for (i = 1; i < movies.length; i++) {
    row = movies[i];

    if (row[columns['Poster Path']] != "") {
      poster = imageBase + posterSizes[3] + row[columns['Poster Path']];
    } else {
      poster = 'https://spidermanfull.com/wp-content/plugins/fakevideo/includes/templates_files/no-photo.jpg';
    }

    column = document.createElement('div');
    column.classList.add('column', 'is-one-third-mobile', 'is-one-quarter-tablet', 'is-one-fifth-desktop', 'is-2-widescreen');
    column.innerHTML = `<div class="card">
                          <div class="card-image">
                            <figure class="image is-2by3">
                              <img src="${poster}">
                            </figure>
                          </div>
                          <div class="card-content">      
                            <div class="content has-text-centered">
                              <div class="my-rating"></div>
                            </div>
                          </div>
                        </div>`;
    cardHolder.appendChild(column);
  }

  $(".my-rating").starRating({
    starSize: 25,
    callback: function (currentRating, $el) {
      console.log('DOM element ', $el);
      col = $el[0].parentNode.parentNode.parentNode.parentNode;      
      col.parentNode.removeChild(col);
    }
  });
}