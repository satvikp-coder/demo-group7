import assert from 'node:assert/strict';
import {test} from 'node:test';
import {passwordPolicyIssues, validateRegistrationName, validateRegistrationPassword} from '../../frontend/src/utils/passwordPolicy';
import {registerBody} from '../../backend/middleware/validationSchemas.js';

const samples = [
  '', 'testpass123', 'Short1!', 'alllowercase1!x', 'ALLUPPERCASE1!XX', 'NoDigitsHere!!ab', 'NoSymbols1234Ab',
  'Strong!Pass9xyz', 'Another#Valid1pw', 'has space Aa1!xyz', 'ÅÄÖ-Unicode-1aB!xyz', 'Aa1!' + 'x'.repeat(80),
  'Aa1!' + 'é'.repeat(35),
];

test('client password rules agree with the backend registration schema', () => {
  for (const password of samples) {
    const server = registerBody.safeParse({name: 'Tester', email: 'tester@example.com', password}).success;
    const client = validateRegistrationPassword(password) === '';
    assert.equal(client, server, `disagreement for ${JSON.stringify(password.slice(0, 20))}: client=${client} server=${server}`);
  }
});

test('weak passwords name every missing requirement', () => {
  assert.match(validateRegistrationPassword('testpass123'), /at least 12 characters/);
  assert.match(validateRegistrationPassword('testpass123'), /an uppercase letter/);
  assert.match(validateRegistrationPassword('testpass123'), /a symbol/);
  assert.doesNotMatch(validateRegistrationPassword('testpass123'), /a number|a lowercase/);
  assert.deepEqual(passwordPolicyIssues('Strong!Pass9xyz'), []);
});

test('a blank password and a blank name are reported as required', () => {
  assert.match(validateRegistrationPassword(''), /required/i);
  assert.match(validateRegistrationName('   '), /required/i);
  assert.equal(validateRegistrationName('Asha Patel'), '');
});
