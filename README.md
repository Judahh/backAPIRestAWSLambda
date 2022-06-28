# backAPIRestAWSLambda

![Publish](https://github.com/Judahh/backAPIRestAWSLambda/workflows/Publish/badge.svg)
[![npm version](https://badge.fury.io/js/%40backapirest%2Faws-lambda.svg)](https://badge.fury.io/js/%40backapirest%2Faws-lambda)
[![npm downloads](https://img.shields.io/npm/dt/%40backapirest%2Faws-lambda.svg)](https://img.shields.io/npm/dt/%40backapirest%2Faws-lambda.svg)

A simple API framework using Flexible Persistence

```js
const pool = new Pool(
((DBHandler.getReadHandler() as ServiceHandler)
    .persistence as SequelizeDB).getPersistenceInfo()
);
await Utils.init(pool);
const obj = {};
obj['test'] = 'test';
const handler = DBHandler.getHandler();
const controller = new TestController(DBHandler.getInit());

await ((DBHandler.getReadHandler() as ServiceHandler)
    .persistence as SequelizeDB)
    .getSequelize()
    .models.Test.sync({ force: true });
await handler.getWrite().clear('events');

const sentTest = new Test();
const sentTest2 = new Test();

const store = await controller.create(
    ({
    body: sentTest,
    } as unknown) as Request,
    (mockResponse as unknown) as Response
);
console.log('store:', store);
```

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing,
[download and install Node.js](https://nodejs.org/en/download/).

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file) or
[`yarn init` command](https://classic.yarnpkg.com/en/docs/cli/init/).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally)
or [`yarn add` command](https://classic.yarnpkg.com/en/docs/cli/add):

```bash
$ npm install @backapirest/aws-lambda
```

or

```bash
$ yarn add @backapirest/aws-lambda
```

## Tests

To run the test suite, first install Docker and dependencies, then run
`docker-compose up -d` and `npm test`:

```bash
$ docker-compose up -d
$ npm install
$ npm test
```

or

```bash
$ docker-compose up -d
$ yarn
$ yarn test
```

## People

The original author of backAPIRestAWSLambda is
[Judah Lima](https://github.com/Judahh)

[List of all contributors](https://github.com/Judahh/backAPIRestAWSLambda/graphs/contributors)
