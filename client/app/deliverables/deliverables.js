'use strict';

angular.module('deliverMe.deliverables', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/deliverables', {
    templateUrl: 'deliverables/deliverables.html',
    controller: 'DeliverablesCtl'
  });
}])

.controller('TabsGenerateCtrl', function ($scope, $window) { 
  $scope.tabs = [
    { title:'X1.1', content:'D.X.1.1 Open Specs' },
    { title:'X3.1', content:'D.X.3.1 Installation and Admin Guides' },
    { title:'X4.1', content:'D.X.4.1 User and Programmers Guides' },
    { title:'X5.1', content:'D.X.5.1 Unit Testing Plan and Reports ' }
  ];
})

.controller('TabsWikiCtrl', function ($scope, $window) { 
})

.controller('DeliverablesCtl', ['$scope', '$http', '$timeout', '$sce', function($scope, $http, $timeout, $sce) {

    var devel_url = "http://localhost:5000"

    $scope.load_deliverables = function(dash_name) {
        var url = devel_url + '/api/deliverables'+'/'+dash_name
        console.log(url);
        $http.get(url).success(function(data) {
            console.log(data);
            $scope.deliverables = data;
        });
    };

    $scope.select_dash = function() {
        // Select a dash loading all its deliverables
        $scope.load_deliverables($scope.dash_selected.name);
    }

    $scope.create_deliverable = function() {
        // Create a deliverable using the project and wiki page selected
        console.log("Creating deliverable ...");
    }

    $scope.deliver_me = function() {
        // Create a deliverable using the project and wiki page selected
        console.log("Delivering for project " + $scope.dproject + "the page " + $scope.dpage);
    }

    $scope.load_deliverables = function() {
        var url = devel_url + '/api/deliverables'
        console.log(url);
        $http.get(url).success(function(data) {
            $scope.deliverables = data;
        });
    }

    $scope.load_deliverables();
    $scope.dash_selected = {name:""};
    $scope.projects = ["fiware","fi-ware-review","testbed","apps","cloud","data","i2nd","iot","security","miwi","tools","exploitation","fi-ware-private"];
}]);
