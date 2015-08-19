/*global describe, it*/
'use strict';

var expect = require('chai').expect;
var nock = require('nock');
var fs = require('fs');
require('../server/app.js');

var host = "http://markets.ft.com";
var urls = {
	quotes: "/research/webservices/securities/v1/quotes?symbols=",
	profile: "/research/webservices/companies/v1/profile?symbols="
};

var port = process.env.PORT || 3000;
console.log('port', port);
var fixtures = {
	quotes: fs.readFileSync('test/fixtures/quotes.json'),
	unknown: fs.readFileSync('test/fixtures/unknown.json')
};

describe('API proxy', function() {

	it('responds with json for good requests', function() {
		nock(host).get(urls.quotes + 'test').reply(200, fixtures.quotes);
		return fetch('http://localhost:' + port + '/securities/v1/quotes?symbols=test')
			.then(function(response) {
				expect(response.status).to.equal(200);
				return response.json();
			})
			.then(function(data) {
				expect(data.data.items.length).to.equal(1);
				expect(data.data.items[0].basic.symbol).to.equal("TSCO:LSE");
				expect(data.data.items[0].quote.lastPrice).to.equal(176.2);
			});
	});

	it('responds with jsonp if callback supplied', function (done) {
		nock(host).get(urls.quotes + 'test').reply(200, fixtures.quotes);
		return fetch('http://localhost:' + port + '/securities/v1/quotes?symbols=test&callback=callbackFn')
			.then(function(response) {
				expect(response.status).to.equal(200);
				return response.text();
			})
			.then(function (text) {
				/* jshint evil: true, unused: false */
				var callbackFn = function (data) {
					expect(data.data.items[0].basic.symbol).to.equal('TSCO:LSE');
					done();
				};
				eval(text);
			});
	});

	it('responds with error for errored requests', function() {
		nock(host).get(urls.quotes + 'test').reply(400, fixtures.unknown);
		return fetch('http://localhost:' + port + '/securities/v1/quotes?symbols=test')
			.then(function(response) {
				expect(response.status).to.equal(400);
				return response.json();
			})
			.then(function(data) {
				expect(data.error.code).to.equal(400);
				expect(data.error.message).to.equal("Missing or invalid parameters");
			});
	});
});
