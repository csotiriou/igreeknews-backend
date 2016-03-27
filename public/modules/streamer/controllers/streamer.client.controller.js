'use strict';



angular.module('streamer').controller('StreamerController', ['$rootScope', '$scope', 'socket',
    function($rootScope, $scope, socket) {

        $scope.tweets = [{text : "hi"}];

        var stopUpdating = false;
        var twitterInitialized = false;

        var initializeTwitter = function(){
            socket.connect();
            var chat = socket;

            chat.on('connect', function(){
                console.log("connected to host");
            });
            chat.on('tweet', function(tweet){
                if (!stopUpdating){
                    console.log("tweets : " + $scope.tweets.length);
                    $scope.tweets.unshift(tweet);

                    var totalLength = $scope.tweets.length;

                    if ($scope.tweets.length > 100){
                        var itemsToDelete = totalLength - 100;
                        $scope.tweets.splice(100, itemsToDelete);
                    }
                }
            });
            twitterInitialized = true;
        };

        $scope.init = function(){
            //initializeTwitter();
        };


        $scope.buttonClicked = function(){
            console.log('initializing twitter...');
            //initializeTwitter();
        };

        $scope.toggleButtonPressed = function(){
            stopUpdating = !stopUpdating;
        };



        $scope.$on('destroy', function( event ) {
            console.log('destroying..');
            //socket.disconnect();
        });

    }
]);


