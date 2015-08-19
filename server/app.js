/* global process */
'use strict';

var express = require('ft-next-express');
var denodeify = require('denodeify');

var dnsResolve = denodeify(require('dns').resolve);
var dnsResolve4 = denodeify(require('dns').resolve4);
var dnsLookup = denodeify(require('dns').lookup);

var app = express({
	withFlags: false,
	withHandlebars: false
});

var apiKey = process.env.MARKETS_APIKEY;
var marketsUrl = 'http://markets.ft.com/research/webservices/securities/v1/quotes?symbols=pson:lse,mrkt';
var portfolioUrl = 'http://portfolio.ft.com/webservices/v1/portfolios?timeframes=oneDay|lifetime&userId=4011101642&source=51d7791a57&sig=bb0777d0976b0333d76ab03c4098679b';
var marketsHost = 'markets.ft.com';
var portfolioHost = 'portfolio.ft.com';
var opts = {
	headers: {
		'X-FT-Source': apiKey
	},
	timeout: 5000
};

app.get('/__gtg', function(req, res) {
	res.status(200).end();
});

app.get('/test', function(req, res, next) {
	var start = new Date().getTime();
	var promises = [];
	promises.push(fetch(marketsUrl, opts)
		.then(function() {
			var timeTaken = new Date().getTime() - start;
			console.log('Time taken for markets fetch call', timeTaken);
			return {
				name: "Markets Data fetch call",
				time: timeTaken
			}
		})
	);

	promises.push(fetch(portfolioUrl, opts)
		.then(function() {
			var timeTaken = new Date().getTime() - start;
			console.log('Time taken for portfolio fetch call', timeTaken);
			return {
				name: "Portfolio Data fetch call",
				time: timeTaken
			}
		})
	);

	promises.push(dnsResolve(marketsHost).then(function() {
		var timeTaken = new Date().getTime() - start;
			console.log('Time taken for markets dns resolve', timeTaken);
			return {
				name: "Markets DNS Resolve",
				time: timeTaken
			}
		})
	);

	promises.push(dnsResolve4(marketsHost).then(function() {
		var timeTaken = new Date().getTime() - start;
			console.log('Time taken for markets dns resolve4', timeTaken);
			return {
				name: "Markets DNS Resolve4",
				time: timeTaken
			}
		})
	);

	promises.push(dnsLookup(marketsHost).then(function() {
		var timeTaken = new Date().getTime() - start;
			console.log('Time taken for markets dns lookup', timeTaken);
			return {
				name: "Markets DNS Lookup",
				time: timeTaken
			}
		})
	);

	promises.push(dnsLookup(marketsHost, 4).then(function() {
		var timeTaken = new Date().getTime() - start;
			console.log('Time taken for markets dns lookup 4', timeTaken);
			return {
				name: "Markets DNS Lookup 4",
				time: timeTaken
			}
		})
	);

	promises.push(dnsResolve(portfolioHost).then(function() {
		var timeTaken = new Date().getTime() - start;
			console.log('Time taken for portfolio dns resolve', timeTaken);
			return {
				name: "Portfolio DNS Resolve",
				time: timeTaken
			}
		})
	);

	promises.push(dnsResolve4(portfolioHost).then(function() {
		var timeTaken = new Date().getTime() - start;
			console.log('Time taken for portfolio dns resolve4', timeTaken);
			return {
				name: "Portfolio DNS Resolve4",
				time: timeTaken
			}
		})
	);

	promises.push(dnsLookup(portfolioHost).then(function() {
		var timeTaken = new Date().getTime() - start;
			console.log('Time taken for portfolio dns lookup', timeTaken);
			return {
				name: "Portfolio DNS Lookup",
				time: timeTaken
			}
		})
	);

	promises.push(dnsLookup(portfolioHost, 4).then(function() {
		var timeTaken = new Date().getTime() - start;
			console.log('Time taken for portfolio dns lookup 4', timeTaken);
			return {
				name: "Portfolio DNS Lookup 4",
				time: timeTaken
			}
		})
	);

	Promise.all(promises).then(function(results) {
		res.send(results);
	});

});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	logger.info('Listening on ' + port);
});
