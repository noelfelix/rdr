angular.module('booklist.meetup', [])

.controller('MeetupCreateController', ['$scope', '$http', '$window', 'Event', function($scope, $http, $window, Event){

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

    Event.setEventBook(currentBook);
    Event.setCurrentUser(currentUser);

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
          $window.location.href = '/#/meetup/' + res.data.book_id;
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

        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        geocoder.geocode({
          latLng: latlng
        }, function (results) {
          if (results[0]) {
            $('#locationSearch').attr('placeholder', results[0].formatted_address);
          }
        });

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
}])

.controller('MeetupController', ['$scope', '$http', '$routeParams', 'Event', function($scope, $http, $routeParams, Event){
  $scope.meetup = {
    location: undefined,
    book: undefined,
    dateTime: undefined,
    description: undefined
  };

  $scope.getMeetup = function (cb) {
    $http({
      method: 'Get',
      url: '/meetup/details/' + $routeParams.meetupID,
    }).then(function (res) {
      console.log(res);
      cb(res.data[0]);
    })
    .catch(function (err) {
      console.error(err);
    });
  }

  var cb = function (meetupData) {
    $scope.meetup = meetupData;

    var temp = $scope.meetup.location.split(',');
    var latlng = new google.maps.LatLng(parseFloat(temp[0]), parseFloat(temp[1]));
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({
      latLng: latlng
    }, function (results) {
      if (results[0]) {
        $scope.meetup.location = results[0].formatted_address;
        $scope.$apply();
      }
    });

    var mapEl = document.getElementById('map');

    mapEl.style.height = '250px';

    map = new google.maps.Map(mapEl, {
      center: latlng,
      scrollwheel: true,
      zoom: 15,
      disableDefaultUI: true
    });

    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      title: 'Rdr Meetup!'
    });
  }

  $scope.joinMeetup = function () {
    var id = Event.getCurrentUser().profile.user_id;
    $http({
      method: 'Post',
      url: '/meetup/details/' + $routeParams.meetupID,
      data: {
        join: true,
        id: id
      }
    })
    .then(function (res) {
      console.log(res);
    });
  }

  $scope.getMeetup(cb);
}])
.factory('Event', ['auth', function(auth) {
  var eventBook = undefined;
  var eventHost = auth;
  var meetup = undefined;

  var setMeetup = function (input) {
    meetup = input;
  }

  var getMeetup = function () {
    return meetup;
  }

  var setEventBook = function(book) {
    eventBook = book;
  };

  var getEventBook = function () {
    return eventBook;
  }

  var setCurrentUser = function (host) {
    eventHost = host;
  }

  var getCurrentUser = function () {
    return eventHost;
  }

  return {
    setMeetup: setMeetup,
    getMeetup: getMeetup,
    setEventBook: setEventBook,
    getEventBook: getEventBook,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser
  };
}]);