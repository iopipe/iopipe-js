IOpipe Agent & Tracing Plugin
-----------------------------

[![npm version](https://badge.fury.io/js/@iopipe/iopipe.svg)](https://badge.fury.io/js/@iopipe/iopipe)
[![Slack](https://img.shields.io/badge/chat-slack-ff69b4.svg)](https://iopipe-community.slack.com/)

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

By default this package will enable the tracing plugin. For more information on how to use Iopipe and the tracing plugin, see the documentation below:
- [IOpipe Documentation](https://github.com/iopipe/iopipe-js-core#readme)
- [IOpipe Tracing Plugin Documentation](https://github.com/iopipe/iopipe-plugin-trace#readme)

# License

Apache 2.0
