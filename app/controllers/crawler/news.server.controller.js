'use strict';

var http = require('http');
var async = require('async');
var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var Article = mongoose.model('Article');
var TweetSchema = mongoose.model('Tweet');
var TwitterUserSchema = mongoose.model('TwitterUser');
var sources = require('../../util/Sources.json');
var _ = require('lodash');
var S = require('string');
var util = require('../../util/util');
var Q  = require('q');
var mapper = require('./datamap.server.controller');
var Category = mongoose.model('ArticleCategory');
var NewsSource = mongoose.model('NewsSource');
var SubFeed = mongoose.model('SubFeed');
var moment = require('moment');

var DEFAULT_MAX_LIMIT = 50;

/**
 * Returns a promise, which makes a query to the database, for each hostname available, and then returns the news for those hostnames.
 * It is a long procedure, make sure you use caching
 * @param limit Optional. limit the number of results of each news source to this amount. Default : 2
 * @returns {*}
 */
var getSmartLeads = function(limit){
    var eachSourceLimit = limit? parseInt(limit) : 4;


    //find all news sources, and populate the subfeeds. We select the news sources
    //in order to respect the "gravity" by descending
    return NewsSource.find({}).sort({gravity : -1}).populate('subcategories').execQ().then(function(allNewsSources){
        var allMainSubCategories = [];


        //find the primary feed from this news source. Only keep the first one found
        _.each(allNewsSources, function(newsSource){
            var mainFeedSubCategory = _.find(newsSource.subcategories, function(subcategory){
                return subcategory.isMainFeed;
            });

            if (mainFeedSubCategory){
                allMainSubCategories.push(mainFeedSubCategory);
            }
        });

        //console.log(allMainSubCategories);

        return Q.Promise(function(resolve, reject){
            var articlesArrayOfArrays = [];

            async.eachLimit(allMainSubCategories, 1, function(feedSource, callback){
                var halfAnHourAgo = moment().add(-30, 'minutes').utc();

                var query = {
                    newsSource : feedSource.parentNewsSource,
                    $or  : [
                        {publicationDate : {$gt : halfAnHourAgo}},
                        {createdAt : {$gt : halfAnHourAgo}}
                    ]
                };


                Article.find(query).populate('newsSource category').limit(eachSourceLimit).execQ().then(function(results){
                    articlesArrayOfArrays.push(results);
                }).fin(function(){
                    callback();
                });

            }, function(err){
                if (err){
                    reject(err);
                }else{
                    var sortedArticlesArray = (_.sortBy(_.flatten(articlesArrayOfArrays), 'publicationTimeStamp')).reverse();
                    resolve(sortedArticlesArray);
                }
            });
        });
    });
};



var deleteAllArticlesFromDB = function(){
    return Article.remove({}).execQ();
};


var deleteAllTweetsFromDB = function(){
    return TweetSchema.remove({}).execQ().then(function(){
        return TwitterUserSchema.remove({}).execQ();
    });
};


exports.getArticles = function(req, res){
    var keyword = req.param('keyword');
    var afterTimestamp = req.param('from');
    var limit = req.param('limit');
    var beforeTimeStamp = req.param('before');


    var query = {};
    if (keyword){
        _.extend(query, {
            keywords : { $regex : keyword.toUpperCase()}
        });
    }

    if (afterTimestamp){
        var actualDoubleTimestamp = parseFloat(afterTimestamp);
        if (actualDoubleTimestamp){
            //var dateBegin = new Date(actualDoubleTimestamp);
            _.extend(query, {
                publicationTimeStamp : { $gte : actualDoubleTimestamp }
            });
        }
    }else{
        if (beforeTimeStamp){
            var doubleTimestamp = parseFloat(beforeTimeStamp);
            _.extend(query, {
                $or : [
                    { publicationTimeStamp : { $lte : doubleTimestamp } },
                    { dateCreated : { $lte : doubleTimestamp } }
                    ]
            });
        }
    }


    Article.find(query).sort({publicationTimeStamp : -1}).populate('newsSource category').limit(limit || DEFAULT_MAX_LIMIT).execQ().then(function(resultArticles){
        res.jsonp(util.apiResponse(resultArticles, null));
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err.message));
    });
};

exports.similarArticles = function(req,res){
    var articleId = req.param('articleId');

    Article.findOne({_id : new mongoose.Types.ObjectId(articleId)}).execQ().then(function(article){

        var keywords = article.keywords;
        var query = { keywords : {$in : keywords}};

        return Article.find(query).limit(10).sort({publicationTimeStamp : -1}).execQ().then(function(articlesFound){
            res.jsonp(util.apiResponse(articlesFound));
        });

    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err.message));
    });
};


exports.getLeads = function(req, res){
    var limit = req.param('limit');

    getSmartLeads(limit).then(function(result){
        var normalizedResult = util.apiResponse(result);
        res.jsonp(normalizedResult);
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err.message));
    }).done();
};



exports.deleteDatabase = function(req, res){
    if (req.query['key'] && req.query['key'] == 'soulstorm'){
        deleteAllArticlesFromDB().then(function(){
            res.jsonp({
                success : true,
                error: null,
                response: "database is cleared. The next time the crawler will run, the DB will be populated anew"
            });
        }).catch(function(err){
            res.jsonp(util.apiResponse(null, err.message));
        });
    }else{
        res.jsonp(util.apiResponse(null, 'Invalid api KEY. Why don\'t you just go fuck youself?'));
    }

};

exports.deleteTweets = function(req, res){
    if (req.query['key'] && req.query['key'] == 'soulstorm'){
        deleteAllTweetsFromDB().then(function(){
            res.jsonp({
                success : true,
                error: null,
                response: "database is cleared. The next time the twitter crawler will run, the DB will be populated anew"
            });
        }).catch(function(err){
            res.jsonp(util.apiResponse(null, err.message));
        });
    }else{
        res.jsonp(util.apiResponse(null, 'Invalid api KEY. Why don\'t you just go fuck youself?'));
    }
};

exports.getCategoryArticles = function(req, res){
    var categoryId = req.query['id'];
    var limit = req.query['limit'];
    var populateNewsSource = req.query['populateNewsSource'];
    var beforeTimeStamp = req.param('before');

    var query = {category : new mongoose.Types.ObjectId(categoryId)};

    if (beforeTimeStamp){
        var doubleTimestamp = parseFloat(beforeTimeStamp);
        _.extend(query, {
            $or : [
                { publicationTimeStamp : { $lte : doubleTimestamp } },
                { dateCreated : { $lte : doubleTimestamp } }
            ]
        });
    }

    var queryObject = Article.find(query).sort({publicationTimeStamp : -1}).limit(limit || DEFAULT_MAX_LIMIT);

    if (populateNewsSource && populateNewsSource == 1){
        queryObject.populate('newsSource');
    }

    queryObject.execQ().then(function(result){
        res.jsonp(util.apiResponse(result));
    }).catch(function(error){
        res.jsonp(util.apiResponse(null, error.message));
    });
};


exports.getSmartLeads = function(req, res){

    getSmartLeads().then(function(result){
        res.jsonp(util.apiResponse(result));
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err));
    });
};



exports.getArticleCategories = function(req, res){
    SubFeed.find({}).populate('category parentNewsSource').exec(function(err, result){
        res.jsonp(util.apiResponse(result, null));
    });
};

exports.getRootCategories = function(req, res){
    Category.find({}).execQ().then(function(result){
        res.jsonp(util.apiResponse(result));
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err));
    });
};


/**
 *
 * @param req
 * @param res
 */
exports.getWidgetNews = function(req, res){
    getSmartLeads().then(function(articles){
        var articlesToKeep = _.chain(articles).shuffle().slice(0,10).value();
        res.jsonp(util.apiResponse(articlesToKeep));
    }).catch(function(error){
        res.jsonp(util.apiResponse(null, error));
    })
};



exports.getArticleByID = function(req, res){
    var id = req.query['id'];

    Article.findOne({_id : id}).execQ().then(function(articleFound){
        res.jsonp(util.apiResponse(articleFound));
    }).catch(function(error){
        res.jsonp(util.apiResponse(null, error));
    })
};

exports.getArticlesBySearchTerm = function(req, res){
    var keyword = req.query['keyword'];
    var categoryId = req.query['category'];
    var populateNewsSource = req.query['populateNewsSource'];
    var limit = req.query['limit'];

    console.log('search');

    if (!keyword){
        res.jsonp(util.apiResponse(null, 'variable "keyword" not found.'));
    }else if (keyword.length < 3){
        res.jsonp(util.apiResponse(null, 'keyword length should be larger than 2'));
    }else {
        console.log('keyword: ' + keyword);
        var keywordArray = _.chain(keyword.split(' ')).map(function(k){

            return new RegExp('\\/*' + k + '\\/*', 'gi');
            //return /^k/i;
        }).value();


        var query = {};
        query = _.extend(query,
            {
                $or: [
                    {keywords: {$in: keywordArray}},
                    {$text: {$search: keyword}}
                ]
            }
        );

        if (categoryId){
            query = _.extend(query, {category : new mongoose.Types.ObjectId(categoryId)});
        }

        //console.log(keywordArray);
        //console.log(JSON.stringify(query));

        var queryObject = Article.find(query);

        if (populateNewsSource && populateNewsSource == 1){
            queryObject.populate('newsSource');
        }

        queryObject.sort({publicationTimeStamp : -1}).limit(limit || DEFAULT_MAX_LIMIT).execQ().then(function(articles){
            res.jsonp(util.apiResponse(articles));
        }).catch(function(error){
            console.log(error);
            res.jsonp(util.apiResponse(null, error));
        });


    }
};
