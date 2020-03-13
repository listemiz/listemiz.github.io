// Client ID and API key from the Developer Console
var CLIENT_ID = '676098131753-moe956gvg3b76kms29bhjoqufdqid9ki.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDHqXCo6WfXcqRouWwIGTGMMcAI0UV4ljE';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

var googleButton = document.getElementById('google');
var watchlist;
var ratings;

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
    img = currentUser.getGivenName() == 'Doga' ? '../doga.jpeg' : '../basak.jpeg';
    googleButton.innerHTML = '<img style="border-radius: 50%" src="' + img + '"/>'     
    initSelector();
  } else {
    googleButton.innerHTML = '<i class="fab fa-google"></i>';
  }
}

function handleGoogle() {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    gapi.auth2.getAuthInstance().signOut();
    window.location.reload(false); 
  } else {
    gapi.auth2.getAuthInstance().signIn();
  }
}

function initSelector() {
  gapi.client.sheets.spreadsheets.values.batchGet({
    spreadsheetId: '1Mc1uBsKIMJP9ouEgEMPhZ3Asr2j9_BORXCorvRMSAGk',
    ranges: ['Watchlist', 'Ratings']
  }).then((response) => {
    console.log(response)

    wl = response.result.valueRanges[0]
    rt = response.result.valueRanges[1]

    watchlist = new Set()
    for (i = 1; i < wl.values.length; i++) {
      watchlist.add(wl.values[i][0]);
    }
    console.log(watchlist);

    ratings = {}
    for (i = 1; i < rt.values.length; i++) {
      ratings[rt.values[i][0]] = {
        'Doga': rt.values[i][9],
        'Basak': rt.values[i][10],
      }
      // rateList.add(rt.values[i][0]);
    }
    console.log(ratings);

    $(document).ready(function () {
      $('#select-movie').select2({
        ajax: {
          url: tmdbBase + 'search/movie',
          dataType: 'json',
          delay: 250,
          minimumInputLength: 3,
          placeholder: "Type a movie title!",
          data: function (params) {
            return {
              api_key: tmdbKey,
              query: params.term,
            };
          },
          processResults: function (data) {
            return {
              'results': data.results.map(function (res) {
                return {
                  'id': res.id,
                  'text': res.title,
                  'genre_ids': res.genre_ids,
                  'popularity': res.popularity,
                  'release_date': res.release_date,
                  'language': res.original_language,
                  'overview': res.overview,
                  'poster_path': res.poster_path
                }
              })
            }
          }
        },
        templateResult: formatMovie,
        templateSelection: formatMovieSelection
      });

      $('#select-movie').on('select2:select', function (e) {
        var movie = e.params.data;
        createModal(movie);
      });

      $('.open-modal').click(toggleModalClasses);
      $('.close-modal').click(toggleModalClasses);
    });
    
    $('#select-movie').select2().maximizeSelect2Height();
  });
}

function formatMovie(movie) {
  var date, poster, overview;

  if (movie.release_date != null && movie.release_date != "") {
    date = `(${movie.release_date.substring(0,4)})`
  } else {
    date = '(????)'
  }

  if (movie.poster_path != null) {
    poster = imageBase + posterSizes[0] + movie.poster_path;
  } else {
    poster = 'https://spidermanfull.com/wp-content/plugins/fakevideo/includes/templates_files/no-photo.jpg';
  }

  if (movie.overview != null) {
    if (movie.overview.length > 300) {
      overview = movie.overview.substring(0, 300) + '...';
    } else {
      overview = movie.overview;
    }
  } else {
    overview = '';
  }

  var $movie = $(
    `<article class="media">
        <figure class="media-left">
          <p class="image">
            <img src="${poster}">
          </p>
        </figure>
        <div class="media-content">
          <nav class="level is-mobile">
            <div class="level-left">
              <div class="level-item">
                <p class="">
                  <b>${movie.text}</b>
                </p>
              </div>
            </div>

            <div class="level-right">
              <div class="level-item">
                <p class="">
                  <i>${date}</i>
                </p>
              </div>
            </div>
          </nav>

          <p id="movie-overview">${overview}</p>
        </div>
      </article>`
  )

  return $movie;
}

function formatMovieSelection(movie) {
  return "Type a movie title!"
}

function toggleModalClasses(event) {
  var modalId = event.currentTarget.dataset.modalId;
  var modal = $(modalId);
  modal.toggleClass('is-active');
  $('html').toggleClass('is-clipped');
}


function createModal(movie) {
  var date, poster, overview;

  if (movie.release_date != null && movie.release_date != "") {
    date = `(${movie.release_date.substring(0,4)})`
  } else {
    date = '(????)'
  }

  if (movie.poster_path != null) {
    poster = imageBase + posterSizes[1] + movie.poster_path;
  } else {
    poster = 'https://spidermanfull.com/wp-content/plugins/fakevideo/includes/templates_files/no-photo.jpg';
  }

  if (movie.overview != null) {
    overview = movie.overview;
  } else {
    overview = '';
  }

  var modal = $('#my-modal');
  var overview_elem = document.getElementById('movie-overview')
  var poster_elem = document.getElementById('poster');
  var title = document.getElementById('title');
  var genre_elem = document.getElementById('genre');
  var language_elem = document.getElementById('language');
  var addToList = document.getElementById('add-to-list');

  title.innerText = `${movie.text} ${date}`
  overview_elem.innerText = overview;
  poster_elem.src = poster;

  if (movie.genre_ids.length == 0) {
    genre_elem.innerText = 'Unknown Genre'
  } else {
    genre_elem.innerText = movie.genre_ids.map(id => genres['' + id]).join(', ');
  }

  if (movie.language == null) {
    movie.language = '??'
  }
  language_elem.innerText = movie.language.toUpperCase();

  if (watchlist.has('' + movie.id)) {
    addToList.disabled = true;
    addToList.innerText = 'Already in List'
  } else {
    addToList.disabled = false;
    addToList.innerText = 'Add to List'
  }

  addToList.onclick = function () {
    appendToList(movie);
    watchlist.add('' + movie.id);
    modal.toggleClass('is-active');
    $('html').toggleClass('is-clipped');
  }

  oldr = document.getElementById('old-rating');
  if (oldr != null) {
    oldr.parentNode.removeChild(oldr);
  }

  rating = document.createElement('div');
  rating.id = 'old-rating';
  document.getElementById('modal-footer').appendChild(rating);

  if (movie.id in ratings) {
    addToList.disabled = true;
    addToList.innerText = 'Watched'
    curRatings = ratings[movie.id]
    yourRating = currentUser.getGivenName() == 'Doga' ? curRatings['Doga'] : curRatings['Basak'];
    $('#old-rating').starRating({
      starSize: 25,
      initialRating: yourRating,
      readOnly: true,
      callback: function (currentRating, $el) {
        appendToRatings(movie, currentRating);
        modal.toggleClass('is-active');
        $('html').toggleClass('is-clipped');
      }
    })
  } else {
    $('#old-rating').starRating({
      starSize: 25,
      callback: function (currentRating, $el) {
        appendToRatings(movie, currentRating);
        modal.toggleClass('is-active');
        $('html').toggleClass('is-clipped');
      }
    })
  }

  modal.toggleClass('is-active');
  $('html').toggleClass('is-clipped');
}

function appendToList(movie) {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;

  var dogaWants, basakWants;
  if (currentUser.getGivenName() == 'Doga') {
    dogaWants = true;
    basakWants = false;
  } else {
    dogaWants = false;
    basakWants = true;
  }

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: '1Mc1uBsKIMJP9ouEgEMPhZ3Asr2j9_BORXCorvRMSAGk',
    range: 'Watchlist',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        [movie.id,
          movie.text,
          movie.genre_ids.map(id => genres['' + id]).join(', '),
          movie.popularity,
          movie.release_date,
          movie.language,
          movie.overview,
          movie.poster_path,
          today,
          dogaWants,
          basakWants
        ]
      ]
    }
  }).then((response) => {
    var result = response.result;
    console.log(`${result.updates.updatedCells} cells appended.`)
  });
}

function appendToRatings(movie, rating) {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;

  var dogaRating, basakRating;
  if (currentUser.getGivenName() == 'Doga') {
    dogaRating = rating;
    basakRating = "";
  } else {
    dogaRating = "";
    basakRating = rating;
  }

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: '1Mc1uBsKIMJP9ouEgEMPhZ3Asr2j9_BORXCorvRMSAGk',
    range: 'Ratings',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        [movie.id,
          movie.text,
          movie.genre_ids.map(id => genres['' + id]).join(', '),
          movie.popularity,
          movie.release_date,
          movie.language,
          movie.overview,
          movie.poster_path,
          today,
          dogaRating,
          basakRating
        ]
      ]
    }
  }).then((response) => {
    var result = response.result;
    console.log(`${result.updates.updatedCells} cells appended.`)
  });
}