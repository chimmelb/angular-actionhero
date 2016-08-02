(function() {
  'use strict';
  /*jshint -W030*/

  /**
   * @ngdoc service
   * @name actionhero.provider:ActionHeroClient
   *
   * @description
   *
   */
  angular
    .module('actionhero', [])
    .provider('ActionHeroClient', ActionHeroClientService);

  function ActionHeroClientService() {
    this.autoConnect = true;
    this.waitOnActions = true;
    this.skipDebug = true;
    this.skipConsole = false;
    this.$get = function($window, $q, $rootScope, $timeout) {
      var self = this;
      var apiClient = new $window.ActionheroClient(); //defined from external script
      apiClient.on('disconnected', function() {
        self.skipConsole || console.log('[AH] disconnected :(');
        $rootScope.$emit('ah-disconnected');
        //TODO: Event to show disconnection
        //TODO: Service connection to change userData
        //    app.$.toast.text = '[API] Disconnected from API server';
        //    app.$.toast.show();
        //    app.userData.username = null;
      });

      apiClient.on('error', function(err) {

        $rootScope.$emit('ah-error', err);
        self.skipConsole || console.error('[AH] error', err.stack);
        //TODO: Event to show
      });
      apiClient.on('reconnect', function() {
        self.skipConsole || console.log('[AH] reconnect');

        $rootScope.$emit('ah-reconnect');
        $rootScope.$emit('ah-' + apiClient.state);
        //TODO: Event to show reconnection
        //    app.$.toast.text = '[API] Reconnected to API server';
        //    app.$.toast.show();
        //    app.gameState.validateToken(function() {});
      });
      apiClient.on('reconnecting', function() {
        self.skipConsole || console.log('[AH] reconnecting');

        $rootScope.$emit('ah-reconnecting');
        $rootScope.$emit('ah-disconnected');
        //TODO: Event to show
      });

      // this will log all messages send the apiClient
      //apiClient.on('message',      function(message){ console.log(message) })

      apiClient.on('alert', function(message) {

        $rootScope.$emit('ah-alert', message);
        self.skipConsole || console.error('[AH] ' + JSON.stringify(message));
      });
      apiClient.on('api', function(message) {

        $rootScope.$emit('ah-api', message);
        self.skipConsole || console.error('[AH] api: ' + JSON.stringify(message));
      });

      apiClient.on('welcome', function(message) {
        self.skipConsole || console.log('[AH] welcome: ' + JSON.stringify(message));
      });
      apiClient.on('say', function(data) {

        $rootScope.$emit('ah-say', data);
        /*jshint -W030*/
        self.skipDebug || console.log('[AH] say: ' + JSON.stringify(data));
      });


      var ActionHeroBase = {};
      ActionHeroBase.someValue = 'ActionHero';
      ActionHeroBase._client = apiClient;
      ActionHeroBase.waitOnActions = this.waitOnActions;
      ActionHeroBase.isConnected = function() {
        return apiClient.state === 'connected';
      };

      //Valuable as a method to hold up processing prior to connections
      ActionHeroBase.connect = function() {
        //console.log('[AH] connect');
        var deferred = $q.defer();
        apiClient.connect(function(err, details) {
          //console.log('[AH] connect: err=' + JSON.stringify(err) + ' details=' + JSON.stringify(details));
          if (err !== null) {
            console.error(err);
            $rootScope.$emit('ah-connect-error');
            deferred.reject(err);
          } else {
            self.skipConsole || console.log('[AH] connection details: ' + JSON.stringify(details));
            self.skipConsole || console.log('[AH] Connected to actionhero server.');

            ActionHeroBase.id = details.data.id;
            $rootScope.$emit('ah-connected', details);
            deferred.resolve(true);
          }
        });
        return deferred.promise;
      };
      ActionHeroBase.waitConnected = function(timeoutMs) {
        var deferred = $q.defer();
        if (this.isConnected()) {
          //console.log('[AH] waitConnected: already connected');
          //already connected
          deferred.resolve(true);
        } else {
          timeoutMs = timeoutMs || 10000;
          var timeoutRequest = null;

          //console.log('[AH] waitConnected: waiting');
          var unregisterFunc = $rootScope.$on('ah-connected', function() {
            //console.log('[AH] waitConnected: connected!');
            deferred.resolve(true);
            unregisterFunc();
            $timeout.cancel(timeoutRequest);
          });
          timeoutRequest = $timeout(function() {
            //console.log('[AH] waitConnected: timeout fired after ' + timeoutMs + 'ms');
            deferred.reject('Timeout connecting to server.');
            unregisterFunc();
          }, timeoutMs);
        }
        return deferred.promise;
      };
      ActionHeroBase.runAction = function(action, params) {
        if (this.waitOnActions) {
          //console.log('[AH] runAction: checking connection before running ' + action);
          return this.waitConnected()
            .then(function() {
              //console.log('[AH] runAction: running with params ' + JSON.stringify(params));
              return $q(function(resolve, reject) {
                apiClient.action(action, params, function(resp) {
                  //console.log('[AH] runAction: resp=' + JSON.stringify(resp));
                  if (resp.error) {
                    reject(resp);
                  } else {
                    resolve(resp);
                  }
                });
              });
            });
        } else {
          //console.log('[AH] runAction: (no wait) running with params ' + JSON.stringify(params));
          return $q(function(resolve, reject) {
            apiClient.action(action, params, function(resp) {
              //console.log('[AH] runAction: resp=' + JSON.stringify(resp));
              if (resp.error) {
                reject(resp);
              } else {
                resolve(resp);
              }
            });
          });
        }
      };
      ActionHeroBase.subscribe = function(scope, eventName, callback) {
        var handler = $rootScope.$on(eventName, callback);
        scope.$on('$destroy', handler);
        return handler; //Call this function to unsubscribe early
      };


      if (this.autoConnect) {
        self.skipConsole || console.log('[AH] auto-connecting');
        ActionHeroBase.connect();
      } else {
        self.skipConsole || console.log('[AH] not connecting on start');
      }
      return ActionHeroBase;
    };
  }
}());
