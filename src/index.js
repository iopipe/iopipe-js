module.exports = require('@iopipe/core');

function warning(fn, ...args) {
  /*eslint-disable no-console*/
  const str = `${fn}(${args.join(
    ','
  )}) was called from @iopipe/iopipe but this method was not available. You may have called this method outside of an invocation or @iopipe/core needs to be upgraded to satisfy version ^1.11.0`;
  console.warn(str);
  return str;
  /*eslint-enable no-console*/
}

function ctx() {
  const context =
    (typeof module.exports.getContext === 'function' &&
      module.exports.getContext()) ||
    {};
  return (
    context.iopipe || {
      mark: {
        start: warning.bind(null, 'mark.start'),
        end: warning.bind(null, 'mark.end')
      },
      metric: warning.bind(null, 'metric'),
      label: warning.bind(null, 'label')
    }
  );
}

module.exports.mark = {
  start: (...args) => ctx().mark.start(...args),
  end: (...args) => ctx().mark.end(...args)
};

module.exports.metric = (...args) => ctx().metric(...args);
module.exports.label = (...args) => ctx().label(...args);

let wrappedHandler;

function wrapHandler() {
  const iopipe = require('@iopipe/core')();

  const { LAMBDA_TASK_ROOT = '.' } = process.env;

  if (!process.env.IOPIPE_HANDLER) {
    throw new Error('No IOPIPE_HANDLER environment variable set.');
  }

  if (process.env.IOPIPE_HANDLER.indexOf('.') === -1) {
    throw new Error(
      `Improperly formatted IOPIPE_HANDLER environment variable: ${
        process.env.IOPIPE_HANDLER
      }`
    );
  }

  const [moduleToImport, handlerToWrap] = process.env.IOPIPE_HANDLER.split(
    '.',
    1
  );

  /*eslint-disable import/no-dynamic-require*/
  const importedModule = require(`${LAMBDA_TASK_ROOT}/${moduleToImport}`);

  return iopipe(importedModule[handlerToWrap]);
}

module.exports.handler = (event, context, callback) => {
  if (!wrappedHandler) {
    wrappedHandler = wrapHandler();
  }

  return wrappedHandler(event, context, callback);
};
