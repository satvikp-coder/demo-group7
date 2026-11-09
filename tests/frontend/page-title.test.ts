import assert from 'node:assert/strict';
import {test} from 'node:test';
import {HOME_TITLE, titleForRoute} from '../../frontend/src/utils/pageTitle';

const types = ['home', 'explore', 'destination', 'hotels', 'budget', 'itinerary', 'profile', 'admin', 'auth', 'research', 'not-found'] as const;

test('every page type gets its own title, including sign-in and create-account separately', () => {
  const titles = [...types.map(type => titleForRoute({type})), titleForRoute({type: 'auth', authMode: 'register'})];
  assert.equal(new Set(titles).size, titles.length);
  for (const title of titles) assert.ok(title.includes('Heritage Tourism Planner'), title);
});

test('home keeps the original title and other pages name themselves first', () => {
  assert.equal(titleForRoute({type: 'home'}), HOME_TITLE);
  assert.match(titleForRoute({type: 'hotels'}), /^Ranked Stays · /);
  assert.match(titleForRoute({type: 'auth', authMode: 'register'}), /^Create Account · /);
  assert.match(titleForRoute({type: 'auth', authMode: 'login'}), /^Sign In · /);
  assert.match(titleForRoute({type: 'not-found'}), /^Page Not Found · /);
});

test('an unknown route type falls back to the home title instead of "undefined"', () => {
  assert.equal(titleForRoute({type: 'something-new' as never}), HOME_TITLE);
});
