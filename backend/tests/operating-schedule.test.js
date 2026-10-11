import test from 'node:test';
import assert from 'node:assert/strict';
import {datedOperation} from '../services/operatingSchedule.js';
const attraction={slug:'devalia-bus-safari'};
test('verified Devalia calendar honors weekly closure, seasonal slots and weekend tariffs',()=>{
 assert.deepEqual(datedOperation(attraction,'2026-10-14',1,480,30),{closed:true});
 const saturday=datedOperation(attraction,'2026-10-10',1,481,30);assert.equal(saturday.arrival,510);assert.equal(saturday.fee,190);
 const weekday=datedOperation(attraction,'2026-10-12',1,700,30);assert.equal(weekday.arrival,900);assert.equal(weekday.fee,150);
 assert.equal(datedOperation(attraction,'2026-05-04',1,700,30).arrival,990);
 assert.deepEqual(datedOperation(attraction,'2026-10-12',3,480,30),{closed:true});
 assert.deepEqual(datedOperation(attraction,'2026-10-12',1,1010,30),{closed:true});
 assert.equal(datedOperation(attraction,null,1,480,30),null);
});
