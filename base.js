var tmdbBase = 'https://api.themoviedb.org/3/';
var tmdbKey = '09bd1912d223a0bbe8c486692bd70a9d';

var imageBase;
var posterSizes;
var genres;

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

    genres = {}

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
});