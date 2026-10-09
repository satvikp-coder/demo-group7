import {generateDijkstraSteps} from '../src/components/DijkstraVisualizer';
import {writeFileSync} from 'node:fs';
const nodes=[{id:'hotel',name:'Fixture hotel',shortName:'H',x:100,y:100},{id:'site',name:'Fixture site',shortName:'S',x:200,y:100}];
const edges=[{from:'hotel',to:'site',distanceKm:1},{from:'site',to:'hotel',distanceKm:9}];
const reverse=generateDijkstraSteps('site','hotel',nodes,edges).at(-1)!;
const absent=generateDijkstraSteps('site','hotel',nodes,[]).at(-1)!;
const result={expectedReverseKm:9,actualReverseKm:reverse.finalDistance,missingRouteDistance:absent.finalDistance,missingRouteDescription:absent.description,syntheticUnitFixturesOnly:true};
writeFileSync(new URL('../../reports/visualizer-before.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
