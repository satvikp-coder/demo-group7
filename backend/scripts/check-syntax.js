import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
function check(dir) {
  for (const entry of readdirSync(dir,{withFileTypes:true})) {
    if (['node_modules','reports'].includes(entry.name)) continue;
    const path = dir+'/'+entry.name;
    if(entry.isDirectory()) check(path);
    else if(entry.name.endsWith('.js')) {
      const result = spawnSync(process.execPath,['--check',path],{stdio:'inherit'});
      if(result.status!==0) process.exit(1);
    }
  }
}
check('.');
console.log('Backend JavaScript syntax checks passed; shared TypeScript executes through tsx at production start.');
