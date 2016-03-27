'use strict';

var dashboard = angular.module('dashboard');

// Users service used for communicating with the users REST endpoint
dashboard.factory('leadFactory', function($http) {
    var factory = {};
    factory.getLeads = function(){
        return $http.get('/api/leads', {limit : 10});
    };
    return factory;
});
