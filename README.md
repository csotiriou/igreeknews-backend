iGreekNews Service
===================

A NodeJS backend, which is a driving force behind the old iGreekNews Service (oramind.net)

A little bit of history
-----------------------

On August 2015, iGreekNews iOS application was released, reaching a few thousands of users. iGreekNews (2015 version) is a complete revamp of the paid iGreekNews application, originally released in 2009, which counted tens of thousands of users.

The 2015 version brought some new features:

 - Finding similar articles to the one that the user is currently reading.
 - Readability. The user could read the articles stripped of ads and other useless content. 
 - iGreekNews API can now work as a service. previously the application contacted the news sources directly.
 - Support for getting the latest greek news from the Twitter Stream, and accessing the via filters (get only video, only audio, only images)
 - Advanced twitter filtering, and news filtering. Searching old news was a breeze.
 
**Screenshots below:**

<img src="http://oramind.com/wp-content/uploads/2015/08/500x500bb-80-3.png" width="150"> <img src="http://oramind.com/wp-content/uploads/2015/08/500x500bb-80.png" width="150"> <img src="http://oramind.com/wp-content/uploads/2015/08/500x500bb-80-1.png" width="150">

It took quite a lot of work, creating a crawler and an administrative backend (not supplied in this repo) for managing the states of URL sources, categorizing the articles, and optimizing article queries.

However, after a few months I was forced to take down the service, this time due to issues with Apple ([My post here](http://oramind.com/r-i-p-igreeknews-part-2/))


Therefore, I am giving the source code of the backend, since I am no longer using it, or maintaining it.

##Technical Features

 - Supporting Mongoose 4.1.x
 - Supporting NodeJS 4.1+
 - MongoDB backend
 - Angular 1.4 frontend
 - Express Router
 - Socket.io, Twitter streaming
 - Searching for similar articles, by categorizing crawled articles and assigning them keywords (lexer inside the source code.)
 
 The iGreekNews service used Nginx for load balancing and Varnish server for HTTP acceleration and caching. I wrote a small tutorial (not covering all techniques that iGreekNews incorporated) [here](http://oramind.com/nodejs-varnish-nginx/)

####Things unmaintained / wishes

 - Replacing mongoose promises with ES6 promises (mongoose has put support in it)
 - Code cleanup
 - Adding graph-based search system
 - Update some components in order to support ES6 features.
 - Better bundling for components.
 - Adding user personalization (that's why references to logins and authentication methods are present in the source)
 - Making a full-featured website, possibly abandoning Angular in favor of React

Arhitecture taken from [MEAN.js's excellent template](https://github.com/meanjs/mean).

####Some sample links

- [Sample Twitter Front](http://oramind.net:3000/#!/twitter), [API](http://oramind.net:3000/api/twitter/leads)
- [Sample FrontPage](http://oramind.net:3000/#!/dashboard), [API](http://oramind.net:3000/api/leads)

There are many more paths and routes.


#TODO for this repo:
Add better documentation and remove some useless code.



#Thoughts welcome

Find me / contact me at [http://oramind.com](http://oramind.com)
