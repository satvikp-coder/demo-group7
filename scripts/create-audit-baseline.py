"""Recoverable source checkpoint, excluding secrets, user evidence and generated files."""
import hashlib,json,subprocess,zipfile
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'reports';OUT.mkdir(exist_ok=True)
backup=ROOT/('backups/full-audit-source-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'.zip')
files=subprocess.check_output(['rg','--files','--hidden','-g','!**/node_modules/**','-g','!**/dist/**','-g','!**/.git/**','-g','!backups/**','-g','!backend/reports/**','-g','!reports/**','-g','!**/__pycache__/**','-g','!**/.npm-cache/**','-g','!**/.npm/**','-g','!**/.cache/**'],cwd=ROOT,text=True).splitlines()
rows=[]
with zipfile.ZipFile(backup,'x',zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        f=ROOT/name
        if f.name.startswith('.env') and not f.name.endswith('.example'):continue
        if f.suffix in ['.dump','.backup','.log','.zip','.pyc','.txt','.png'] and 'frontend/public' not in f.as_posix():continue
        if '.cache' in f.as_posix() or f.name in ['.routing-cache.json','.translation-cache.json']:continue
        archive.write(f,str(f.relative_to(ROOT)));rows.append({'path':str(f.relative_to(ROOT)).replace('\\','/'),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size})
with zipfile.ZipFile(backup) as archive:
    assert archive.testzip() is None
    assert len(archive.namelist())==len(rows)
    for row in rows:assert hashlib.sha256(archive.read(row['path'])).hexdigest()==row['sha256']
report={'createdAt':datetime.now(timezone.utc).isoformat(),'gitAvailable':False,'checkpoint':'backups/'+backup.name,'archiveBytes':backup.stat().st_size,'files':rows,'verified':True,'notes':'Existing private environments and live database retained separately; no Git repository initialized.'}
(OUT/'BASELINE_SOURCE.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('Verified recoverable source checkpoint:',len(rows),'files;',backup.stat().st_size,'bytes. Private environment values excluded.')
