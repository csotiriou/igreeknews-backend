'use strict';

// Setting up route
angular.module('streamer').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
            state('streamer', {
                url: '/',
                templateUrl: 'modules/streamer/views/streamer.client.view.html'
            });
    }
]);