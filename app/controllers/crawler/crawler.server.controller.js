'use strict';

var util = require('../../util/util');
var crawler = require('../../util/crawler');


exports.crawlRSS = function(req, res){
    if (!req.query["keyword"] || req.query["keyword"] != "sample_keyword"){
        res.jsonp(util.apiResponse("fuck you."));
    }else{
        crawler.consolidateArticles(req, res);
    }
};

