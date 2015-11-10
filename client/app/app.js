'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('deliverMeApp', [
  'ngRoute',
  'ui.bootstrap',
  'deliverMe.auth',
  'deliverMe.deliverables',
  'ngStorage'
]).


config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/login'});
}]);


app.run(function($rootScope, $location, $http, $timeout, AuthService) {
    //$rootScope.loggedInUser = null
    $rootScope.loggedInUser = AuthService.isLoggedIn();
    //$rootScope.loggedInUser = true
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        if ($rootScope.loggedInUser == false) {
          // no logged user, redirect to /login
          if (next.templateUrl === "auth/login.html") {
          } else {
            $location.path("/login");
          }
        }else{
          $location.path("/deliverables");
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

app.factory( 'AuthService', ['$localStorage',function($localStorage) {
  var currentUser,
    isLoggedIn = false;

  /*return {
    login: function() { ... },
    logout: function() { ... },
    isLoggedIn: function() { ... },
    currentUser: function() { return currentUser; }
   };*/
   function urlBase64Decode(str) {
    var output = str.replace('-', '+').replace('_', '/');
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += '==';
            break;
        case 3:
            output += '=';
            break;
        default:
            throw 'Illegal base64url string!';
    }
    return window.atob(output);
    }

   function getUserFromToken() {
       var token = $localStorage.token;
       var user = {};
       if (typeof token !== 'undefined') {
           var encoded = token.split('.')[1];
           user = JSON.parse(urlBase64Decode(encoded));
       }
       return user.sub;
   }

   return {
       /*setUser: function(){
           currentUser = getUserFromToken()
           isLoggedIn = true;
       },*/
       isLoggedIn: function(){
            //FIXME we should examine the token first
            return $localStorage.token != undefined;
       },
       currentUser: function(){
           return getUserFromToken();
       },
       logout: function (success) {
           //tokenClaims = {};
           delete $localStorage.token;
           success();
       },
   }
}]);
