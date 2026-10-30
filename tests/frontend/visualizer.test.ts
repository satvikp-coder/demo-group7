import assert from 'node:assert/strict';
import {test} from 'node:test';
import {generateDijkstraSteps,getIntraCityGraph} from '../../frontend/src/components/DijkstraVisualizer';
const nodes=[{id:'hotel',name:'Hotel',shortName:'H',x:100,y:100},{id:'site',name:'Site',shortName:'S',x:200,y:100}];
test('saved directional legs retain distinct return distance',()=>{
 const step=generateDijkstraSteps('site','hotel',nodes,[{from:'hotel',to:'site',distanceKm:1},{from:'site',to:'hotel',distanceKm:9}]).at(-1)!;
 assert.equal(step.finalDistance,9); assert.deepEqual(step.finalPath,['site','hotel']);
});
test('an absent return route is explicitly unreachable',()=>{
 const step=generateDijkstraSteps('site','hotel',nodes,[{from:'hotel',to:'site',distanceKm:1}]).at(-1)!;
 assert.ok(Number.isNaN(step.finalDistance)); assert.deepEqual(step.finalPath,[]); assert.match(step.description,/no saved route/i);
});

test('colliding attraction labels use full names while distinct labels stay short',()=>{
 const stops=[
  {reference_id:'temple',name:'Somnath Temple'},
  {reference_id:'beach',name:'Somnath Beach'},
  {reference_id:'hotel',name:'Premier Somnath'},
 ];
 const graph=getIntraCityGraph({days:[{stops:[...stops,stops[2]]}]});
 assert.deepEqual(graph.nodes.map(n=>n.shortName),['Somnath Temple','Somnath Beach','Premier']);
 assert.deepEqual(graph.nodes.map(n=>n.name),stops.map(s=>s.name));
 assert.equal(graph.nodes.length,3);
});
