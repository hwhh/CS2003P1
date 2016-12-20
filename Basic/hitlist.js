const URL_START = "http://127.0.0.1:8983/solr/hitlist/select?indent=on&q=";
const URL_SORT = "%20sort=position%20desc,%20date%20desc";
const URL_START_DATE = "%20AND%20date:[";
const URL_BEGIN_DATE = "2000-01-01T00:00:00Z";
const URL_TO = "%20TO%20";
const URL_NOW = "NOW]";
const URL_END = "&wt=json";
const URL_END_DATE = "]";
const URL_TIME_ZONE = "Z";
const YOUTUBE_URL = "https://www.youtube.com/v/";

var app = angular.module('search', []);

app.controller('myCtrl', function($scope, $http) {
    $scope.myQuery = "";
    $scope.startDate = "";
    $scope.endDate = "";
    $scope.videoId ="";
    $scope.title ="";
    $scope.description="";
    $scope.videoObject = [];

    $scope.submitSearch = function() {
        //If video is currently playing stop it
        stopVideo();
        //check valid search entered
        if (!isEmpty($scope.myQuery)) {
            var URL = URL_START + $scope.myQuery;
            //Check if both dates inputs contain valid dates
            if (angular.isDate($scope.startDate) && angular.isDate($scope.endDate)) {
                //Check start date is before end date
                if (moment($scope.endDate).isAfter($scope.startDate)) {
                    URL += URL_START_DATE+moment($scope.startDate).format("YYYY-MM-DDThh:mm:ss")+URL_TIME_ZONE
                        +URL_TO + moment($scope.endDate).format("YYYY-MM-DDThh:mm:ss")+URL_TIME_ZONE+URL_END_DATE;
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
            URL +=URL_SORT+URL_END;
            //Make the ajax call
            $http({
                method: 'GET',
                url: URL
            }).then(function successCallback(response) {
                //convert the response from the server into an array of videos
                $scope.videoObject = filterArray(response.data.response.docs);
            }, function errorCallback(response) {
                window.alert("Something went wrong :(");
            });
        } else
            window.alert("Search input empty");
    };

    //Display the video playing area, and set the scope variables to the video parameters
    $scope.playVideo = function (item) {
        document.getElementById('video').style.display ="block";
        document.getElementById('defaultContent').style.display="none";
        $scope.title = item.title;
        $scope.description = item.description;
        $scope.videoId = item.videoId;
        var link = document.getElementById('iframe');
        link.src = YOUTUBE_URL+item.videoId;

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

//Limit the date pickers to have the max date as the current date

$(function(){
    $('[type="date"]').prop('max', function(){
        return new Date().toJSON().split('T')[0];
    });
});




/*
 if (!isEmpty($scope.myQuery)) {
 var URL = URL_START + $scope.myQuery;
 if (angular.isDate($scope.startDate) && angular.isDate($scope.endDate)) {
 if (moment($scope.endDate).isAfter($scope.startDate)) {
 URL += URL_START_DATE+moment($scope.startDate).format("YYYY-MM-DDThh:mm:ss")+URL_TIME_ZONE
 +URL_TO + moment($scope.endDate).format("YYYY-MM-DDThh:mm:ss")+URL_TIME_ZONE+URL_END_DATE;
 } else
 window.alert("Start date after end date");
 }
 else if (angular.isDate($scope.startDate) && !angular.isDate($scope.endDate)) {
 URL += URL_START_DATE + moment($scope.startDate).format("YYYY-MM-DDThh:mm:ss")+URL_TIME_ZONE + URL_TO + URL_NOW;
 }
 else if (!angular.isDate($scope.startDate) && angular.isDate($scope.endDate)) {
 URL += URL_START_DATE + URL_BEGIN_DATE +URL_TO+moment($scope.endDate).format("YYYY-MM-DDThh:mm:ss")+URL_TIME_ZONE+URL_END_DATE;
 }
 URL += URL_END;
 $http({
 method: 'GET',
 url: URL
 }).then(function successCallback(response) {
 $scope.videoObject = filterArray(response.data.response.docs);

 }, function errorCallback(response) {
 window.alert("Something went wrong :(");
 });
 } else
 window.alert("Search input empty");
 };*/
