// Client ID and API key from the Developer Console
var CLIENT_ID = '676098131753-moe956gvg3b76kms29bhjoqufdqid9ki.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDHqXCo6WfXcqRouWwIGTGMMcAI0UV4ljE';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

var googleButton = document.getElementById('google');
var cardHolder = document.getElementById('movies');

var watchlist, watchlistSize;
var ratings, ratingsSize;

var imageBase;
var posterSizes;
var genres;

var tmdbBase = 'https://api.themoviedb.org/3/';
var tmdbKey = '09bd1912d223a0bbe8c486692bd70a9d';

var deletedRows = [];

var movies, moviesInit;
var columns = {};

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
    showWatchlist();
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

function showWatchlist() {
  gapi.client.sheets.spreadsheets.values.batchGet({
    spreadsheetId: '1N9V3e9ZvrBHUrxTn82uAQKXoxqwYRnvnZ5n2x0UHTnw',
    ranges: ['Watchlist', 'Ratings']
  }).then((response) => {
    wl = response.result.valueRanges[0]
    rt = response.result.valueRanges[1]

    watchlist = {}
    for (i = 1; i < wl.values.length; i++) {
      watchlist[wl.values[i][0]] = {
        'Doga': wl.values[i][8],
        'Basak': wl.values[i][9],
        'row': i,
        'values': wl.values[i].slice(0, 8)
      }
    }
    watchlistSize = wl.values.length - 1;
    // console.log(watchlist); 
    // console.log(watchlistSize);
    moviesInit = wl.values;
    header = moviesInit[0]
    for (i = 0; i < header.length; i++) {
      columns[header[i]] = i;
    }
    movies = moviesInit.slice(1);

    ratings = {}
    for (i = 1; i < rt.values.length; i++) {
      ratings[rt.values[i][0]] = {
        'Doga': rt.values[i][8],
        'Basak': rt.values[i][9],
        'row': i
      }
    }
    ratingsSize = rt.values.length - 1;

    $(document).ready(function () {
      $.ajax({
        type: "GET",
        url: tmdbBase + "configuration?api_key=" + tmdbKey,
        success: function (result) {
          imageBase = result.images.secure_base_url;
          posterSizes = result.images.poster_sizes;

          genres = {};

          $.ajax({
            type: "GET",
            url: tmdbBase + "genre/tv/list?api_key=" + tmdbKey,
            success: function (result) {
              for (i = 0; i < result.genres.length; i++) {
                genres[result.genres[i].id] = result.genres[i].name;
              }
              $.ajax({
                type: "GET",
                url: tmdbBase + "genre/movie/list?api_key=" + tmdbKey,
                success: function (result) {
                  for (i = 0; i < result.genres.length; i++) {
                    genres[result.genres[i].id] = result.genres[i].name;
                  }
                  $('.open-modal').click(toggleModalClasses);
                  $('.close-modal').click(toggleModalClasses);
                  showMovies();
                },
                error: function (result) {
                  console.log(result)
                }
              });
            },
            error: function (result) {
              console.log(result)
            }
          });
        },
        error: function (result) {
          console.log(result)
        }
      });
    });
  });
}

function showMovies(filter = 'Basak or Doga') {
  for (i = 0; i < movies.length; i++) {
    row = movies[i];

    if (filter == 'Basak or Doga' || (filter == 'Basak' && row[columns['Basak Wants']] == 'TRUE') || (filter == 'Doga' && row[columns['Doga Wants']] == 'TRUE') || (filter == 'Basak and Doga' && row[columns['Basak Wants']] == 'TRUE' && row[columns['Doga Wants']] == 'TRUE')) {
      column = document.createElement('div');
      column.id = row[columns['ID']];
      column.classList.add('column', 'is-one-third-mobile', 'is-one-quarter-tablet', 'is-one-fifth-desktop', 'is-2-widescreen');
      column.innerHTML = `<div class="card">
                            <div class="card-image">
                              <figure class="image is-2by3">
                                <a onclick="createModal(${i})"><img id="poster${column.id}" src=""></a>
                              </figure>
                            </div>
                            <div class="card-content">      
                              <div class="content has-text-centered">
                                <div class="my-rating"></div>
                              </div>
                            </div>
                          </div>`;
      cardHolder.appendChild(column);

      $.ajax({
        type: "GET",
        url: tmdbBase + `tv/${column.id}?api_key=${tmdbKey}`,
        success: function (result) {
          if (result.poster_path === null) {
            document.getElementById(`poster${result.id}`).src = "../../unavailable342.png";
          } else {
            document.getElementById(`poster${result.id}`).src = imageBase + posterSizes[3] + result.poster_path;
          }
        }
      });
    }
  }

  $(".my-rating").starRating({
    starSize: 24,
    callback: function (currentRating, $el) {
      col = $el[0].parentNode.parentNode.parentNode.parentNode;

      if (col.id in ratings) {
        updateRating(col.id, currentRating);
      } else {
        appendToRatings(watchlist[col.id]['values'], currentRating);
      }

      if (watchlist[col.id][currentUser.getGivenName() == 'Doga' ? 'Basak' : 'Doga'] == 'TRUE') {
        updateList(col.id);
      } else {
        initialRow = watchlist[col.id]['row'];
        console.log(initialRow);

        offset = 0;
        for (i = 0; i < deletedRows.length; i++) {
          if (deletedRows[i] < initialRow) {
            offset++;
          }
        }

        deletedRows.push(initialRow);

        gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: '1N9V3e9ZvrBHUrxTn82uAQKXoxqwYRnvnZ5n2x0UHTnw',
          resource: {
            requests: [{
              "deleteDimension": {
                "range": {
                  "dimension": "ROWS",
                  "startIndex": initialRow - offset,
                  "endIndex": initialRow - offset + 1
                }
              }
            }]
          }
        }).then((response) => {
          console.log(response);
        });
      }
      col.parentNode.removeChild(col);
    }
  });
}

function appendToRatings(movie, rating) {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;

  var ratings;
  if (currentUser.getGivenName() == 'Doga') {
    ratings = [rating, "", today];
  } else {
    ratings = ["", rating, today];
  }

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: '1N9V3e9ZvrBHUrxTn82uAQKXoxqwYRnvnZ5n2x0UHTnw',
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

function updateList(movieId) {
  row = watchlist[movieId]['row'] + 1;
  column = currentUser.getGivenName() == 'Doga' ? 'I' : 'J';
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: '1N9V3e9ZvrBHUrxTn82uAQKXoxqwYRnvnZ5n2x0UHTnw',
    range: `Watchlist!${column}${row}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        ["FALSE"]
      ]
    }
  }).then((response) => {
    var result = response.result;
    console.log(`${result.updatedCells} cells updated.`);
  });
}

function updateRating(movieId, currentRating) {
  row = ratings[movieId]['row'] + 1;
  column = currentUser.getGivenName() == 'Doga' ? 'I' : 'J';
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: '1N9V3e9ZvrBHUrxTn82uAQKXoxqwYRnvnZ5n2x0UHTnw',
    range: `Ratings!${column}${row}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        ["" + currentRating]
      ]
    }
  }).then((response) => {
    var result = response.result;
    console.log(`${result.updatedCells} cells updated.`);
  });
}

function filterChanged() {
  filter = document.getElementById('filter').value;
  cardHolder.innerHTML = "";
  showMovies(filter);
}

function reSort() {
  desc = document.getElementById('desc').checked;
  order = document.getElementById('sort').value;
  filter = document.getElementById('filter').value;

  if (desc) {
    if (order == 'Release Date') {
      movies.sort((a, b) => b[columns[order]].localeCompare(a[columns[order]]));
    } else if (order == 'Date Added') {
      movies = moviesInit.slice(1);
      movies.reverse();
    } else {
      movies.sort((a, b) => b[columns[order]] - a[columns[order]]);
    }
  } else {
    if (order == 'Release Date') {
      movies.sort((a, b) => a[columns[order]].localeCompare(b[columns[order]]));
    } else if (order == 'Date Added') {
      movies = moviesInit.slice(1);
    } else {
      movies.sort((a, b) => a[columns[order]] - b[columns[order]]);
    }
  }

  cardHolder.innerHTML = "";
  showMovies(filter);
}

function toggleModalClasses(event) {
  var modalId = event.currentTarget.dataset.modalId;
  var modal = $(modalId);
  modal.toggleClass('is-active');
  $('html').toggleClass('is-clipped');
}

function createModal(movieRow) {
  movie = movies[movieRow];
  var modal = $('#my-modal');
  var date, poster;

  if (movie[columns['Release Date']] != "") {
    date = `(${movie[columns['Release Date']].substring(0,4)})`
  } else {
    date = '(????)'
  }

  if (movie[columns['Poster Path']] != "") {
    poster = imageBase + posterSizes[1] + movie[columns['Poster Path']];
  } else {
    poster = 'https://spidermanfull.com/wp-content/plugins/fakevideo/includes/templates_files/no-photo.jpg';
  }

  var overview_elem = document.getElementById('movie-overview')
  var poster_elem = document.getElementById('poster');
  var title = document.getElementById('title');
  var genre_elem = document.getElementById('genre');
  var language_elem = document.getElementById('language');

  title.innerText = `${movie[columns['Title']]} ${date}`
  overview_elem.innerText = movie[columns['Overview']];
  poster_elem.src = poster;

  if (movie[columns['Genres']] == "") {
    genre_elem.innerText = 'Unknown Genre';
  } else {
    genre_elem.innerText = movie[columns['Genres']];
  }

  if (movie.language == "") {
    language_elem.innerText = '??';
  } else {
    language_elem.innerText = movie[columns['Language']].toUpperCase();
  }

  modal.toggleClass('is-active');
  $('html').toggleClass('is-clipped');
}