const URL_START = "http://127.0.0.1:8983/solr/hitlist/select?indent=on&q=";
const URL_SORT = "%20sort=position%20desc,%20date%20desc";
const URL_START_DATE = "%20AND%20date:[";
const URL_BEGIN_DATE = "2000-01-01T00:00:00Z";
const URL_TO = "%20TO%20";
const URL_NOW = "NOW]";
const URL_END = "&wt=json";
const URL_END_DATE = "]";
const URL_TIME_ZONE = "Z";
const YOUTUBE_URL = "http://www.youtube.com/embed/";
const YOUTUBE_URL_END = "?enablejsapi=1";
const YOUTUBE_URL_ORAGIN = "&origin=http://127.0.0.1:8983/hitlist/";


//Loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//Global variables
var player;
var videoPlaylist = [];
var playing = false;

//This function populates the iframe after the API code downloads.
function onYouTubeIframeAPIReady(video) {
    document.getElementById('videoTitle').innerHTML = video.title;
    document.getElementById('description').innerHTML = video.description;
    getJSON(video.videoId);
    player = new YT.Player('iframe', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    //Set the source url for the the iframe to the url for the video
    var link = document.getElementById('iframe');
    link.src = YOUTUBE_URL+video.videoId+YOUTUBE_URL_END;//YOUTUBE_URL_ORAGIN;
}

// autoplay video
function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    // when video ends
    if (event.data === 0) {
        //load the next video in the playlist if there is one
        onYouTubeIframeAPIReady(videoPlaylist[0]);
        videoPlaylist.splice(0, 1);
        //Remove clear button if playlist empty
        if(videoPlaylist.length === 0)
            document.getElementById('clear').style.display ="none";
        else{
            document.getElementById('clear').style.display ="block";
        }
        //Remove videos from the playlist when their played
        var elem = document.getElementById('id');
        elem.parentNode.removeChild(elem);
        //when video is playing
    } else if (event.data === 1){
        playing=true;
    }
}


var app = angular.module('search', []);
app.controller('myCtrl', function($scope, $http) {
    //Variables
    $scope.myQuery = "*:*";//When page loads find top videos
    $scope.startDate = "";
    $scope.endDate = "";
    $scope.videoId ="";
    $scope.title ="";
    $scope.description="";
    $scope.videoObject = [];
    $scope.videoPlaylist = videoPlaylist;

    $scope.submitSearch = function() {
        //If the video playlist is empty and the user searches for a new video, close the currently playing video
        if (videoPlaylist.length === 0){
            stopVideo();
            document.getElementById('video').style.display ="none";
            document.getElementById('videoPlaylist').style.display ="none";
            document.getElementById('defaultContent').style.display="block";
        }
        //check valid search entered
        if (!isEmpty($scope.myQuery)) {
            var URL = URL_START + $scope.myQuery;
            //Check if both dates inputs contain valid dates
            if (angular.isDate($scope.startDate) && angular.isDate($scope.endDate)) {
                //Check start date is before end date
                if (moment($scope.endDate).isAfter($scope.startDate)) {
                    URL += URL_START_DATE+moment($scope.startDate).format("YYYY-MM-DDThh:mm:ss")+URL_TIME_ZONE+URL_TO + moment($scope.endDate).format("YYYY-MM-DDThh:mm:ss")+URL_TIME_ZONE+URL_END_DATE;
                } else
                    window.alert("Start date after end date");
            }
            //Check only the start date input contains a valid
            else if (angular.isDate($scope.startDate) && !angular.isDate($scope.endDate)) {
                URL += URL_START_DATE + moment($scope.startDate).format("YYYY-MM-DDThh:mm:ss")+URL_TIME_ZONE + URL_TO + URL_NOW;
            }
            //Check only the end date input contains a valid
            else if (!angular.isDate($scope.startDate) && angular.isDate($scope.endDate)) {
                URL += URL_START_DATE + URL_BEGIN_DATE +URL_TO+moment($scope.endDate).format("YYYY-MM-DDThh:mm:ss")+URL_TIME_ZONE+URL_END_DATE;
            }
            URL += URL_SORT+URL_END;
            //Make the ajax call
            $http({
                method: 'GET',
                url: URL
            }).then(function successCallback(response) {
                //convert the response from the server into an array of videos
                $scope.videoObject = filterArray(response.data.response.docs);
                //Scroll down to the results
                document.getElementById('main').scrollIntoView(true);
                $scope.myQuery = "";
            }, function errorCallback(response) {
                window.alert("Something went wrong :(");
            });
        } else
            window.alert("Search input empty");
    };

    //Add a returned video to a playlist
    $scope.addToPlaylist = function(video){
        if(videoPlaylist.length === 0 && !playing){
            $scope.playVideo(video);
        }
        //Check the video isn't already in the playlist
        else if(videoPlaylist.indexOf(video) === -1 && playing) {
            videoPlaylist.push(video);
            document.getElementById('videoPlaylist').style.display = "block";
        }
    };

    //Remove a video from the playlist
    $scope.removeFromPlaylist = function(video){
        var indexOfVideo = videoPlaylist.indexOf(video);
        //Check the video isn't already in the playlist
        if( indexOfVideo != -1) {
            videoPlaylist.splice(indexOfVideo, 1);
        }
        //Remove clear button if playlist empty
        if(videoPlaylist.length === 0){
            document.getElementById('clear').style.display ="none";
        }
    };

    //Clear the playlist
    $scope.clearPlaylist = function () {
        videoPlaylist = [];
        //Remove video playlist section if playlist empty
        document.getElementById('videoPlaylist').style.display ="none";
    };

    //Display the video playing area, and set the scope variables to the video parameters
    $scope.playVideo = function (item) {
        onYouTubeIframeAPIReady (item);
        document.getElementById('video').style.display ="block";
        document.getElementById('defaultContent').style.display="none";
        $scope.title = item.title;
        $scope.description = item.description;
        $scope.videoId = item.videoId;

    };

});

//New directive which allows right click detection
app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick); //Allow functions to be called on right click
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

//Stop the currently playing iframe video
function stopVideo() {
    $("iframe").each(function() {
        //Set the src atrribute of the iframe to null
        var src= $(this).attr('src');
        $(this).attr('src',src);
    });
}

//Remove duplicates from an array
function filterArray(inputArray) {
    var arrayWithoutDuplicates = [];
    inputArray.forEach(function(itm) {
        var unique = true;
        arrayWithoutDuplicates.forEach(function(itm2) {
            //check if the video ID in the input array is in the output array
            if (itm.videoId == itm2.videoId)
                unique = false;
        });
        if (unique)
            arrayWithoutDuplicates.push(itm);
    });
    return arrayWithoutDuplicates;
}

//Check if a string is empty
function isEmpty(str) {
    return (!str || 0 === str.length);
}

//Get data about the currently playing video using the youtube data API v3
function getJSON(videoID) {
    var URL = 'https://www.googleapis.com/youtube/v3/videos?id='+videoID+'&key=AIzaSyBj8KKpFyTlOer0lemWuKbqEYKHccXEx7A&part=snippet,contentDetails,statistics,status';
    //Parse the JSON document returned
    $.getJSON(URL, function(jd) {
        var item = jd.items;
        document.getElementById("viewCount").innerHTML = "View count : "+ item[0].statistics.viewCount;
    });
}

//Limit the date pickers to have the max date as the current date
$(function(){
    $('[type="date"]').prop('max', function(){
        return new Date().toJSON().split('T')[0];
    });
});

