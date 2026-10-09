// Isolated development verification ports; existing backend config/data are retained.
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const child=spawn(process.execPath,['--import','tsx','server.js'],{
  cwd:fileURLToPath(new URL('../backend/',import.meta.url)),
  env:{...process.env,PORT:'5310',CORS_ORIGIN:'http://localhost:4310'},
  stdio:'inherit',windowsHide:true,
});
child.on('exit',code=>{process.exitCode=code ?? 1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
