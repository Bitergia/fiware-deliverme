'use strict';

angular.module('deliverMe.auth', ['ngRoute','ngStorage'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'auth/login.html',
    controller: 'AuthCtrl'
  });
}])

.controller('AuthCtrl', ['$scope', '$rootScope', '$location', '$http', '$localStorage', 'AuthService',
                         function($scope, $rootScope, $location, $http, $localStorage, AuthService) {

    // Use login, password get auth_token from server
    $scope.user = '';
    $scope.password = '';

    $scope.auth = function() {
        var data = 'username='+$scope.user;
        data += '&password='+$scope.password;

        // TODO: Move to a secure URL once in production
        // var url = 'http://127.0.0.1:5000/';
	var url = 'https://forge.fiware.org/dtoaster/';
        var api = "api/login"

        $http({method:'GET',url:url+api+"?"+data})
        .success(function(data,status,headers,config){
            console.log("Logging ok");
            $rootScope.loggedInUser = true;
            $location.path("/deliverables");
            $localStorage.token = data.token;
            //AuthService.setUser();
        }).
        error(function(data,status,headers,config){
          $scope.auth_result = "error";
          console.log(data);
          // Erase the token if the user fails to log in
          delete $localStorage.token;
        });
    };
}]);
