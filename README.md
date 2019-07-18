IOpipe Agent & Bundled Plugins
-----------------------------

[![npm version](https://badge.fury.io/js/%40iopipe%2Fiopipe.svg)](https://badge.fury.io/js/%40iopipe%2Fiopipe)
[![Slack](https://img.shields.io/badge/chat-slack-ff69b4.svg)](https://iopipe.now.sh/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

This package provides the IOpipe agent and plugins pre-bundled.

# Installation & usage

Install via npm:

```bash
npm install --save @iopipe/iopipe
```

Or via yarn:

```bash
yarn add @iopipe/iopipe
```

Then require this module, passing it an object with your project token ([get a free account](https://www.iopipe.com)), and it will automatically monitor and collect metrics from your applications running on AWS Lambda.

If you are using the Serverless Framework to deploy your lambdas, check out our [serverless plugin](https://github.com/iopipe/serverless-iopipe-layers).

Example:

```js
const iopipe = require('@iopipe/iopipe')({ token: 'PROJECT_TOKEN' });

exports.handler = iopipe((event, context) => {
  context.succeed('This is my serverless function!');
});
```

By default this package will enable `@iopipe/trace` and `@iopipe/event-info` plugins. It also includes the `@iopipe/profiler` plugin, which is disabled by default. For more information on how to use IOpipe and these plugins, see the documentation below:

- [IOpipe Documentation](https://github.com/iopipe/iopipe-js-core#readme)
- [IOpipe Tracing Plugin Documentation](https://github.com/iopipe/iopipe-plugin-trace#readme)
- [IOpipe Event Info Plugin Documentation](https://github.com/iopipe/iopipe-js-event-info#readme)
- [IOpipe Profiler Plugin Documentation](https://github.com/iopipe/iopipe-plugin-profiler#readme)

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

# Lambda Layers

IOpipe publishes [AWS Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) which are publicly available on AWS. Using a framework that supports lambda layers (such as SAM or Serverless), you can use the following ARNs for your runtime:

* nodejs10.x: `arn:aws:lambda:$REGION:146318645305:layer:IOpipeNodeJS10:$VERSION_NUMBER`
* nodejs8.10: `arn:aws:lambda:$REGION:146318645305:layer:IOpipeNodeJS810:$VERSION_NUMBER`

Where `$REGION` is your AWS region and `$VERSION_NUMBER` is an integer representing the IOpipe release. You can get the version number via the [Releases](https://github.com/iopipe/iopipe-js/releases) page.

Then in your SAM template (for example), you can add:

```yaml
Globals:
  Function:
    Layers:
        - arn:aws:lambda:us-east-1:146318645305:layer:IOpipeNodeJS810:1
```

And the IOpipe library will be included in your function automatically.

You can also wrap your IOpipe functions without a code change using layers. For example, in your SAM template you can do the following:

```yaml
Resources:
  YourFunctionHere:
    Type: 'AWS::Serverless::Function'
    Properties:
      CodeUri: path/to/your/code
      # Automatically wraps the handler with IOpipe
      Handler: @iopipe/iopipe.handler
      Runtime: nodejs8.10
      Environment:
        Variables:
          # Specifies which handler IOpipe should run
          IOPIPE_HANDLER: path/to/your.handler
```

Or with the Serverless framework:

```yaml
functions:
  your-function-here:
    environment:
        IOPIPE_HANDLER: path/to/your.handler
    handler: @iopipe/iopipe.handler
    layers:
      - arn:aws:lambda:us-east-1:146318645305:layer:IOpipeNodeJS810:1
    runtime: nodejs8.10
```
# Troubleshooting

## Lambda layers: ```Lambda can't find the file @iopipe/iopipe.js```

If you're seeing this error, it's likely that the node runtime isn't resolving ```NPM_PATH``` for the ```@iopipe/iopipe``` module in ```/opt/nodejs/node_modules```.

These steps should fix the problem:  
1. Create an ```iopipe_wrapper.js``` script in your project's root.
2. The script's contents should be ```module.exports = require('@iopipe/iopipe');```. (And that's all that needs to be in it.)
3. Update the handler for your layer declaration to ```iopipe_wrapper.handler```.

# License

Apache 2.0
