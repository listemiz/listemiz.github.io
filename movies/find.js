var tmdbBase = 'https://api.themoviedb.org/3/';
var tmdbKey = '09bd1912d223a0bbe8c486692bd70a9d';

var imageBase;
var posterSizes;

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

  $('#select-movie').select2({
    ajax: {
      url: tmdbBase + 'search/movie',
      dataType: 'json',
      delay: 250,
      minimumInputLength: 3,
      placeholder: "Type a movie name",
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
    templateResult: formatMovie
  });
});

$('#select-movie').select2().maximizeSelect2Height();

function formatMovie(movie) {
  // console.log(movie)
  // return movie.text + ' ' + movie.release_date;
  if (movie.poster_path != null) {
    var $movie = $(
      '<span><img src="' + imageBase + posterSizes[0] + movie.poster_path + '"/>' + movie.text + '</span>'
    );
    return $movie;
  } else {
    return movie.text;
  }
}