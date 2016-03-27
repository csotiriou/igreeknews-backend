'use strict';

// Setting up route
angular.module('twitter').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
        state('twitter', {
            url: '/twitter',
            templateUrl: 'modules/twitter/views/twitter.client.view.html'
        });
    }
]);
