'use strict';

var _ = require('underscore');
var S = require('string');
var cheerio = require('cheerio');
var sources = require('./Sources.json');

var categoriesByRootURL = {};


var consolidateCategoriesDictionary = function(){
    var categories = sources['sources']['categories'];

    _.each(categories, function(category){
        var categorySources = category['sources'];

        _.each(categorySources, function(source){

            categoriesByRootURL[source['feed']] = category;

            var sourceSubCategories = source['subcategories'];
            _.each(sourceSubCategories, function(subcategory){
                categoriesByRootURL[subcategory['url']] = category;
            });
        });
    });
};


consolidateCategoriesDictionary();


var processHTMLTags = function(htmlString){
    var imageFound = null;
    var newString = null;
    if (htmlString){
        var actualHTMLString = S(htmlString).unescapeHTML().decodeHTMLEntities().s;

        var $ = cheerio.load(actualHTMLString);
        if ($){
            imageFound = "" + $('img').attr('src');
            $('img').remove();
            var result = $.html();
            newString = S(result).unescapeHTML().decodeHTMLEntities().stripTags().s;
        }else{
            newString = S(actualHTMLString).unescapeHTML().stripTags().decodeHTMLEntities().s;
        }
    }

    return {imageFound : imageFound, str : newString};
};

var getAllCategoryFeedURLsRecursive = function(category){
    if (!category) return null;
    
    var sources = category['sources'];

    var returnable = [];

    _.each(sources, function(source){
        returnable.push(source['feed']);

        var sourceSubCategories = source['subcategories'];
        _.each(sourceSubCategories, function(subcategory){
            returnable.push(subcategory['url']);
        });
    });
    return returnable;
};

var categoryByName = function (categoryName){
    var allCategories = sources.sources.categories;
    return _.find(allCategories, function(category){
        return category.name == categoryName;
    });
};


exports.apiResponse = function(responseObject, optionalErrorMessage){
    if (optionalErrorMessage){
        return {
            result : null,
            error : optionalErrorMessage,
            success : false
        }
    }
    return {
        result : responseObject,
        error : null,
        success : true
    }
};

exports.apiResponseParametersMissing = function(parameters){
    var string = '';
    _.each(parameters, function(paramMissing){
            string = string + '"' + paramMissing + '" '
    });


    return {
        result : null,
        error : 'Missing arguments: ' + string,
        success : false
    };
};

exports.processHTMLTags = processHTMLTags;
exports.getCategoryForURL = function(url){
    return categoriesByRootURL[url];
};

exports.getAllCategoryFeedURLsRecursive = getAllCategoryFeedURLsRecursive;
exports.categoryByName = categoryByName;
