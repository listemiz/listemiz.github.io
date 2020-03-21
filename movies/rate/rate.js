// Client ID and API key from the Developer Console
var CLIENT_ID = '676098131753-moe956gvg3b76kms29bhjoqufdqid9ki.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDHqXCo6WfXcqRouWwIGTGMMcAI0UV4ljE';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

var googleButton = document.getElementById('google');

var cardHolder = document.getElementById('movies');
var movies;
var ids = [];
var ratings = {};

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
    img = currentUser.getGivenName() == 'Doga' ? '../../doga.jpeg' : '../../basak.jpeg';
    googleButton.innerHTML = '<img style="border-radius: 50%" src="' + img + '"/>'
    showRatelist();
  } else {
    googleButton.innerHTML = '<i class="fab fa-google"></i>';
  }
}

function handleGoogle() {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    gapi.auth2.getAuthInstance().signOut();
  } else {
    gapi.auth2.getAuthInstance().signIn();
  }
}

function showRatelist() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1Mc1uBsKIMJP9ouEgEMPhZ3Asr2j9_BORXCorvRMSAGk',
    range: 'Ratings'
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
    ids.push(row[columns['ID']]);
    ratings[row[columns['ID']]] = {
      'Doga': row[columns['Doga Rating']],
      'Basak': row[columns['Basak Rating']]
    }

    if (row[columns['Poster Path']] != "") {
      poster = imageBase + posterSizes[3] + row[columns['Poster Path']];
    } else {
      poster = 'https://spidermanfull.com/wp-content/plugins/fakevideo/includes/templates_files/no-photo.jpg';
    }

    column = document.createElement('div');
    column.id = row[columns['ID']];
    column.classList.add('column', 'is-one-third-mobile', 'is-one-quarter-tablet', 'is-one-fifth-desktop', 'is-2-widescreen');
    column.innerHTML = `<div class="card">
                          <div class="card-image">
                            <figure class="image is-2by3">
                              <img src="${poster}">
                            </figure>
                          </div>
                          <div class="card-content">      
                            <nav class="level">
                              <div class="level-left">
                                <div class="level-item">
                                  <figure class="image is-32x32">
                                    <img class="is-rounded" src="../../doga.jpeg">
                                  </figure>
                                  <div style="padding-left: 5px;">
                                    ${rating(row[columns['Doga Rating']])}
                                  </div>
                                </div>
                              </div>
                              <div class="level-right">
                                <div class="level-item">                                
                                  <figure class="image is-32x32">
                                    <img class="is-rounded" src="../../basak.jpeg">
                                  </figure>
                                  <div style="padding-left: 5px;">
                                    ${rating(row[columns['Basak Rating']])}
                                  </div>
                                </div>
                              </div>
                            </nav>
                          </div>
                        </div>`;
    cardHolder.appendChild(column);
  }

  // for (i = 0; i < ids.length; i++) {
  //   id = ids[i];
  //   $(`.${id}`).starRating({
  //     starSize: 20,
  //     initialRating: ratings[id]['Doga'],
  //     readOnly: true
  //   })
  // }

  // $(".my-rating").starRating({
  //   starSize: 25
  // })

  //   $(".my-rating").starRating({
  //     starSize: 25,
  //     callback: function (currentRating, $el) {
  //       // console.log('DOM element ', $el);
  //       col = $el[0].parentNode.parentNode.parentNode.parentNode;
  //       ind = ids.indexOf(col.id);
  //       console.log(ind);

  //       var batchUpdateRequest = {
  //         requests: [
  //           {
  //             "deleteDimension": {
  //               "range": {
  //                 "dimension": "ROWS",
  //                 "startIndex": ind + 1,
  //                 "endIndex": ind + 2
  //               }
  //             }
  //           }
  //         ]
  //       }

  //       console.log(movies)
  //       appendToRatings(movies[ind+1].slice(0, 8), currentRating);

  //       gapi.client.sheets.spreadsheets.batchUpdate({
  //         spreadsheetId: '1Mc1uBsKIMJP9ouEgEMPhZ3Asr2j9_BORXCorvRMSAGk',
  //         resource: batchUpdateRequest
  //       }).then((response) => {
  //         console.log(response);
  //       });

  //       col.parentNode.removeChild(col);
  //       ids.splice(ind, 1);
  //       movies.splice(ind+1, 1);
  //     }
  //   });
}

function rating(x) {
  // col = 'has-text-warning'

  if (x == null || x == "") {
    x = '??';
    col = 'has-text-grey-light';
  } else if (x.length == 1) {
    x += '.0';
  }

  return x;

  // return `<span class="icon ${col}">
  //           <i class="fas fa-star"></i>
  //         </span>
  //         ${x}`
}

function appendToRatings(movie, rating) {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;

  var ratings;
  if (currentUser.getGivenName() == 'Doga') {
    ratings = [today, rating, ""];
  } else {
    ratings = [today, "", rating];
  }

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: '1Mc1uBsKIMJP9ouEgEMPhZ3Asr2j9_BORXCorvRMSAGk',
    range: 'Ratings',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        movie.concat(ratings)
      ]
    }
  }).then((response) => {
    var result = response.result;
    console.log(`${result.updates.updatedCells} cells appended.`)
  });
}