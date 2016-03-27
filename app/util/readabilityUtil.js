/**
 * Created by soulstorm on 9/5/15.
 */

var http = require('http');
var async = require('async');
var _ = require('lodash');
var S = require('string');
var util = require('./util');
var Readability = require("readabilitySAX/readabilitySAX.js");
var Parser = require("htmlparser2").Parser;
var request = require('request');
var Q = require('q');
var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var Article = mongoose.model('Article');
var lexer = require('./lexer.greek.js');


/**
 * Returns a promise with a  "readability" object in the case where there is no article in the database.
 * Returns the full article in the case
 * where there is an article in the database. also updates the keywords, and the full text of the article
 * @param url
 * @param existingArticle (optional)
 * @returns {*} A Readability Promise
 */
var getContentAndFullArticle = function(url, existingArticle) {
    return Q.Promise(function (resolve, reject) {
        request(url, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                var readable = new Readability({});
                var parser = new Parser(readable, {});
                parser.write(body);
                parser.end();

                if (existingArticle) {//first save, then resolve
                   ///console.log('saving fulltext to article : ' + existingArticle.title);
                    //console.log('full text : ' + readable.getHTML());

                    var decodedText = S(readable.getText()).decodeHTMLEntities().s;
                    var keywordStatisticalResult = lexer.keywordsFromText(decodedText);

                    existingArticle.alreadySearchedForFullText = true;

                    //if there is actual content to save, then save it and return
                    //the full article and content
                    if (decodedText.length > 50) {
                        existingArticle.fullText = readable.getHTML();
                        if (existingArticle.keywords.length < keywordStatisticalResult.keywords.length) {
                            //console.log('setting new keywords: ');
                            //console.log(keywordStatisticalResult.keywords);
                            existingArticle.keywords = keywordStatisticalResult.keywords;
                        }


                        existingArticle.saveQ().then(function (savedDoc) {
                            //console.log(savedDoc);
                            resolve(existingArticle);//return the article
                        }).catch(function (error){
                            console.error("unhandled error in readability for article : " + url);
                            console.error(error);
                            reject(error);
                        });

                    } else {
                        //save, and update the flag, that we have already made an effort to update the article
                        existingArticle.saveQ().catch(function (error){
                            console.error("unhandled error in readability for article : " + url);
                            console.error(error);
                            reject(error);
                        });

                        //console.log('no content in article found, returning pure readability object');
                        //if no content was found, return the readable, without doing anything in the database
                        resolve(readable);
                    }
                } else {
                    //console.log('no article in DB found, returning pure readability object');
                    resolve(readable);//resolve immediately and return the readable object
                }

            }
        });
    });
};


/**
 * Gets readable content from a url, and assigns it to an article.
 * Returns an existing article (updated) in the case where there
 * is an article corresponding to this URL. Returns a readability object in the case where this URL does not correspond
 * to anything in the database.
 *
 * @param url
 * @returns {*}
 */
var getReadableContent = function(url){
    return Article.findOne({url : url}).execQ().then(function(existingArticle){
        console.log('article with url ' + url + ' already exists');
        if (existingArticle && existingArticle.fullText){ //we have already done this..!
            console.log('article with url ' + url + ' already has fullText');
            return {
                isDBObject : true,
                object : existingArticle
            }
        }else{
            return getContentAndFullArticle(url, existingArticle).then(function(readable){ // get the full article, and store it
                var result = existingArticle ? { isDBObject : true, object : existingArticle} : {isDBObject : false, object : readable};
                return result;
            });
        }
    });
};



exports.getContentAndFullArticle = getContentAndFullArticle;
exports.getReadableContent = getReadableContent;
