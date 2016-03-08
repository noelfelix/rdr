angular.module('booklist.meetup', [])

.controller('MeetupListController', ['$scope', '$routeParams', '$location', '$http', 'MeetupList', 'Event', function($scope, $routeParams, $location, $http, MeetupList, Event) {
  var book_id = $routeParams.bookID;
  var eventBook = Event.getEventBook();
  // if the book details are available through the event, use them, otherwise get them
  if (eventBook) {
    $scope.book = eventBook;
  } else {
    $http({
      method: 'GET',
      url: '/books/' + book_id
    }).then(function (res) {
      $scope.book = res.data;
    });
  }

  MeetupList.getMeetups(book_id, function (meetups) {
    $scope.meetups = meetups;
  });

  $scope.createMeetup = function () {
    $location.path('/create');
  };
}])

.controller('MeetupCreateController', ['$scope', '$http', '$window', 'Event', 'Books', function($scope, $http, $window, Event, Books){

  var currentBook = Event.getEventBook();
  var currentUser = Event.getCurrentUser();
  $('#meetup-submit').css({
    'background-color': '#6C7A89'
  });

  if (!(currentUser && currentBook)) {
    $window.location.href = '/#/';
  } else {
    $("#dtBox").DateTimePicker();


    Event.setMeetup(undefined);
    
    $scope.$apply;

    Event.setEventBook(currentBook);
    Event.setCurrentUser(currentUser);

    $scope.currentBook = currentBook;
    if (currentBook.title.length > 45) {
      currentBook.title = currentBook.title.substring(0,40) + ' ...';
    }

    Books.queryAmazon({title: currentBook.ISBN, authorName: currentBook.authorName})
    .then(function (results) {
      console.log(results);
      if (results.data[0] && !results.data[0].Error) {
        $('#book-description').append($('<div>' + results.data[0].EditorialReviews[0].EditorialReview[0].Content[0] + '</div>'));
      } else {
        $scope.amazonResults = [];
      }
    });

    $scope.meetup = {
      book: currentBook.id,
      id: currentUser.profile.user_id
    };

    $scope.verifiedLocation = false;

    $scope.storeMeetup = function(){
      if ($scope.meetup.location && $scope.meetup.dateTime && $scope.verifiedLocation) {
        var meetup = JSON.parse(JSON.stringify($scope.meetup));
        var dateTime = meetup.dateTime.toString().split('-');
        var temp = dateTime[0];
        dateTime[0] = dateTime[1];
        dateTime[1] = temp;
        meetup.dateTime = new Date(new Date(dateTime.join('-')).getTime() - 28800000);

        if(meetup.description === undefined) {
          meetup.description = "Another great Rdr meetup!";
        }

        $http({
          method: 'Post',
          url: '/meetup/create',
          data: meetup
        }).then(function (res) {
          console.log(res);
          $window.location.href = '/#/meetup/' + res.data.id;
        })
        .catch(function (err) {
          console.error(err);
        });
      } else {
        Materialize.toast('Must set valid Location and Date', 2000);
      }
    };

    var map;
    var markers = [];

    document.getElementById('locationSearch').focus();

    $scope.find = function (category) {
      $("html, body").animate({ scrollTop: 0 }, 200);
      console.log(category);
      var temp = $scope.meetup.location.split(',');
      var latlng = new google.maps.LatLng(parseFloat(temp[0]), parseFloat(temp[1]));
      var service = new google.maps.places.PlacesService(map);
      var bounds = new google.maps.LatLngBounds();
      var infoWindows = [];
      
      var addMarkerWithTimeout = function (location, content, timeout) {
        var marker = new google.maps.Marker({
          position: location,
          animation: google.maps.Animation.DROP,
          map: map
        });

        var infoWindow = new google.maps.InfoWindow({
          content: content
        });

        marker.addListener('click', function() {
        
          if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
          } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
          }
          $scope.meetup.location = '' + marker.position.lat() + ',' + marker.position.lng();
          $scope.verifiedLocation = true;
          var geocoder = new google.maps.Geocoder();

          geocoder.geocode({
            latLng: marker.position
          }, function (results) {
            if (results[0]) {
              $('#locationSearch').val(results[0].formatted_address.split(',').slice(0,3).join(','));
              $scope.$apply();
            }
          });

          Materialize.toast('Location set', 2000);
        });

        marker.addListener('mouseover', function() {
          infoWindow.open(map, marker);
        });

        marker.addListener('mouseout', function() {
          infoWindow.close(map, marker);
        });

        markers.push(marker);
      }

      var removeMarkers = function () {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
        markers = [];
      }

      removeMarkers();

      service.nearbySearch({
        location: latlng,
        radius: 6000,
        type: category
      }, function (results) {
        console.log(results);
        for (var i = 0; i < 5 && i < results.length; i++) {
          (function() {
            addMarkerWithTimeout(results[i].geometry.location, results[i].name, i * 200);
            bounds.extend(results[i].geometry.location);
          }());
        }

        map.fitBounds(bounds);
      });
    }

    function initialize() {
      // Create a map object and specify the DOM element for display.

      navigator.geolocation.getCurrentPosition(function (position){

        var mapEl = document.getElementById('map');

        mapEl.style.height = $('#bookCard').height() + 'px';

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
            Materialize.toast('Location set', 2000);
        }
      });
    }

    $scope.styleButtons = function () {
      console.log('here')
    }

    initialize();
  }
}])

.controller('MeetupController', ['$scope', '$http', '$routeParams', '$timeout', 'Event', 'Books', function($scope, $http, $routeParams, $timeout, Event, Books){
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
      cb(res.data);
    })
    .catch(function (err) {
      console.error(err);
    });
  };

  var cb = function (meetupData) {
    $scope.meetup = meetupData;

    var temp = $scope.meetup.location.split(',');
    var latlng = new google.maps.LatLng(parseFloat(temp[0]), parseFloat(temp[1]));
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({
      latLng: latlng
    }, function (results) {
      if (results[0]) {
        $scope.meetup.location = results[0].formatted_address.split(',').slice(0,3).join(',');
        $scope.$apply();
      }
    });

    var mapEl = document.getElementById('map');

    $timeout(function () {
      mapEl.style.height = $('#bookCard').height() + 'px';
    }, 200);

    map = new google.maps.Map(mapEl, {
      center: latlng,
      scrollwheel: true,
      zoom: 15,
      disableDefaultUI: true
    });

    Books.queryAmazon({title: meetupData.book.ISBN, authorName: meetupData.book.authorName})
    .then(function (results) {
      console.log(results);
      if (results.data[0] && !results.data[0].Error) {
        $('#book-description').append($('<div>' + results.data[0].EditorialReviews[0].EditorialReview[0].Content[0] + '</div>'));
      } else {
        $scope.amazonResults = [];
      }
    });

    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      title: 'Rdr Meetup!'
    });


    $scope.meetup.datetime = new Date(new Date($scope.meetup.datetime).getTime()).toString();
    $scope.meetup.datetime = $scope.meetup.datetime.split(' ');
    $scope.meetup.datetime = $scope.meetup.datetime.slice(0,5).join(' ');
  };

  $scope.joinMeetup = function () {
    Materialize.toast('User joined!', 2000);
    // var id = Event.getCurrentUser().profile.user_id;
    // $http({
    //   method: 'Post',
    //   url: '/meetup/details/' + $routeParams.meetupID,
    //   data: {
    //     join: true,
    //     id: id
    //   }
    // })
    // .then(function (res) {
    //   console.log(res);
    // });
  };

  $scope.getMeetup(cb);
}])
.factory('Event', ['auth', function(auth) {
  var eventBook = undefined;
  var eventHost = auth;
  var meetup = undefined;

  var setMeetup = function (input) {
    meetup = input;
  };

  var getMeetup = function () {
    return meetup;
  };

  var setEventBook = function(book) {
    eventBook = book;
  };

  var getEventBook = function () {
    return eventBook;
  };

  var setCurrentUser = function (host) {
    eventHost = host;
  };

  var getCurrentUser = function () {
    return eventHost;
  };

  return {
    setMeetup: setMeetup,
    getMeetup: getMeetup,
    setEventBook: setEventBook,
    getEventBook: getEventBook,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser
  };
}])
.factory('MeetupList', function ($http, $location, $routeParams) {

  var getMeetups = function (book_id, cb) {
    return $http({
      method: 'Get',
      url: '/meetup/' + book_id
    }).then(function (res) {
      var meetups = [];
      res.data.forEach(function(meetup) {
        var date = new Date(meetup.datetime);
        meetup.date = date.toLocaleDateString();
        meetup.time = date.toLocaleTimeString();
        meetups.push(meetup);
      });
      cb(meetups);
    })
    .catch(function (err) {
      console.error(err);
    });
  };
  return {
    getMeetups: getMeetups,
  };
});
