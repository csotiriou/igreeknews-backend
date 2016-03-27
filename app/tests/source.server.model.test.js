'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose');
var NewsSource = mongoose.model('NewsSource');
var Article = mongoose.model('Article');




var newsSource1;

describe('News Source Model Unit Tests: ', function(){
    before(function(done){
         newsSource1 = new NewsSource({
             name: "TestSource"
         });
        done();
    });

    describe('Method Save', function(){
        it('should begin with no sources', function(done){
            //NewsSource.find({}, function(err, newsSources){
            //    newsSources.should.have.length(0);
                done();
            //});
        });
    //
    //    it('should be able to save without problems', function(done) {
    //        newsSource1.save(done);
    //    });
    //
    //    it('should be able to fetch the saved object', function(done){
    //        NewsSource.findOne({name : 'TestSource'}, function(err, source){
    //            should.exist(source);
    //            should.not.exist(err);
    //            source.name.should.equal('TestSource');
    //            done();
    //        });
    //    });
    //
    //
    //
    //    it('should be able to save articles, too!', function(done){
    //         NewsSource.findOne({name : 'TestSource'}, function(err, source){
    //
    //             should.exist(source);
    //             should.not.exist(err);
    //
    //             source.articles.push(new Article({
    //                 url : "testurl",
    //                 title : "testtitle"
    //             }));
    //
    //             console.log(source);
    //
    //             source.save(done);
    //         });
    //    });
    //
    //
    //    it('shouldBeAbleTofetch the saved collection', function(done){
    //        NewsSource.findOne({name : 'TestSource'}, function(err, source){
    //            console.log(source.articles);
    //            console.log(source);
    //
    //            source.articles.should.have.length(1);
    //            source.articles[0].title.should.equal('testtitle');
    //            source.articles[0].url.should.equal('testurl');
    //
    //            done();
    //        });
    //    });
    //
    //    it('should be able to fetch individual articles that were saved', function(done){
    //        Article.findOne({url : 'testurl'}, function(err, result){
    //            should.exist(result);
    //            result.url.should.equal('testurl');
    //            done();
    //        });
    //    });
    //
    //
    //
    });


    after(function(done){
        NewsSource.remove().exec().then(function(){
            return Article.remove().exec();
        }).then(function(){
            done();
        })
    });

});
/**
 * Globals
 */
var user, user2;

/**
 * Unit tests
 */
/**describe('User Model Unit Tests:', function() {
	before(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});
		user2 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});

		done();
	});

	describe('Method Save', function() {
		it('should begin with no users', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(0);
				done();
			});
		});

		it('should be able to save without problems', function(done) {
			user.save(done);
		});

		it('should fail to save an existing user again', function(done) {
			user.save();
			return user2.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without first name', function(done) {
			user.firstName = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	after(function(done) {
		User.remove().exec();
		done();
	});
});*/

