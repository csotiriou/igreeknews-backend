/**
 * Created by soulstorm on 11/10/15.
 */
var http = require('http');
var urlParser = require('url');
var async = require('async');
var FeedParser = require('feedparser');
var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var Article = mongoose.model('Article');
var Datamap = mongoose.model('Datamap');
var CronJob = require('cron').CronJob;
var sources = require('./Sources.json');
var _ = require('lodash');
var S = require('string');
var lexer = require('./lexer.greek.js');
var util = require('./util');
var Category = mongoose.model('ArticleCategory');
var NewsSource = mongoose.model('NewsSource');
var SubFeed = mongoose.model('SubFeed');
var readabilityUtil = require('./readabilityUtil');


var Definitions = {
    currentIndex : 0,
    maximumIndex : 0,
    consolidationInitialObjectId : null,
    consolidationLimit : 10,

    rssCronJobInterval : 30,
    rssCronJobRemainingSeconds : 10,

    articleTextCronJobInterval : 10,
    articleTextCronJobRemainingSeconds : 10,
    articleTextProcessing : false,
    articleBatchSize : 10
};


/**
 * Setup a cron job to get the article's content
 */
var setupCrawlArticlesRSSCronJob = _.once(function(){
    console.log('setting up article daemon...');
    Definitions.articleTextCronJobRemainingSeconds = Definitions.articleTextCronJobInterval;

    var job = new CronJob({
        cronTime : '* * * * * *',
        onTick : function(){
            if (Definitions.articleTextProcessing){
                return;
            }
            Definitions.articleTextCronJobRemainingSeconds--;
            if (Definitions.articleTextCronJobRemainingSeconds == 0){
                crawlArticlesForFullText();
                Definitions.articleTextCronJobRemainingSeconds = Definitions.articleTextCronJobInterval;
            }
        },
        start: false,
        timeZone : 'Europe/Athens'
    });

    job.start();
});

/**
 * Starting the cron job to update the RSS feeds
 */
var setupRefreshRSSCronJobOnce = _.once(function(){
    console.log('setting up refresh cron job daemon...');
    Definitions.rssCronJobRemainingSeconds = Definitions.rssCronJobInterval;
    var job = new CronJob({
        cronTime : '* * * * * *',
        onTick : function(){
            Definitions.rssCronJobRemainingSeconds--;
            if (Definitions.rssCronJobRemainingSeconds == 0){
                consolidateArticles();
                Definitions.rssCronJobRemainingSeconds = Definitions.rssCronJobInterval;
            }
        },
        start: false,
        timeZone : 'Europe/Athens'
    });

    job.start();
});



setupRefreshRSSCronJobOnce();
setupCrawlArticlesRSSCronJob();


//--------------------------------------------------

var crawlArticlesForFullText = function(){
    Definitions.articleTextProcessing = true;
    console.log('crawling specific articles..');

    Article.find({$or : [{alreadySearchedForFullText : {$exists : false}}, {alreadySearchedForFullText : false}]}).sort({publicationTimeStamp : -1}).limit(Definitions.articleBatchSize).execQ().then(function(articleBatch){
        async.eachLimit(articleBatch, Definitions.articleBatchSize, function(articleModel, callback){
            readabilityUtil.getContentAndFullArticle(articleModel.url, articleModel).fin(function(){
                console.log('article: ' + articleModel.url + ' finished');
                callback();
            });
        }, function(err){
            Definitions.articleTextProcessing = false;
            if (err){
                console.error('error while processing articles: ' + err);
            }else{
                console.log('all urls processed successfully.');
            }
        });
    });
};

/**
 * creates the default mapping for categories and news sources in the database
 */
var saveDefault = function(){
    var articleCategories = sources["sources"]["categories"];

    function findCategoryObjectWithName(categoryName){
        _.find(sources["sources"]["categories"], function(cat){
            return cat == categoryName;
        });
    }

    //get all subcategories, transform them to plain objects
    _.each(articleCategories, function(category){

        Category.findOneAndUpdate({name : category.name}, {name : category.name, sources : []}, {upsert : true, new : true}, function(err, CategoryReturned){

            async.eachLimit(category.sources, 1, function(newsSourceJSON, callback){
                var dict = _.extend(newsSourceJSON, {category : CategoryReturned._id});

                NewsSource.findOneAndUpdate({rootUrl : dict.rootUrl}, dict, {upsert : true, new : true}, function(err, returnedObject){
                    callback();
                });
            }, function (err){
                console.log('----------------------------------------------- categoryModelsSaved');
            });

        });
    });
};



/**
 * gets all news sources and populates their categories
 * @returns {Promise}
 */
var getGroupedArticleCategories = function(){
    return NewsSource.find({}).populate('category subcategories subcategories.category').exec();
};

/**
 * Periodic task. Each time it runs, it selects a subset of the available subfeeds, and consolidates the database with articles
 * @param req
 * @param res
 */
var consolidateArticles = function(req, res){
    var searchArguments = {};
    if (Definitions.consolidationInitialObjectId){
        searchArguments = {_id : {$gt : Definitions.consolidationInitialObjectId}};
    }
    var query = SubFeed.find(searchArguments).populate('category parentNewsSource');


    query.limit(Definitions.consolidationLimit).populate('category parentNewsSource').execQ().then(function(subFeeds){
        if (subFeeds.length < Definitions.consolidationLimit){
            Definitions.consolidationInitialObjectId = null;
        }else{
            Definitions.consolidationInitialObjectId = _.last(subFeeds).id;
        }

        consolidateArticlesForNewsSources(req, res, subFeeds);
    });
};


var handleCrawlingError = function(res, err, allErrors, competitionsCount, allSources, articles){
    console.log(err);
    console.log('completions: ' + competitionsCount + ', all sources count: ' + allSources.length);
    console.log(_.pluck(allSources, 'feed'));
    if (competitionsCount == allSources.length) {
        if (res) {
            res.jsonp({
                success: true,
                errors: allErrors,
                response: {articles: articles}
            });
        }
    }
};

var addDateOffset = function(articleProxies, offset){
    articleProxies.forEach(function(proxyObject){
        proxyObject. publicationTimeStamp += offset;
    });
};

var consolidateArticlesForNewsSources = function(req, res, newsSourceDBObjects){
    /**
     *we should pluck here the sub - categories, and start getting articles here for them
     */
    //get it done!!!

    //articles parsed
    var articles = [];

    //completed articles and parsed ones
    var completions = 0; //errors or success

    //all errors found during parsing
    var errors = [];

    //all the host names found during parsing
    var allHostNames = [];


    async.eachLimit(newsSourceDBObjects, 5, function(feedSource, callback){
        var feedSourceURL = feedSource["feed"];
        var feedMeta = null;
        var localArticles = [];

        var callbackCallOnce = _.once(function(){
            callback();
        });

        http.get(feedSourceURL, function(httpResult) {

            httpResult.pipe(
                new FeedParser({}))
                .on('error', function(error){
                    console.error(feedSourceURL + ':' + error);
                    completions++;
                    errors.push ({ url : feedSourceURL, error : error.message});
                    callbackCallOnce();
                })
                .on('meta', function(meta){
                    // Store the metadata for later use
                    feedMeta = meta;
                })
                .on('readable', function(){
                    localArticles = localArticles.concat(readFromStream(this));
                })
                .on('end', function(){
                    var operationsArray = [];


                    //TODO:revisit this problem
                    //sometimes, some URLs do not respect the UTC format, and they return
                    ////localized formats, which in turn, get localized by the server for a second time.
                    //fix the dates here. if the first item needs a date rotation, all items need a date rotation
                    //the amount of time we will deduct is 3 hours, since for now, we are taking only about greek news (3 hours ahead).
                    //we don't use the dynamic time (new Date().getTimezoneOffset()) since the server may be in another country.
                    if (localArticles.length > 0){
                        var maxTimestamp = localArticles[0].publicationTimeStamp;
                        if (maxTimestamp){
                            var currentDate = new Date();
                            if (currentDate.getTime() - maxTimestamp < 0) {
                                addDateOffset(localArticles, -180 * 1000 * 60);
                            }
                        }
                    }


                    localArticles.forEach(function (articleProxy){
                        operationsArray.push(function(saveCallback){
                            saveArticle(articleProxy, feedSource, saveCallback);
                            allHostNames.push(articleProxy.hostName);
                        });
                    });

                    async.parallel(operationsArray, function(errors, results){
                        completions++;
                        articles = articles.concat(localArticles);
                        callbackCallOnce();
                    });

                });
        }).on('error', function(e){
            console.error(feedSourceURL + ':' + e.message);
            callbackCallOnce();
            completions++;
        });
    }, function(err){
        handleCrawlingError(res, err, errors, completions, newsSourceDBObjects, articles);
    });
};





/**
 * Save an article, call the callback when done
 * @param articleProxy
 * @param feedSource
 * @param callback
 */
var saveArticle = function(articleProxy, feedSource,  callback){

    var maxLength = 497;
    var strippedSummary = articleProxy.summary;
    var keywords = [];

    var titleKeywords = lexer.keywordsFromText( + " " + articleProxy.title);
    if (titleKeywords){
        //append the title keywords
        keywords = keywords.concat(titleKeywords.keywords)
    }

    if (strippedSummary && strippedSummary.length > maxLength){
        strippedSummary = strippedSummary.substr(0,maxLength) + "...";
    }

    if (strippedSummary){
        //append the content keywords
        keywords = keywords.concat(lexer.keywordsFromText(strippedSummary).keywords);
    }

    keywords = _.uniq(keywords);


    var actualImageURL = null;
    if (articleProxy.imageUrl && articleProxy.imageUrl != 'undefined'){
        actualImageURL = articleProxy.imageUrl;
        //maybe we have the local path an not the whole path. in this case, we need to fix that.
        if (actualImageURL.indexOf('http://') < 0){
            //we need to put an http before it.
            var hostName = articleProxy.hostName;
            if (actualImageURL.indexOf(hostName) >= 0){
                actualImageURL = 'http://' + actualImageURL;
            }else{
                actualImageURL = 'http://' + articleProxy.hostName + '/' + actualImageURL;
            }


        }
    }

    Article.findOneAndUpdate({
        url : articleProxy.mediaUrl
    }, {
        title : articleProxy.title,
        content : articleProxy.summary,
        summary : strippedSummary,
        url : articleProxy.mediaUrl,
        publicationDate : articleProxy.publicationDate,
        publicationTimeStamp : articleProxy.publicationTimeStamp,
        feedUrl : feedSource["feed"],
        tags : feedSource["category"].id,
        hostName : articleProxy.hostName,
        keywords : keywords,
        imageUrl : actualImageURL,
        newsSource : feedSource.parentNewsSource.id,
        category : feedSource.category
    }, {
        upsert : true
    }, function(err, numAffected){
        if (err){
            console.error(err);
        }
        callback();
    });
};

var readFromStream = function(stream){
    var articles = [];
    var item;
    while (item = stream.read()){
        // Each 'readable' event will contain 1 article
        // Add the article to the list of articles
        var urlObject = urlParser.parse(item.origlink || item.link);

        var htmlProcessResult = util.processHTMLTags(item.summary || item.description);
        var descriptionString = htmlProcessResult.str;
        var imageFoundIfAny = htmlProcessResult.imageFound;


        var timeStamp = item.date? (item.date.getTime() || 0) : 0;


        var ep = {
            'title': item.title,
            'mediaUrl': (item.origlink? item.origlink : item.link),
            'summary' : descriptionString,
            'description' : item.description,
            'publicationDate': item.date,
            'publicationTimeStamp' : timeStamp,
            'hostName' : urlObject.hostname,
            'imageUrl' : item.image.url || imageFoundIfAny,
            'imageTitle' : item.image.title
        };


        articles.push(ep);
    }
    return articles;
};


exports.consolidateArticles = consolidateArticles;
