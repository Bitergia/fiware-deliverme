'use strict';

angular.module('deliverMe.auth', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'auth/login.html',
    controller: 'AuthCtrl'
  });
}])

.controller('AuthCtrl', ['$scope', '$rootScope', '$location', '$http', 'GlobalContextService',
                         function($scope, $rootScope, $location, $http, GlobalContextService) {

    // Use login, password and app to get auth_token from IDM server
    // The app is registered in an organization
    $scope.user = 'chanchan@idm.server';
    $scope.password = 'ccadmin';
    // The id and secret comes from IDM application data in the org

    $scope.auth = function() {
        var data = 'username='+$scope.user;
        data += '&password='+$scope.password;

        // TODO: Move to a secure URL once in production
        var url = 'http://127.0.0.1:5000/';
        var api = "api/login"

        $http({method:'GET',url:url+api+"/"+data})
        .success(function(data,status,headers,config){
            console.log("Logging ok");
            $rootScope.loggedInUser = true;
            $location.path("/deliverables");
        }).
        error(function(data,status,headers,config){
          $scope.auth_result = "error";
          console.log(data);
        });
    };

}]);
