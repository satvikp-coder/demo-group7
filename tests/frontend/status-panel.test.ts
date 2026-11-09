import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {StatusPanel} from '../../frontend/src/components/StatusPanel';

const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const html = (props: Record<string, unknown>) => renderToStaticMarkup(React.createElement(StatusPanel, props));

test('an error panel is an alert with one h1, the message and its action buttons', () => {
  const out = html({kind: 'error', title: 'Budget Planner', message: 'Generate a trip first.', actions: [{label: 'Retry', onClick() {}}, {label: 'Open planner', onClick() {}, primary: true}]});
  assert.match(out, /role="alert"/);
  assert.equal((out.match(/<h1/g) ?? []).length, 1);
  assert.match(out, />Budget Planner<\/h1>/);
  assert.match(out, /Generate a trip first\./);
  assert.match(out, />Retry<\/button>/);
  assert.match(out, />Open planner<\/button>/);
});

test('loading and empty panels are polite status regions without buttons unless given', () => {
  const loading = html({kind: 'loading', title: 'Your Itinerary', message: 'Loading persisted itinerary...'});
  assert.match(loading, /role="status"/);
  assert.match(loading, /animate-spin/);
  assert.doesNotMatch(loading, /<button/);
  const empty = html({kind: 'empty', title: 'Ranked Stays', message: 'No destinations available.'});
  assert.match(empty, /role="status"/);
  assert.doesNotMatch(empty, /animate-spin/);
});

test('the message is optional and nothing renders as "undefined"', () => {
  const out = html({kind: 'error', title: 'Something went wrong'});
  assert.doesNotMatch(out, /undefined|null/);
  assert.match(out, />Something went wrong<\/h1>/);
});
