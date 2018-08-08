import _ from 'lodash';
import mockContext from 'aws-lambda-mock-context';

import iopipe from '.';

beforeEach(() => {
  delete process.env.IOPIPE_TOKEN;
});

test('lib warns correctly for getContext methods', () => {
  const { mark: { start, end }, metric, label } = iopipe;
  const messages = [
    start('test-mark'),
    end('try-mark'),
    metric('test-metric-key', 'test-metric-value'),
    label('great-label')
  ];
  expect(messages).toMatchSnapshot();
});

describe('iopipe kitchen sink', () => {
  it('has trace and event info plugins pre-bundled', done => {
    let invocation;
    iopipe({
      clientId: 'foobar',
      plugins: [inv => (invocation = inv) && { meta: { name: 'wow' } }]
    })((event, context) => {
      try {
        const { config } = context.iopipe;

        expect(invocation.plugins).toHaveLength(3);
        expect(invocation.plugins.map(p => p.meta.name)).toEqual([
          'wow',
          '@iopipe/trace',
          '@iopipe/event-info'
        ]);

        expect(_.isFunction(config.plugins[0])).toBe(true);

        expect(_.isFunction(context.iopipe.mark.start)).toBe(true);

        done();
      } catch (err) {
        console.log(err); // eslint-disable-line
      }
    })({}, {});
  });
});

test('lib has mark, metric, label methods', async () => {
  const ctx = mockContext({ functionName: 'mark' });
  let invocation;

  iopipe({ token: 'trace', plugins: [inv => (invocation = inv)] })((e, c) => {
    const { mark: { start, end }, metric, label } = iopipe;
    start('trace-test');
    metric('foobar', 100);
    label('animals');
    label('cats');
    setTimeout(() => {
      end('trace-test');
      c.succeed(200);
    }, 101);
  })({}, ctx);

  const val = await ctx.Promise;
  expect(val).toBe(200);

  const {
    performanceEntries,
    labels,
    custom_metrics: metrics
  } = invocation.report.report;

  expect(_.map(performanceEntries, 'name')).toEqual([
    'start:trace-test',
    'measure:trace-test',
    'end:trace-test'
  ]);
  expect(performanceEntries[1].duration).toBeGreaterThan(101);
  expect(metrics).toEqual([{ name: 'foobar', n: 100, s: undefined }]);
  expect(labels).toEqual([
    '@iopipe/metrics',
    'animals',
    'cats',
    '@iopipe/plugin-trace'
  ]);
});
