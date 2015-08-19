PORT := 3613
TEST_HOST := "ft-market-proxy-branch-${CIRCLE_BUILD_NUM}"
MARKETS_API_KEY := $(shell cat ~/.marketsapi 2>/dev/null)

.PHONY: test

clean:
	git clean -fxd

install:
	npm install

run:
ifeq ($(MARKETS_API_KEY),)
	@echo "You need markets data api key!  Speak to one of the next team to get one"
	exit 1
endif
	export PORT=${PORT}; \
	export HOSTEDGRAPHITE_APIKEY=1; \
	export MARKETS_APIKEY=${MARKETS_API_KEY}; \
	nbt run --harmony

test: build-production
	nbt verify --skip-layout-checks
	export NODE_ENV=test; \
	export MARKETS_APIKEY=testkey; \
	export HOSTEDGRAPHITE_APIKEY=123; \
	mocha

build-production:
	nbt about

tidy:
	nbt destroy ${TEST_HOST}

provision:
	nbt provision ${TEST_HOST}
	nbt configure ft-next-markets-proxy-api ${TEST_HOST} --overrides "NODE_ENV=branch,DEBUG=*"
	nbt deploy ${TEST_HOST} --skip-enable-preboot --docker

deploy:
	nbt configure
	nbt deploy --docker
