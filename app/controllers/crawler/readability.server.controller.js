/**
 * Created by soulstorm on 7/26/15.
 */

var http = require('http');
var async = require('async');
var _ = require('lodash');
var S = require('string');
var util = require('../../util/util');
var Readability = require("readabilitySAX/readabilitySAX.js");
var Parser = require("htmlparser2").Parser;
var request = require('request');
var Q = require('q');
var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var Article = mongoose.model('Article');
var lexer = require('../../util/lexer.greek.js');
var readabilityUtil = require('../../util/readabilityUtil.js');


///**
// * Returns a "readability" object in the case where there is no article in the database. Returns the full article in the case
// * where there is an article in the database. also updates the keywords, and the full text of the article
// * @param url
// * @param existingArticle
// * @returns {*}
// */
//var getContentAndFullArticle = function(url, existingArticle){
//
//    return Q.Promise(function(resolve, reject){
//        request(url, function (error, response, body) {
//            if (error){
//                reject(error);
//            }else{
//                var readable = new Readability({});
//                var parser = new Parser(readable, {});
//                parser.write(body);
//                parser.end();
//
//                if (existingArticle){//first save, then resolve
//                    //console.log('saving fulltext to article : ' + existingArticle.title);
//                    //console.log('full text : ' + readable.getHTML());
//
//                    var decodedText = S(readable.getText()).decodeHTMLEntities().s;
//                    var keywordStatisticalResult = lexer.keywordsFromText(decodedText);
//
//                    //if there is actual content to save, then save it and return
//                    //the full article and content
//                    if (decodedText.length > 50){
//                        existingArticle.fullText = readable.getHTML();
//                        if (existingArticle.keywords.length < keywordStatisticalResult.keywords.length){
//                            //console.log('setting new keywords: ');
//                            //console.log(keywordStatisticalResult.keywords);
//                            existingArticle.keywords = keywordStatisticalResult.keywords;
//                        }
//
//
//                        existingArticle.saveQ().then(function(savedDoc){
//                            //console.log(savedDoc);
//                            resolve(existingArticle);//return the article
//                        });
//                    }else{
//                        //console.log('no content in article found, returning pure readability object');
//                        //if no content was found, return the readable, without doing anything in the database
//                        resolve(readable);
//                    }
//                }else{
//                    //console.log('no article in DB found, returning pure readability object');
//                    resolve(readable);//resolve immediately and return the readable object
//                }
//
//            }
//        });
//    });
//};
//
//
///**
// * Gets readable content from a url, and assigns it to an article.
// * Returns an existing article (updated) in the case where there
// * is an article corresponding to this URL. Returns a readability object in the case where this URL does not correspond
// * to anything in the database.
// *
// * @param url
// * @returns {*}
// */
//var getReadableContent = function(url){
//
//    return Article.findOne({url : url}).then(function(existingArticle){
//        console.log('article with url ' + url + ' already exists');
//        if (existingArticle && existingArticle.fullText){ //we have already done this..!
//            console.log('article with url ' + url + ' already has fullText');
//            return {
//                isDBObject : true,
//                object : existingArticle
//            }
//        }else{
//            return getContentAndFullArticle(url, existingArticle).then(function(readable){ // get the full article, and store it
//                if (existingArticle){
//                    return {
//                        isDBObject : true,
//                        object : existingArticle
//                    }
//                }else{
//                    return {
//                        isDBObject : false,
//                        object : readable
//                    }
//                }
//            });
//        }
//    });
//};


exports.getReadableContent = function(req, res){
    var url = req.query['url'];
    if (!url){
        res.jsonp(util.apiResponse(null, '"url" parameter not set'));
    }else{
        url = decodeURIComponent(url);
        readabilityUtil.getReadableContent(url).then(function(readableContentResult){
            //console.log('readable content result: ');
            //console.log(readableContentResult);

            if (readableContentResult.isDBObject){
                //console.log('object is being returned from the database...');
                res.jsonp(util.apiResponse({
                    isArticleInDB : true,
                    article : readableContentResult.object
                }));
            }else{
                var decodedText = S(readableContentResult.object.getText()).decodeHTMLEntities().s;
                res.jsonp(util.apiResponse({
                    isArticleInDB : false,
                    title: readableContentResult.object.getTitle(),
                    text: decodedText,
                    html : readableContentResult.object.getHTML()
                }));

            }
        }).catch(function(err){
            console.log(err);
            res.jsonp(util.apiResponse(null, err));
        });
    }
};

exports.getSimilarArticles = function(req, res){
    var url = req.query['url'];
    var useSameCategory = req.query['sameCat'];
    if (useSameCategory){
        useSameCategory = useSameCategory == '1';
    }else {
        useSameCategory = true;
    }


    if (!url){
        res.jsonp(util.apiResponse(null, '"url" parameter not set'));
    }else{
        url = decodeURIComponent(url);
        readabilityUtil.getReadableContent(url).then(function(readableContentResult){
            var query = {};

            if (readableContentResult.isDBObject){
                //return the similar...
                var keywords = readableContentResult.object.keywords;
                query = { keywords : {$in : keywords}};

                //search for articles in the same category
                if (useSameCategory){
                    query = _.extend(query, {category : readableContentResult.object.category})
                }
            }else{
                //we have a readability object, extract the keywords from there...
                var decodedText = S(readableContentResult.object.getText()).decodeHTMLEntities().s;
                var keywordStatisticalResult = lexer.keywordsFromText(decodedText);
                query = { keywords : {$in : keywordStatisticalResult.keywords}};
            }

            return Article.find(query).limit(10).sort({publicationTimeStamp : -1}).execQ().then(function(articlesFound){
                res.jsonp(util.apiResponse(articlesFound));
            });
        }).catch(function(err){
            console.log(err);
            res.jsonp(util.apiResponse(null, err));
        });
    }
};
