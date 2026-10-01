// Full isolated suite using the generated local credentials, not a developer DB.
import {localEnvironment,localArgs,localRoot,localCompose} from './local-stack.js';
import {run,npm,waitFor} from './run.js';
const env={...localEnvironment(),PG_TEST_PORT:process.env.LOCAL_TEST_DB_PORT??'55434'};
if(!/^\d{4,5}$/.test(env.PG_TEST_PORT))throw new Error('Invalid LOCAL_TEST_DB_PORT');
const url=new URL(env.DATABASE_ADMIN_URL);url.hostname='localhost';url.port=env.PG_TEST_PORT;
try{
 await run('docker',[...localArgs,'-f','compose.staging.yml','up','-d','postgres'],{env,cwd:localRoot,name:'local-full-suite-db-access'});
 await waitFor(env.CORS_ORIGIN+'/ready');
 await npm(['run','test:all'],{env:{...env,DATABASE_URL:url.href},cwd:localRoot,name:'local-full-suite'});
}catch(error){console.error(error.message);process.exitCode=1;}
finally{
 // Recreate only PostgreSQL with the original PRIVATE network configuration.
 await localCompose(['up','-d','postgres'],'local-full-suite-db-private',env);
 await waitFor(env.CORS_ORIGIN+'/ready');
}
