'use strict';



angular.module('dashboard').controller('APIController', ['$rootScope', '$scope',
    function($rootScope, $scope) {

        $scope.docItems = [
            {
                requestType : 'GET',
                path : '/api/leads',
                summary : 'gets the "smart leads", a mash-up of the latest news of every news feed available in the iGreekNews platform',
                arguments : []
            },
            {
                requestType : 'GET',
                path : '/api/articles',
                summary : 'request articles by criteria',
                arguments : [
                    {
                        name : 'keyword',
                        type : 'text',
                        summary : 'returns an article which has this keyword as one of the defined keywords.',
                        required : false,
                        default : ''
                    },
                    {
                        name : 'from',
                        type : 'timestamp (numeric)',
                        summary : 'returns articles created after the date represented by this timestamp',
                        required : false,
                        default : ''
                    },
                    {
                        name : 'before',
                        type : 'timestamp (numeric)',
                        summary : 'returns articles created before the date represented by this timestamp',
                        required : false,
                        default : ''
                    },
                    {
                        name : 'limit',
                        type : 'numeric',
                        summary : 'limits the number of results returned. for performance reasons, leave it to 100 max',
                        required : false,
                        default : 100
                    }
                ]
            },
            {
                requestType : 'GET',
                path : '/api/articles/similar',
                summary : 'gets articles similar to the one passed as argument',
                arguments : [
                    {
                        name : 'articleId',
                        type : 'text (id)',
                        summary : 'the article to find, by ID (returned from the server)',
                        required : true,
                        default : ''
                    }
                ]
            },
            {
                requestType : 'GET',
                path : '/api/articles/category',
                summary : 'gets articles that belong to a certain category',
                arguments : [
                    {
                        name : 'name',
                        type : 'text',
                        summary : 'The aticle category (its name, as it is returned from the server)',
                        required : true,
                        default : ''
                    },
                    {
                        name : 'limit',
                        type : 'numeric',
                        summary : 'limit the number of results',
                        required : false,
                        default : 100
                    }
                ]
            },
            {
                requestType : 'GET',
                path : '/api/twitter/leads',
                summary : 'gets greek public tweets from twitter. This list is being constantly updated',
                arguments : []
            }

        ];



        $scope.init = function(){
        };


    }
]);


