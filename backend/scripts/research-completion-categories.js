// Reviewable supplement for existing category filters; no prices/routes changed.
import {readFileSync,writeFileSync} from 'node:fs';
const entries=[
 ['ahmedabad','UNESCO World Heritage Site','https://whc.unesco.org/en/list/1551/','UNESCO lists the Historic City of Ahmadabad. Category refers to the historic-city visitor circuit, not every attraction or hotel in modern Ahmedabad.'],
 ['champaner','UNESCO World Heritage Site','https://whc.unesco.org/en/list/1101/','UNESCO lists Champaner-Pavagadh Archaeological Park, including the historic village. Category refers to that heritage visitor circuit, not the surrounding hotel properties.'],
 ['modhera','Heritage Sites','https://gujarattourism.com/north-zone/mehsana/sun-temple-modhera.html','Project primary category for the Modhera Sun Temple heritage circuit, supported by Gujarat Tourism monument history. Not an assertion of UNESCO inscription.'],
 ['somnath','Religious Sites','https://gujarattourism.com/saurashtra/gir-somnath/somnath-temple.html','Project primary category for the Somnath pilgrimage circuit, supported by Gujarat Tourism temple description.'],
 ['dwarka','Religious Sites','https://gujarattourism.com/saurashtra/devbhoomi-dwarka/dwarkadhish-temple.html','Project primary category for the Dwarka pilgrimage circuit, supported by Gujarat Tourism temple description.'],
];
for(const [city,category,url,notes] of entries){
 const file=new URL(`../../data/research/${city}.json`,import.meta.url);
 const batch=JSON.parse(readFileSync(file,'utf8'));
 const record={table:'destinations',key:city,values:{official_category:category},sources:[url],notes};
 if(batch.records.some(r=>r.key===city&&r.values.official_category))throw new Error('Category already recorded; review rather than overwrite');
 batch.records.push(record);writeFileSync(file,JSON.stringify(batch,null,2)+'\n');
}
writeFileSync(new URL('../../data/research/pages/completion-category-evidence.json',import.meta.url),JSON.stringify({checked:'2026-09-30',basis:'Official pages read in the completion audit; facts paraphrased, no copyrighted page reproduced',entries:entries.map(([city,category,url,notes])=>({city,category,url,notes}))},null,2)+'\n');
