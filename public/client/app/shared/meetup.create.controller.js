angular.module('booklist.meetup', [])

.controller('MeetupController', ['$interval', '$scope', '$http', function($interval, $scope, $http){
  $("#dtBox").DateTimePicker();

  $scope.currentBook = {
    description: ''
  }

  $scope.meetup = {
    location: '',
    date: undefined,
    
  }

  $scope.getBookInfo = function () {
    $http({
      method: 'Get',
      url: 'https://www.googleapis.com/books/v1/volumes',
      params: {
        q: '9780156035767'
      }
    })
    .then(function (resp) {
      $scope.currentBook.description = resp.data.items[0].volumeInfo.description;
      $scope.currentBook.image = resp.data.items[0].volumeInfo.imageLinks.thumbnail;
    });
  };

  $scope.getBookInfo();

  $scope.storeMeetup = function(meetup){
    $http({
      method: 'Post',
      url: '/meetup/create',
      data: meetup
    }).then(function (res) {
      console.log(res);
    })
    .catch(function (err) {
      console.error(err);
    })
  };

  var map;
  $scope.verifiedLocation = false;

  document.getElementById('locationSearch').focus();

  function initialize() {
    // Create a map object and specify the DOM element for display.

    var mapEl = document.getElementById('map');

    mapEl.style.height = '' + document.getElementsByClassName('meetup-book')[0].offsetHeight + 'px';

    navigator.geolocation.getCurrentPosition(function (position){

      map = new google.maps.Map(mapEl, {
        center: {lat: position.coords.latitude, lng: position.coords.longitude},
        scrollwheel: true,
        zoom: 12,
        disableDefaultUI: true
      });

    });

    var searchBar = document.getElementById('locationSearch');
    var autocomplete = new google.maps.places.Autocomplete(searchBar);

    autocomplete.addListener('place_changed', function() {
      //VALIDATE LOCATION AND TOAST
      var place = autocomplete.getPlace();
      map.panTo({lat: place.geometry.location.lat(), lng: place.geometry.location.lng()});
      $scope.verifiedLocation = true;
      //NOt needed if no hide
      $scope.$apply();
    });
  }

  google.maps.event.addDomListener(window, 'load', initialize);
}]);