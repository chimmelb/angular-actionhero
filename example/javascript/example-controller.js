(function() {
  'use strict';

  /**
   * @ngdoc object
   * @name home.controller:ExampleCtrl
   *
   * @description
   *
   */
  angular
    .module('example')
    .config(function(ActionHeroClientProvider) {
      ActionHeroClientProvider.skipDebug = false;
    })
    .controller('ExampleCtrl', ExampleCtrl);

  function ExampleCtrl(ActionHeroClient, $scope) {
    var vm = this;
    vm.ctrlName = 'ExampleCtrl';
    console.log('ExampleCtrl state is ' + ActionHeroClient.isConnected());
    $scope.connected = ActionHeroClient.isConnected();
    $scope.messages = [];

    ActionHeroClient.subscribe($scope, 'ah-connected', function() {
      console.log('connected ExampleCtrl state is ' + ActionHeroClient.isConnected());
      $scope.connected = true;
      $scope.$digest();
    });

    ActionHeroClient.subscribe($scope, 'ah-disconnected', function() {
      console.log('disconnected ExampleCtrl state is ' + ActionHeroClient.isConnected());
      $scope.connected = false;
      $scope.$digest();
    });

    ActionHeroClient._client.roomAdd("defaultRoom", function(error) {
      if (error) {
        console.log(error);
      }
    });

    ActionHeroClient.subscribe($scope, 'ah-say', function(event, data) {
      $scope.messages.push(data.message);
      $scope.$digest();
    });
  }
}());
