import test from 'node:test';
import assert from 'node:assert/strict';
import {TRANSLATIONS} from '../../frontend/src/data/translations.ts';
test('Gujarati covers every existing dictionary key while English and Hindi remain available',()=>{
 assert.deepEqual(Object.keys(TRANSLATIONS.gu).sort(),Object.keys(TRANSLATIONS.en).sort());
 assert.ok(TRANSLATIONS.hi['nav.planItinerary']);
 for(const value of Object.values(TRANSLATIONS.gu)){assert.ok(value.trim());assert.match(value,/[\u0A80-\u0AFF]/);}
});
