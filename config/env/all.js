'use strict';

module.exports = {
	app: {
		title: 'MEAN.JS',
		description: 'NodeJS backend, service the igreeknews service',
		keywords: 'oramind, igreeknews, greek, news'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'mySessioNSecret',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions',
	// The session cookie settings
	sessionCookie: { 
		path: '/',
		httpOnly: true,
		// If secure is set to true then it will cause the cookie to be set
		// only when SSL-enabled (HTTPS) is used, and otherwise it won't
		// set a cookie. 'true' is recommended yet it requires the above
		// mentioned pre-requisite.
		secure: false,
		// Only set the maxAge to null if the cookie shouldn't be expired
		// at all. The cookie will expunge when the browser is closed.
		maxAge: null,
		// To set the cookie in a specific domain uncomment the following 
		// setting:
		// domain: 'yourdomain.com'
	},
	// The session cookie name
	sessionName: 'connect.sid',
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/preloadcss/preload.css',
				'public/lib/slidebars/distribution/0.10.2/slidebars.min.css',
				'public/lib/metisMenu/dist/metisMenu.min.css',
				'public/lib/iCheck/skins/flat/flat.css'
			],
			js: [
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/navgoco/src/jquery.navgoco.min.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/bootstrap/dist/js/bootstrap.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/masonry/dist/masonry.pkgd.min.js',
				'public/lib/imagesloaded/imagesloaded.js',
				'public/lib/socket.io-client/socket.io.js',
				'public/lib/slidebars/distribution/0.10.2/slidebars.min.js',
				'public/lib/lodash/lodash.min.js',
				'public/lib/bootbox/bootbox.js',
				'public/lib/ngBootbox/dist/ngBootbox.min.js',
				'public/lib/metisMenu/dist/metisMenu.min.js',
				'public/lib/iCheck/icheck.min.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
