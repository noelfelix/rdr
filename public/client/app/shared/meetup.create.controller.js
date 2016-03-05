angular.module('booklist.meetup', [])

.controller('MeetupController', ['$scope', '$http', '$window', 'Event', function($scope, $http, $window, Event){

  var currentBook = Event.getEventBook();
  var currentUser = Event.getCurrentUser();

  if (!(currentUser && currentBook)) {
    $window.location.href = '/#/';
  } else {
    $("#dtBox").DateTimePicker();
    console.log(currentBook);
    console.log(currentUser);

    $scope.currentBook = currentBook;

    $scope.meetup = {
      location: 'ITS AT A PLACE',
      description: 'THIS IS A BOOK MEETING',
      dateTime: new Date(),
      book: currentBook.id,
      id: currentUser.profile.user_id
    }

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

    // $scope.storeMeetup($scope.meetup);

    $scope.getBookInfo = function (ISBN) {
      $http({
        method: 'Get',
        url: 'https://www.googleapis.com/books/v1/volumes?q=flowers&key=AIzaSyBAuz81OtpWMeLkOZsApqeZZHD-91yImdQ'
      })
      .then(function (resp) {
        $scope.currentBook.description = resp.data.items[0].volumeInfo.description;
        $scope.currentBook.image = resp.data.items[0].volumeInfo.imageLinks.thumbnail;
      })
      .catch(function(error){
        console.error(error);
      });
    };

    $scope.getBookInfo();

    var map;
    $scope.verifiedLocation = false;

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
        map.panTo({lat: place.geometry.location.lat(), lng: place.geometry.location.lng()});
        $scope.meetup.location = '' + place.geometry.location.lat() + ',' + place.geometry.location.lng();
        $scope.verifiedLocation = true;
        //NOt needed if no hide
        $scope.$apply();
      });
    }
      initialize();
  }
}]);