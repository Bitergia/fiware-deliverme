'use strict';

angular.module('deliverMe.deliverables', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/deliverables', {
    templateUrl: 'deliverables/deliverables.html',
    controller: 'DeliverablesCtl'
  });
}])

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

    $scope.create_deliverable = function() {
        var name = $scope.dash_selected['deliverable_new'];
        $scope.deliverables[name] = {"source":[],"trackers":[]};
    };

    $scope.add_repo = function() {
        var name = $scope.dash_selected['deliverable_new'];
        var repo_url = $scope.dash_selected['source_url'];
        var deliverable = $scope.deliverables[$scope.dash_selected['deliverable']];
        var scm = '"https://github.com/' + repo_url + '"';
        var its = '"https://api.github.com/repos/' + repo_url + '/issues"';
        if (deliverable.source.indexOf(scm) != -1) {
            $scope.message = scm + " already exists";
            return;
        }
        $scope.check_urls ([scm, its], function() {
            deliverable.source.push(scm);
            deliverable.trackers.push(its);
            $scope.update_dash_file();
        });
    };

    $scope.check_urls = function(urls, cb) {
        // Check urls are valid
        var url = devel_url + '/api/check_urls'
        console.log(url);

        var headers = {
                "Content-Type": 'application/json'
        };

        $scope.checking = true;
        $http({method:'POST',url:url, data:urls, headers: headers})
        .success(function(data, status, headers, config) {
            console.log(data);
            $scope.message = data;
            $scope.checking = false;
            if (cb != undefined) cb();
        })
        .error(function(data,status,headers,config){
            console.log("Error in urls " + data);
            $scope.error = " bad URLs: " + data;
            $scope.checking = false;
        });
    }


    $scope.check_deliverables = function() {
        // Check in deliverables and repos are valid
        var url = devel_url + '/api/check_deliverables'
        console.log(url);

        var headers = {
                "Content-Type": 'application/json'
        };

        $scope.checking = true;
        $http({method:'POST',url:url, data:$scope.deliverables, headers: headers})
        .success(function(data, status, headers, config) {
            console.log(data);
            $scope.message = data;
            $scope.checking = false;
        })
        .error(function(data,status,headers,config){
            console.log("Error in deliverables urls " + data);
            $scope.error = data;
            $scope.checking = false;
        });
    }

    $scope.update_dash_file = function() {
        var name = $scope.dash_selected.name;
        var deliverables = $scope.deliverables;
        $scope.create_dash_file (name, deliverables);
    }

    $scope.create_dash_file = function(name, deliverables) {
        // Create a new dashboard
        if (name == undefined) {
            name = $scope.new_dash
            deliverables = {"init":{"source":[],"trackers":[]}};
        }
        var url = devel_url + '/api/dashboards/' + name

        console.log(url);

        var headers = {
                "Content-Type": 'application/json'
        };

        $scope.checking = true;
        $http({method:'POST',url:url, data:deliverables, headers: headers})
        .success(function(data, status, headers, config) {
            console.log(data);
            $scope.message = data;
            $scope.checking = false;
            $scope.load_deliverables();
        })
        .error(function(data,status,headers,config){
            console.log("Error creating dash " + data);
            $scope.error = data;
            $scope.checking = false;
        });

    }

    $scope.select_dash = function() {
        // Select a dash loading all its deliverables
        $scope.load_deliverables($scope.dash_selected.name);
    }

    $scope.create_dash = function() {
        // Create a dash. How the progress will be communicate? WebSockets?
        console.log("Create web dash");
        var url = devel_url + '/api/webdashboards'+'/'+$scope.dash_selected.name
        console.log(url);
        $scope.webing = true;
        $http.get(url).success(function(data) {
            console.log(data);
            $scope.message = $sce.trustAsHtml("<a href='"+data+"' target='_blank'>"+data+"</a>");
            $scope.webing = false;
        })
        .error(function(data,status,headers,config){
            console.log("Error creating web dash " + data);
            $scope.error = data;
            $scope.webing = false;
        });
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
}]);
