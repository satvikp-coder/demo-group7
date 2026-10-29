import assert from 'node:assert/strict';
import {test} from 'node:test';
import {checkBestTimeConflict} from '../../frontend/src/utils/bestTimeChecker';

// Real catalog note for Modhera Sun Temple: "sunrise to sunset" describes opening hours.
const modhera = "Stored hours follow Gujarat Tourism's visitor brochure. Other sources describe sunrise to sunset. Two hours is a published visitor-duration recommendation, not a fixed tour. General wheelchair access remains unverified; entrance amenities do not establish access to stepped areas.";
const times = ['06:00 AM', '08:30 AM', '10:00 AM', '12:00 PM', '01:30 PM', '03:00 PM', '05:00 PM'];

test('an opening-hours range ("sunrise to sunset") is not treated as a recommended visiting time', () => {
  for (const time of times) assert.equal(checkBestTimeConflict(time, modhera).hasConflict, false, time);
  for (const phrase of ['Open sunrise to sunset.', 'Open sunrise-sunset daily.', 'Open sunrise – sunset.', 'Open from sunrise until sunset.', 'Open sunrise and sunset daily.'])
    for (const time of times) assert.equal(checkBestTimeConflict(time, phrase).hasConflict, false, `${phrase} @ ${time}`);
});

test('genuine sunset and sunrise recommendations still warn', () => {
  assert.match(checkBestTimeConflict('09:00 AM', 'Visit around sunset. Road routing does not certify access.').warningMessage, /late afternoon or sunset/);
  assert.equal(checkBestTimeConflict('04:30 PM', 'Visit around sunset.').hasConflict, false);
  assert.match(checkBestTimeConflict('12:00 PM', 'Best at sunrise for soft light.').warningMessage, /early morning \/ sunrise/);
  assert.equal(checkBestTimeConflict('06:30 AM', 'Best at sunrise for soft light.').hasConflict, false);
});

test('a note that gives hours and also a real recommendation keeps the recommendation', () => {
  const note = 'Open sunrise to sunset. Best at sunset.';
  assert.equal(checkBestTimeConflict('09:00 AM', note).hasConflict, true);
  assert.equal(checkBestTimeConflict('04:30 PM', note).hasConflict, false);
});

test('the other existing rules are unchanged', () => {
  assert.equal(checkBestTimeConflict('12:00 PM', 'Avoid midday (11am-3pm).').hasConflict, true);
  assert.equal(checkBestTimeConflict('09:00 AM', 'Avoid midday (11am-3pm).').hasConflict, false);
  assert.equal(checkBestTimeConflict('09:00 AM', undefined).hasConflict, false);
  assert.equal(checkBestTimeConflict('', 'Best at sunset.').hasConflict, false);
});
