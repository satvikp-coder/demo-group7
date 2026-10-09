// Synthetic unit comparison: API schema accepts zero and nullable ratings.
import {scoreAttraction} from '../../dsa/greedy/routeBuilder.ts';
import {writeFileSync} from 'node:fs';
const score=rating=>scoreAttraction({entryFeeNumeric:0,rating,lat:23,lng:72},{lat:23,lng:72},1000,'rating-first',()=>1);
const result={zero:score(0),knownFour:score(4),unknown:score(undefined),zeroIncorrectlyAboveFour:score(0)>score(4),unknownIncorrectlyAboveFour:score(undefined)>score(4),databaseWrites:false};
writeFileSync(new URL('../../reports/rating-order-before.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
