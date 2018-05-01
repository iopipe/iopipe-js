const _ = require('lodash');
const iopipe = require('./index');

describe('iopipe kitchen sink', () => {
  beforeEach(() => {
    delete process.env.IOPIPE_TOKEN;
  });

  it('has trace and event info plugins pre-bundled', done => {
    iopipe({ clientId: 'foobar' })((event, context) => {
      try {
        const { config } = context.iopipe;

        expect(config.extends).toBe('@iopipe/config');

        expect(config.plugins).toHaveLength(2);

        expect(_.isFunction(config.plugins[0])).toBe(true);

        expect(_.isFunction(context.iopipe.mark.start)).toBe(true);

        done();
      } catch (err) {
        console.log(err); // eslint-disable-line
      }
    })({}, {});
  });
});
