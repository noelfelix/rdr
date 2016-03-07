// Copde taken directly from auth0.com

angular.module('booklist.auth', [])

.controller('AuthController', ['$rootScope', '$scope', '$http', 'auth', 'store', '$location', '$timeout',
  function($rootScope, $scope, $http, auth, store, $location, $timeout){
    $rootScope.screenSize = window.screen.width;
    $scope.login = function () {
      auth.signin({}, function (profile, token) {
        // Success callback
        store.set('profile', profile);
        store.set('token', token);
        $http({
          method: 'post',
          url: '/signin'
        })
        .then(function (response) {
          // Stores signed in to be used in conditions in other controllers
          $rootScope.signedIn = true;
          $location.path('/profile');
        })
        .catch(function (error) {
          console.error(error);
        });
      }, function (error) {
        console.log(error);
        return;
      });
    };
    $scope.logout = function() {
      // Stores signed in to be used in conditions in other controllers
      $rootScope.signedIn = false;
      auth.signout();
      store.remove('profile');
      store.remove('token');
      // Timeout for logout function to complete before path change
      $timeout(function () {
        $location.path('/');
      }, 1);
    };
  }]);
