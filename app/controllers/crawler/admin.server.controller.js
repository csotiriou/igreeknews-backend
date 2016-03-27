/**
 * Created by soulstorm on 20/06/15.
 */

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
var NewsSourceCategory = mongoose.model('NewsSourceCategory');


/*
 * ---------------------------------------------------
 * ArticleCategories
 * ---------------------------------------------------
 */
exports.getArticleCategories = function(req, res){
    Category.find({}).execQ().then(function(result){
        console.log(result);
        res.jsonp(util.apiResponse(result));
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err));
    });
};

exports.createArticleCategory = function(req, res){
    var newCategoryName = req.body['name'];
    var newCategoryDisplayName = req.body['displayName'];
    var id = req.body['id'];

    var existingQuery = id? {_id : new mongoose.Types.ObjectId(id)} : {name : newCategoryName};

    if(!newCategoryName || newCategoryName.length < 2){
        res.jsonp(util.apiResponseParametersMissing(['newCategoryName']));
        return;
    }

    Category.findOneAndUpdate(existingQuery, {name : newCategoryName, displayName : newCategoryDisplayName}, {upsert : true, new : true}, function(err, category){
        if (err){
            res.jsonp(util.apiResponse(null, err));
        }else{
            res.jsonp(util.apiResponse(category));
        }
    });
};

exports.deleteArticleCategory = function(req, res){
    var categoryId = req.body['id'];

    console.log('category delete : ' + categoryId);
    if(!categoryId){
        res.jsonp(util.apiResponseParametersMissing(['id']));
        return;
    }
    Category.remove({_id : new mongoose.Types.ObjectId(categoryId)}, function(err){
        if (err){
            res.jsonp(util.apiResponseParametersMissing(null, err));
        }else{
            res.jsonp(util.apiResponseParametersMissing(true));
        }
    });
};

/*
 * ---------------------------------------------------
 * News Sources
 * ---------------------------------------------------
 */

exports.getNewsSources = function(req, res){
    NewsSource.find({}).populate('category subcategories subcategories.category').execQ().then(function(newsSources){
        console.log(newsSources);
        console.log('-----------------------------------------');

        Category.find({_id : newsSources[0].category}).execQ().then(function(result){
             console.log("category");
             console.log(result);
        });

        res.jsonp(util.apiResponse(newsSources));
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err));
    });
};

exports.getSourceById = function(req, res){
    var id = req.query['id'];
    if (!id){
        res.jsonp(util.apiResponse(null, '"id" property was not provided'));
        return;
    }

    NewsSource.findOne({_id : new mongoose.Types.ObjectId(id) }).populate('category subcategories subcategories.category').execQ().then(function(result){
        res.jsonp(util.apiResponse(result));
    }).catch(function(error){
        res.jsonp(util.apiResponse(null, error));
    });
};


exports.insertOrUpdateNewsSource = function(req, res){
    var id = req.body['id'];
    var name = req.body['name'];
    var rootUrl = req.body['rootUrl'];
    var category = req.body['category'];
    var gravity = req.body['gravity'];

    console.log(id);
    console.log(name);
    console.log(rootUrl);

    var query = id ? {_id : new mongoose.Types.ObjectId(id) } : {name : name};

    var objectToUpdate = {
        name : name,
        rootUrl : rootUrl,
        category : mongoose.Types.ObjectId(category),
        gravity : gravity
    };

    NewsSource.findOneAndUpdate(query, objectToUpdate, {new : true, upsert : true}, function (err, result){
        if (err){
            res.jsonp(util.apiResponse(null,err));
        }else{
            res.jsonp(util.apiResponse(result));
        }
    });
};

exports.deleteNewsSource = function(req, res){
    var id = req.body['id'];

    Article.remove({newsSource : id}).exec();
    SubFeed.remove({parentNewsSource : id}).exec();

    NewsSource.remove({_id : new mongoose.Types.ObjectId(id)}).exec().then(function(doc){
        res.jsonp(util.apiResponse(doc));
    }, function(err){
        res.jsonp(util.apiResponse(null, err));
    });
};


/*
 * ---------------------------------------------------
 * SubCategories
 * ---------------------------------------------------
 */
exports.addSubFeed = function(req, res){
    var newsSourceId = req.body['newsSourceId'];
    var newName = req.body['name'];
    var newFeedUrl = req.body['url'];
    var categoryId = req.body['categoryId'];
    var isMainFeed = req.body['isMainFeed'];

    NewsSource.findOne({_id : new mongoose.Types.ObjectId(newsSourceId) }).then(function(newsSource){
        if (!newsSource){
            res.jsonp(util.apiResponse(null, 'no newsSource found with id: ' + newsSourceId));
        }else{
            var newFeed = new SubFeed({
                name : newName,
                feed : newFeedUrl,
                category : mongoose.Types.ObjectId(categoryId),
                parentNewsSource : newsSource._id,
                isMainFeed : isMainFeed
            });

            return newFeed.saveQ().then(function(newSubFeed){
                //now we have the ID
                newsSource.subcategories.push(newSubFeed._id);
                return newsSource.saveQ();

            }).then(function(updatedNewsSource){
                res.jsonp(util.apiResponse(updatedNewsSource));
            }).catch(function(err){
                res.jsonp(util.apiResponse(null, err));
            });
        }
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err));
    });
};

exports.deleteSubFeed = function(req, res){
    var id = req.body['id'];
    if (!id){
        res.jsonp(util.apiResponse(null, '"id" property was not provided'));
        return;
    }

    //remove the articles for this SubFeed
    SubFeed.remove({subcategory : mongoose.Types.ObjectId(id)});

    SubFeed.findOneAndRemove({_id : new mongoose.Types.ObjectId(id) }).execQ().then(function(removed){
        res.jsonp(util.apiResponse({removed : removed}));
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err));
    });
};



/*
 * ---------------------------------------------------
 * News Source Categories
 * ---------------------------------------------------
 */

exports.getNewsSourceCategories = function(req, res){
    NewsSourceCategory.find({}).execQ().then(function(result){
        console.log(result);
        res.jsonp(util.apiResponse(result));
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err));
    });
};

exports.createNewsSourceCategory = function(req, res){
    var newCategoryName = req.body['name'];
    var newCategoryDisplayName = req.body['displayName'];
    var newId = req.body['id'];

    var existingQuery = newId? {_id : new mongoose.Types.ObjectId(newId)} : {name : newCategoryName};

    if(!newCategoryName || newCategoryName.length < 2){
        res.jsonp(util.apiResponseParametersMissing(['newCategoryName']));
        return;
    }

    NewsSourceCategory.findOneAndUpdate(existingQuery, {name : newCategoryName, displayName : newCategoryDisplayName}, {upsert : true, new : true}, function(err, category){
        if (err){
            res.jsonp(util.apiResponse(null, err));
        }else{
            res.jsonp(util.apiResponse(category));
        }
    });
};


exports.deleteNewsSourceCategory = function(req, res){
    var categoryId = req.body['id'];


    Article.remove({category : mongoose.Types.ObjectId(categoryId)}).exec();
    SubFeed.remove({category : mongoose.Types.ObjectId(categoryId)}).exec();

    NewsSourceCategory.remove({_id : new mongoose.Types.ObjectId(categoryId)}).then(function(){
        res.jsonp(util.apiResponse('document with ID: ' + categoryId));
    }, function(err){
        res.jsonp(util.apiResponse(null, err));
    });
};