'use strict';



angular.module('dashboard').controller('DashboardController', ['$rootScope', '$scope','leadFactory',
    function($rootScope, $scope, leadFactory) {

        $scope.downloadedLeads = [];

        function shuffle(o){ //v1.0
            for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        };

        $scope.init = function(){
            console.log('initializing...');
            leadFactory.getLeads().success(function(apiResult){
                $scope.downloadedLeads = _.map(apiResult.result, function(newsItem){
                    var result = newsItem;
                    if (result.imageUrl && result.imageUrl.indexOf('blogspot.com') > 0){
                        result.imageUrl = result.imageUrl.replace(/s72-c/gi, 's1600');
                    }
                    return result;
                });
            }).catch(function(error){
                console.log('error');
                console.log(error);
            })
        };


    }
]);


