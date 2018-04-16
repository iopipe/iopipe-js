IOpipe Agent & Tracing Plugin
-----------------------------

[![npm version](https://badge.fury.io/js/%40iopipe%2Fiopipe.svg)](https://badge.fury.io/js/%40iopipe%2Fiopipe)
[![Slack](https://img.shields.io/badge/chat-slack-ff69b4.svg)](https://iopipe.now.sh/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

This package provides the IOpipe agent and the tracing plugin pre-bundled.

# Installation & usage

Install via npm:

```bash
npm install --save @iopipe/iopipe
```

Or via yarn:

```bash
yarn add @iopipe/iopipe
```

Then require this module, passing it an object with your project token ([register for access](https://www.iopipe.com)), and it will automatically monitor and collect metrics from your applications running on AWS Lambda.

If you are using the Serverless Framework to deploy your lambdas, check out our [serverless plugin](https://github.com/iopipe/serverless-plugin-iopipe).

Example:

```js
const iopipe = require('@iopipe/iopipe')({ token: 'PROJECT_TOKEN' });

exports.handler = iopipe((event, context) => {
  context.succeed('This is my serverless function!');
});
```

By default this package will enable @iopipe/trace and @iopipe/event-info plugins. For more information on how to use IOpipe and these plugins, see the documentation below:
- [IOpipe Documentation](https://github.com/iopipe/iopipe-js-core#readme)
- [IOpipe Tracing Plugin Documentation](https://github.com/iopipe/iopipe-plugin-trace#readme)

Example With Tracing, Custom Metrics, and Labels (ES6 Module Format):

```js
import iopipe, {mark, metric, label} from '@iopipe/iopipe';

exports.handler = iopipe()(async (event, context) => {
  // add a trace measurement for the database call
  mark.start('db-call');
  // fetch some data from the database
  const rows = await sql(`select * from dogs where status = 'goodboy'`);
  mark.end('db-call');

  // add a custom metric for IOpipe search and alerts
  metric('rows-from-db', rows.length);

  // add a label to this invocation for easy filter/sort on dashboard.iopipe.com
  label('used-db-cache');

  context.succeed('This is my serverless function!');
});
```

# License

Apache 2.0
