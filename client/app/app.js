'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('deliverMeApp', [
  'ngRoute',
  'ui.bootstrap',
  'deliverMe.auth',
  'deliverMe.deliverables'
]).


config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/login'});
}]);


app.run(function($rootScope, $location, $http, $timeout) {
    $rootScope.loggedInUser = null
    $rootScope.loggedInUser = true
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        if ($rootScope.loggedInUser == null) {
          // no logged user, redirect to /login
          if (next.templateUrl === "auth/login.html") {
          } else {
            $location.path("/login");
          }
        }
    });
});

app.factory('GlobalContextService', function() {
    var access_token_val

    return {
        access_token: function(val) {
            if (val !== undefined) {access_token_val = val;}
            return access_token_val;
        }
    };
});
