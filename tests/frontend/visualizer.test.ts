import assert from 'node:assert/strict';
import {test} from 'node:test';
import {generateDijkstraSteps} from '../../frontend/src/components/DijkstraVisualizer';
const nodes=[{id:'hotel',name:'Hotel',shortName:'H',x:100,y:100},{id:'site',name:'Site',shortName:'S',x:200,y:100}];
test('saved directional legs retain distinct return distance',()=>{
 const step=generateDijkstraSteps('site','hotel',nodes,[{from:'hotel',to:'site',distanceKm:1},{from:'site',to:'hotel',distanceKm:9}]).at(-1)!;
 assert.equal(step.finalDistance,9); assert.deepEqual(step.finalPath,['site','hotel']);
});
test('an absent return route is explicitly unreachable',()=>{
 const step=generateDijkstraSteps('site','hotel',nodes,[{from:'hotel',to:'site',distanceKm:1}]).at(-1)!;
 assert.ok(Number.isNaN(step.finalDistance)); assert.deepEqual(step.finalPath,[]); assert.match(step.description,/no saved route/i);
});
