/* global process */
'use strict';

var express = require('ft-next-express');
var logger = require('ft-next-logger');
var denodeify = require('denodeify');
var md5 = require('md5');

var dnsResolve = denodeify(require('dns').resolve);
var dnsResolve4 = denodeify(require('dns').resolve4);
var dnsLookup = denodeify(require('dns').lookup);

var DNSCache = require('dnscache');

var app = express({
	withFlags: false,
	withHandlebars: false
});

function getPortfolioUrl() {
	var domain = 'portfolio.ft.com';
	var passportId = 4011101642;
	return 'http://' + domain + '/webservices/v1/portfolios/?' +
	[
	'timeframes=oneDay|lifetime',
	'userId=' + passportId,
	'source=' + process.env.PORTFOLIO_API_KEY,
	'sig=' + md5(passportId + process.env.PORTFOLIO_SALT)
	].join('&');
}

var apiKey = process.env.MARKETS_APIKEY;

var tests = [
{
	name: 'Markets',
	url: 'http://markets.ft.com/research/webservices/securities/v1/quotes?symbols=pson:lse,mrkt',
	host: 'markets.ft.com'
},
{
	name: 'Portfolio',
	url: getPortfolioUrl(),
	host: 'portfolio.ft.com'
},
{
	name: 'Flags',
	url: 'http://ft-next-feature-flags-prod.s3-website-eu-west-1.amazonaws.com/flags/__flags.json',
	host: 'ft-next-feature-flags-prod.s3-website-eu-west-1.amazonaws.com'
}
]

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

	if(req.query.dnscache) {
		var dnscache = require('dnscache')({
    	"enable" : true,
		  "ttl" : 300,
		  "cachesize" : 1000
	  });
	}
	var start = new Date().getTime();
	var promises = [];
	tests.forEach(function(test) {
		promises.push(fetch(test.url, opts)
			.then(function(res) {
				var timeTaken = new Date().getTime() - start;
				return {
					name: test.name,
					test: "fetch(url)",
					time: timeTaken,
					status: res.status
				}
			})
			);

		promises.push(dnsResolve(test.host).then(function(ip) {
			var timeTaken = new Date().getTime() - start;
			return {
				name: test.name,
				test: "dns.resolve",
				time: timeTaken,
				ip: ip
			}
		})
		);

		promises.push(dnsResolve4(test.host).then(function(ip) {
			var timeTaken = new Date().getTime() - start;
			return {
				name: test.name,
				test: "dns.resolve4",
				time: timeTaken,
				ip: ip
			}
		})
		);

		promises.push(dnsLookup(test.host).then(function(ip) {
			var timeTaken = new Date().getTime() - start;
			return {
				name: test.name,
				test: "dns.lookup",
				time: timeTaken,
				ip: ip
			}
		})
		);

		promises.push(dnsLookup(test.host, 4).then(function(ip) {
			var timeTaken = new Date().getTime() - start;
			return {
				name: test.name,
				test: "dns.lookup(..., 4)",
				time: timeTaken,
				ip: ip
			}
		})
		);

		promises.push(dnsResolve(test.host)
			.then(function(ip) {
				if(Array.isArray(ip)) {
					ip = ip[0];
				}
				return fetch(test.url.replace(test.host, ip), opts);
			})
			.then(function(res) {
				var timeTaken = new Date().getTime() - start;
				return {
					name: test.name,
					test: "dns.resolve + fetch(ip)",
					time: timeTaken,
					status: res.status
				}
			})
			);

		promises.push(dnsLookup(test.host, 4)
			.then(function(ip) {
				if(Array.isArray(ip)) {
					ip = ip[0];
				}
				return fetch(test.url.replace(test.host, ip), opts);
			})
			.then(function(res) {
				var timeTaken = new Date().getTime() - start;
				return {
					name: test.name,
					test: "dns.lookup(..., 4) + fetch(ip)",
					time: timeTaken,
					status: res.status
				}
			})
			);

		return promises;

	});


Promise.all(promises).then(function(results) {
	res.send(results);
});

});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	logger.info('Listening on ' + port);
});
