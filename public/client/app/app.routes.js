angular.module('booklist', [
  'booklist.services',
  'booklist.feed',
  'booklist.user',
  'booklist.auth',
  'booklist.meetup',
  'auth0',
  'angular-storage',
  'angular-jwt',
  'ngRoute',
  'ngTouch'
])
.config(['$routeProvider', '$httpProvider', 'authProvider', 'jwtInterceptorProvider', function($routeProvider, $httpProvider, authProvider, jwtInterceptorProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/app/shared/book.feed.html',
      controller: 'FeedController'
    })
    .when('/profile', {
      templateUrl: '/app/shared/user.page.html',
      controller: 'UserController',
      requiresLogin: true
    })
    .when('/create', {
      templateUrl: '/app/shared/meetup.create.html',
      controller: 'MeetupController'
    })
    .when('/about', {
      templateUrl: '/app/components/about.html'
    })
    .when('/privacy', {
      templateUrl: '/app/components/privacy.html'
    })
    .otherwise({
      templateUrl: '/app/shared/book.feed.html',
      controller: 'FeedController'
    });
}])
// From auth0.com
.config(['authProvider', 'jwtInterceptorProvider', '$httpProvider', function (authProvider, jwtInterceptorProvider, $httpProvider) {

  authProvider.init({
    domain: 'majestic-brachiosaurus.auth0.com',
    clientID: 'RAvqIz4hpvGrPzjtPuMM9oIIcJw9TmXA',
    callbackURL: '#/profile',
    loginUrl: '/'
  });

  jwtInterceptorProvider.tokenGetter = ['store', function (store) {
    return store.get('token');
  }];

  $httpProvider.interceptors.push('jwtInterceptor');

}])
.run(['$rootScope', 'auth', 'store', '$location', 'jwtHelper', function($rootScope, auth, store, $location, jwtHelper){
  auth.hookEvents();

  $rootScope.$on('$locationChangeStart', function (event, next, current) {
    var token = store.get('token');
    if (token) {
      if (!jwtHelper.isTokenExpired(token)) {
        if (!auth.isAuthenticated) {
          auth.authenticate(store.get('profile'), token);
          $rootScope.signedIn = true;
        }
      } else {
        $rootScope.signedIn = false;
      }
    }
  });
}]);
