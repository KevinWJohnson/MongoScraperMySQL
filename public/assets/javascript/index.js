$(document).ready(function() {
    $(".movie-favorite").on("click", function(e){
        var movieId = $(this).attr("data-id");
        $.ajax({
            url: "/api/movie/" + movieId,
            method: "PUT",
            data: {
                "favorite": true
            }
        }).then(function(data){
            if(data){
                window.location.href = '/';
            }
        }).catch(function(err){
            alert(err);
        });
    });

    $(".movie-unfavorite").on("click", function(e){
        var movieId = $(this).attr("data-id");
        $.ajax({
            url: "/api/movie/" + movieId,
            method: "PUT",
            data: {
                "favorite": false
            }
        }).then(function(data){
            if(data){
                window.location.href = '/favorites';
            }
        }).catch(function(err){
            alert(err);
        });
    });
});