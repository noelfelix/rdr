angular.module('booklist.meetup', [])

.controller('MeetupController', ['$scope', '$http', '$window', 'Event', function($scope, $http, $window, Event){

  var currentBook = Event.getEventBook();
  var currentUser = Event.getCurrentUser();
  $('#meetup-submit').css({
    'background-color': '#6C7A89'
  });

  if (!(currentUser && currentBook)) {
    $window.location.href = '/#/';
  } else {
    $("#dtBox").DateTimePicker();
    console.log(currentBook);
    console.log(currentUser);

    $scope.currentBook = currentBook;

    $scope.meetup = {
      book: currentBook.id,
      id: currentUser.profile.user_id
    }

    $scope.verifiedLocation = false;

    $scope.storeMeetup = function(){
      if ($scope.meetup.location && $scope.meetup.dateTime && $scope.verifiedLocation) {
        var meetup = $scope.meetup;
        $http({
          method: 'Post',
          url: '/meetup/create',
          data: meetup
        }).then(function (res) {
          console.log(res);
        })
        .catch(function (err) {
          console.error(err);
        });
      } else {
        //TOAST
      }
    };

    var map;

    document.getElementById('locationSearch').focus();

    function initialize() {
      // Create a map object and specify the DOM element for display.

      var mapEl = document.getElementById('map');

      mapEl.style.height = '250px';

      navigator.geolocation.getCurrentPosition(function (position){

        $scope.meetup.location = '' + position.coords.latitude + ',' + position.coords.longitude;

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
        if (place.geometry) {
            map.panTo({lat: place.geometry.location.lat(), lng: place.geometry.location.lng()});
            $scope.meetup.location = '' + place.geometry.location.lat() + ',' + place.geometry.location.lng();
            $scope.verifiedLocation = true;
        }
      });
    }
      initialize();
  }
}]);