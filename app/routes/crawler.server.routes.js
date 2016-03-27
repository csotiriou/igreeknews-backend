'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var crawler = require('../../app/controllers/crawler/crawler.server.controller');
	var newsController = require('../../app/controllers/crawler/news.server.controller');

	// Setting up the users profile api
	app.route('/api/crawl').get(crawler.crawlRSS);

    app.route('/api/leads').get(newsController.getSmartLeads);
    app.route('/api/leads').post(newsController.getSmartLeads);

    app.route('/api/delete').get(newsController.deleteDatabase);
    app.route('/api/twitter/delete').get(newsController.deleteTweets);

    //articles
    app.route('/api/articles').get(newsController.getArticles);
    app.route('/api/articles/similar').get(newsController.similarArticles);
    app.route('/api/articles/categories').get(newsController.getArticleCategories);
    app.route('/api/articles/rootCategories').get(newsController.getRootCategories);

    app.route('/api/articles/category').get(newsController.getCategoryArticles);
    app.route('/api/articles/leads').get(newsController.getSmartLeads);

    //search
    app.route('/api/articles/search').get(newsController.getArticlesBySearchTerm);

    //mobile only
    app.route('/api/articles/widget/leads').get(newsController.getWidgetNews);
    app.route('/api/articles/article/').get(newsController.getArticleByID);


};
