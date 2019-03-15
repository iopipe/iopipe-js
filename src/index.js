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

  const { IOPIPE_HANDLER, LAMBDA_TASK_ROOT = '.' } = process.env;

  if (!IOPIPE_HANDLER) {
    throw new Error('No IOPIPE_HANDLER environment variable set.');
  }

  const parts = IOPIPE_HANDLER.split('.');

  if (parts.length !== 2) {
    throw new Error(
      `Improperly formatted IOPIPE_HANDLER environment variable: ${IOPIPE_HANDLER}`
    );
  }

  const [moduleToImport, handlerToWrap] = parts;

  let importedModule;

  try {
    /*eslint-disable import/no-dynamic-require*/
    importedModule = require(`${LAMBDA_TASK_ROOT}/${moduleToImport}`);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error(`Unable to import module '${moduleToImport}'`);
    }

    throw e;
  }

  const userHandler = importedModule[handlerToWrap];

  if (typeof userHandler === 'undefined') {
    throw new Error(
      `Handler '${handlerToWrap}' missing on module '${moduleToImport}'`
    );
  }

  if (typeof userHandler !== 'function') {
    throw new Error(
      `Handler '${handlerToWrap}' from '${moduleToImport}' is not a function`
    );
  }

  return iopipe(userHandler);
}

module.exports.handler = function handler(event, context, callback) {
  if (!wrappedHandler) {
    wrappedHandler = wrapHandler();
  }

  return wrappedHandler.call(this, event, context, callback);
};
