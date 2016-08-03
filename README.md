# angular-actionhero

This module provides an angular service to communicate with an [ActionHero](http://www.actionherojs.com/) WebSocket client. It uses angular 1.x and Promises.

##Installation

TODO: write about bower here

Include the script in your page, and the module `actionhero` in your angular module:

```
angular
    .module('example', [
      'actionhero'
    ])
```

*Note:* The `actionheroClient.js` script must be included before this provider. If serving from actionhero `/public`, it will be like this:

```
<script src="javascript/actionheroClient.js"></script>
```

##Configuration

Being an [angular provider](https://docs.angularjs.org/guide/providers), there are a few config options. You can include them in your module like this:

```
angular.config(function(ActionHeroClientProvider) {
    ActionHeroClientProvider.skipDebug = true;
  })
```

The options available for configuration are:

* `autoConnect` - Determines whether to attempt connection with the actionhero server as soon as this provider is loaded. Connection is made through the `.connect()` method and could be performed manually. (Default: true)
* `waitOnActions` - Determins if should wait up to 10s when running an action. Simply a quick check if already connected. This is handy when an API action (like login or resource request) is required on page load, and avoids errors if the connection to the server has not been established. (Default: true)
* `skipDebug` - Determins whether to `console.log()` any `ah-say` events. They are quite common, so are turned off by default. (Default: true)
* `skipConsole` - Determines whether to skip all `console.log` output from the provider.  (Default: false)

##Usage

Inject the provider like this:

```
angular.controller('ExampleCtrl', function ExampleCtrl(ActionHeroClient, $scope) {
  //Use ActionHeroClient to do the things.
}
```

##API

In addition to the methods below, one could always access the raw actionheroClient object using `ActionHeroClient._client`. 

The provider itself has the following methods:

###`.isConnected()`

A simple, synchronous check of the client's connected state.

###`.connect()`

A Promise. Connects to the server. Will emit `ah-connected` event when complete.

###`.waitConnected(timeoutMs)`

A Promise. Simple pass-through if `.isConnected()`, and waits for the `ah-connected` event otherwise. Default `timeoutMs` (number) is 10000, but will wait for any given number of ms before rejecting the promise. 

This is handy when an API action, like `login` or a `resource request`) is required on page load, and avoids errors if the connection to the server has not been established. Like if you have an auto-reload on your browser while developing.

###`.runAction(action,params)`

A Promise. Runs an `action` (string) with the given `params` (object). Pass or fail, the result will be the full response from the server.

Example:

```
ActionHeroClient.runAction('customAction', {
        param1: 'abc',
        param2: 24
      })
      .then(function(response) {
        console.log('[customAction] response=' + JSON.stringify(response));
      })
      .catch(function(errorResponse) {
        console.error('[customAction] error message from AH: ' + JSON.stringify(errorResponse.error));
      });
```

###`.subscribe(scope, eventname, eventHandler)`

This method is used in controllers to get events from actionhero. Followed [a nice blog post](http://www.codelord.net/2015/05/04/angularjs-notifying-about-changes-from-services-to-controllers/) that:

1. Gets events from a service to a controller
2. Un-subscribes when the controller scope is destroyed (like when you change pages using a router).

The `scope` parameter is the scope of the controller that is subscribing and `eventname` (string) is the event to subscribe to. `eventHandler` is a `function(eventData)` that will run when the event is broadcast. This is the raw event from actionhero, so the message sent from the serve would be `eventData.message`.

Events you can subscribe to are mostly the events from `actionheroClient.js`, with "ah-" on the front. The list is here: 

* ah-connected
* ah-disconnected
* ah-error
* ah-reconnect
* ah-alert
* ah-api
* ah-say

Example:

```
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

    ActionHeroClient.subscribe($scope, 'ah-say', function(event, data) {
      $scope.messages.push(data.message);
      $scope.$digest();
    });
```

##Example

See the `/example` directory of this project for a simple example that can run with actionhero.

##License

MIT


