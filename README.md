[![Build Status](https://travis-ci.org/Financial-Times/next-markets-proxy-api.svg?branch=master)](https://travis-ci.org/Financial-Times/next-markets-proxy-api)

# Next Markets Proxy API

## Usage

Clone the repo and export a Brightcove API in to your environment,

    export MARKETS_APIKEY='abcdef...';

Install dependencies

    make install

Test it,

    make test

Run it,

    make run

The app is essentially a proxy to http://markets.ft.com/research/webservices/ - which is documented [Markets API documentation](http://markets.ft.com/research/webservices/)

### Examples

 * Get quote data - [http://localhost:3613/securities/v1/quotes?symbols=uk:tsco](http://localhost:3613/securities/v1/quotes?symbols=uk:tsco)
