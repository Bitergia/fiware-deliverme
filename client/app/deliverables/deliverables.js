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

.controller('MyCtrl2', function($scope, webtest) {
    webtest.fetch().then(function(data) {
        $scope.data = data;
        //we record also the WP name to build the URL
        angular.forEach($scope.data.entries, function (value,key){
            var aux = '',
                wp_name = '';
            aux = value.page.split(".");
            wp_name = "WP"+aux[1]+"."+aux[2];
            value.wp = wp_name;
        });
    });
})

.controller('ModalDemoCtrl', function ($scope, $modal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

})
.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})

.factory('webtest', function($q, $timeout, $http) {
    var Webtest = {
        fetch: function(callback) {

            var deferred = $q.defer();
            //var devel_url = window.location.origin;
            var devel_url = window.location.href;
            devel_url = devel_url.split("/static")[0];
            var url = devel_url + '/static/log/' + 'log.json';

            $timeout(function() {
                $http.get(url).success(function(data) {
                    deferred.resolve(data);
                });
            }, 30);

            return deferred.promise;
        }
    };

    return Webtest;
})


.controller('MyCtrl', function($scope, $http, $timeout) {
    // Function to get the data
    $scope.getData = function(){
        var devel_url = window.location.href;
        devel_url = devel_url.split("/static")[0];
        var url = devel_url + '/static/log/' + 'log.json';
        // we avoid cache for this file
        url = url + '?nocache=' + (new Date()).getTime();
        $http.get(url)
            .success(function(data, status, headers, config) {
                $scope.data = data;
                //we record also the WP name to build the URL
                angular.forEach($scope.data.entries, function (value,key){
                    var aux = '',
                        wp_name = '';
                    aux = value.page.split(".");
                    wp_name = "WP"+aux[1]+"."+aux[2];
                    value.wp = wp_name;
                    var auxtime = value.time.split('_');
                    value.prettytime = auxtime[0] + ' ' + auxtime[1].replace(/-/g, ':');
                });

          // Your code here
          console.log('Fetched data!');
        });
    };

    // Function to replicate setInterval using $timeout service.
    $scope.intervalFunction = function(){
        $timeout(function() {
            $scope.getData();
            $scope.intervalFunction();
        }, 3000)
    };

    // Kick off the interval
    $scope.intervalFunction();
})

.controller('DeliverablesCtl', ['$scope', '$http', '$interval', '$sce', 'AuthService',
                                function($scope, $http, $interval, $sce, AuthService) {

    var devel_url = window.location.href;
    devel_url = devel_url.split("/static")[0];

    $scope.logout = function () {
        AuthService.logout(function () {
            window.location = "/static/app/index.html#/login"
        });
    };

    $scope.auth = function() {
        var test;
    };

    $scope.$watch( AuthService.isLoggedIn, function ( isLoggedIn ) {
        $scope.isLoggedIn = isLoggedIn;
        $scope.currentUser = AuthService.currentUser();
    });

    $scope.load_log = function() {
        var devel_url = window.location.origin;
        var url = devel_url + '/static/log/' + 'log.json';
        console.log(url);
        /*$http.get(url).success(function(data) {
            $scope.log = data;
        });*/
        $timeout(function() {
            $http.get(url).then(function(res){
            $scope.log = res.data;
            });
        }, 3);
    };

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
    };

    $scope.create_deliverable = function() {
        // Create a deliverable using the project and wiki page selected
        console.log("Creating deliverable ...");
    };

    $scope.load_deliverables = function() {
        var url =  devel_url + '/api/deliverables';
        console.log(url);
        $http.get(url).success(function(data) {
            $scope.deliverables = data;
        });
    };

    $scope.load_projects = function() {
        var url = devel_url + '/static/app/' + 'projects.json';
        console.log(url);
        $http.get(url).success(function(data) {
            $scope.projects = data;
        });
    };

    /*$scope.load_log = function() {
        var url = devel_url + '/static/log/' + 'log.json';
        console.log(url);
        $http.get(url).success(function(data) {
            $scope.log = data;
        });
    };*/

    $scope.select_project = function() {
        $scope.project_deliverables = $scope.projects[$scope.deliver.project];
    };

    $scope.deliver_me = function() {
        $scope.progress_deliver = 0;
        $scope.error = undefined;
        $scope.creation_log = null ;
        // Create a deliverable using the project and wiki page selected
        console.log("Delivering for project " + $scope.deliver.project + " the page " + $scope.deliver.page);

        var str_date = timeStamp();
        var data = 'project='+$scope.deliver.project;
        data += '&page='+$scope.deliver.page;
        data += '&date='+str_date;

        // TODO: Move to a secure URL once in production
        var url = devel_url;
        var api = "/api/deliverable";
        // Get WP name from deliverable name
        // D.X.Y -> WPX.Y
        var aux = $scope.deliver.page.split(".");
        var wp_name = "WP"+aux[1]+"."+aux[2];
        //var deliverables_url = devel_url + "/static/deliverables/" + wp_name + '/' + str_date;
        var deliverables_url = devel_url + "/deliverables/" + wp_name;
        var deliverables_url_index = devel_url + "/static/deliverables/" + wp_name + '/' + str_date + '/' + $scope.deliver.page + '.html';
        // Go to general folder until the deliverable is generated
        document.getElementById('deliverables_explorer').src = devel_url + "/deliverables/";

        // 60s for generating the deliverable, show progress_bar
        var creation_timer = $interval(function() {
            $scope.progress_deliver += 1;
        }, 500);

        $http({method:'GET',url:url+api+"?"+data})
        .success(function(data, status, headers, config){
            // Complete progressbar
            $interval.cancel(creation_timer);
            $scope.progress_deliver = 100;
            console.log("Deliverable generated " + data);
            $scope.error = '';
            // Reload deliverables browser
            $scope.deliverable_url = deliverables_url;
            $scope.deliverable_url_index = deliverables_url_index;
            $scope.creation_log = data;
            document.getElementById('deliverables_explorer').src = deliverables_url;
            //
            //$scope.load_log();

            //$scope.load_log();
        }).
        error(function(data,status,headers,config){
          console.log("Probs generating deliverable  " + data);
          $scope.error = data;
          $scope.deliver_result="error";
          // Complete progressbar
          $interval.cancel(creation_timer);
          $scope.progress_deliver = 100;
        });
    };
    // https://github.com/angular-ui/bootstrap/wiki/FAQ#my-input--select-element-doesnt-work-as-expected-inside-the-tab--accordion-directive
    //$scope.load_log();

    $scope.deliver = {"project":"","page":""};
    $scope.error = undefined;
    $scope.load_deliverables();
    $scope.load_projects();
    //$scope.load_log();
    $scope.progress_deliver = 0;


}]);
/*
angular.module('ui.bootstrap.demo').controller('PopoverDemoCtrl', function ($scope) {
  $scope.dynamicPopover = {
    content: 'Hello, World!',
    templateUrl: 'myPopoverTemplate.html',
    title: 'Title'
  };
});
*/
/**
 * Return a timestamp with the format "m/d/yy h:MM:ss TT"
 * @type {Date}
 */

function timeStamp() {
// Create a date object with the current time
  var now = new Date();

// Create an array with the current month, day and time
  var date = [ now.getFullYear(), now.getMonth() + 1, now.getDate()];

// Create an array with the current hour, minute and second
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

// If seconds and minutes are less than 10, add a zero
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
// Return the formatted string
  return date.join("-") + "_" + time.join("-");
}
