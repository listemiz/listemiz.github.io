var tmdbBase = 'https://api.themoviedb.org/3/';
var tmdbKey = '09bd1912d223a0bbe8c486692bd70a9d';

var imageBase;
var posterSizes;

var genres = {};

$(document).ready(function () {
  $.ajax({
    type: "GET",
    url: tmdbBase + "configuration?api_key=" + tmdbKey,
    success: function (result) {
      imageBase = result.images.secure_base_url;
      posterSizes = result.images.poster_sizes;
    },
    error: function (result) {
      console.log(result)
    }
  })

  $.ajax({
    type: "GET",
    url: tmdbBase + "genre/movie/list?api_key=" + tmdbKey,
    success: function (result) {
      for (i = 0; i < result.genres.length; i++) {
        genres[result.genres[i].id] = result.genres[i].name;
      }
    },
    error: function (result) {
      console.log(result)
    }
  })

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
    getCurrentWatchList();
    createModal(movie);
  });
});

$('#select-movie').select2().maximizeSelect2Height();

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
};

$('.open-modal').click(toggleModalClasses);

$('.close-modal').click(toggleModalClasses);

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
    if (movie.overview.length > 300) {
      overview = movie.overview.substring(0, 300) + '...';
    } else {
      overview = movie.overview;
    }
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

  if (watchlist.has(''+movie.id)) {
    addToList.disabled = true;
    addToList.innerText = 'Already in List'
  } else {
    addToList.disabled = false;
    addToList.innerText = 'Add to List'
  }

  addToList.onclick = function() {
    appendToList(movie);
    watchlist.add(''+movie.id);
    console.log(watchlist)
    modal.toggleClass('is-active');
    $('html').toggleClass('is-clipped');
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