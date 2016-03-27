/**
 * Created by soulstorm on 14/06/15.
 */

'use strict';

var dashboard = angular.module('dashboard');

// Users service used for communicating with the users REST endpoint
dashboard.factory('twitterFactory', function($http) {
    var factory = {};
    factory.getLeads = function(){
        return $http.get('/api/twitter/leads', {limit : 100});
    };


    factory.getHashTags = function(){
        return $http.get('/api/twitter/hashtags');
    };

    return factory;
});
