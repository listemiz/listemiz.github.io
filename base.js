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
});