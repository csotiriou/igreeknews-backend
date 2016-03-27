/**
 * Created by soulstorm on 14/06/15.
 */


angular.module('twitter').controller('TwitterController', ['$rootScope', '$scope', 'twitterFactory',
    function($rootScope, $scope, twitterFactory){

        $scope.downloadedLeads = [];
        $scope.downloadedHashTags = [];


        $scope.init = function(){
            twitterFactory.getLeads().success(function(apiResult){
                console.log(apiResult);
                $scope.downloadedLeads = apiResult.result;
            }).catch(function(error){
                console.log('error');
                console.log(error);
            });

            twitterFactory.getHashTags().success(function(apiResult){
                $scope.downloadedHashTags = apiResult.result;
                console.log(apiResult);
            }).catch(function(error){
                console.log(error);
            });
        }

}
]);