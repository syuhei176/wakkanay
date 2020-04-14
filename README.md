# Wakkanay

Wakkanay is experimental ovm implementation in TypeScript.

[![Build Status](https://travis-ci.org/cryptoeconomicslab/wakkanay.svg?branch=master)](https://travis-ci.org/cryptoeconomicslab/wakkanay)
[![Coverage Status](https://coveralls.io/repos/github/cryptoeconomicslab/wakkanay/badge.svg)](https://coveralls.io/github/cryptoeconomicslab/wakkanay)

## Run aggregator

You need Docker installed in your computer to run e2e test.

```
$ cd integration-test/aggregator
$ cp .sample.env .env

# go back to project root
$ cd ../..
$ npm run docker:build
$ npm run docker:start
```

## Run e2e test

You need Docker installed in your computer to run e2e test.

```
$ cd integration-test/aggregator
$ cp .sample.env .env

# go back to project root
$ cd ../..
$ npm run docker:build
$ npm run docker:test
```
