# Evidence and provenance

Start with [release verification](../../docs/RELEASE_VERIFICATION.md) for the current
repository release. [LOCAL_FINAL_READINESS.md](LOCAL_FINAL_READINESS.md) and
[PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) retain dated earlier acceptance
results. They are historical measurements, not proof of a later rerun.

[data-provenance.md](data-provenance.md), [DATA_COMPLETION_REPORT.md](DATA_COMPLETION_REPORT.md)
and [COMPLETION_RESEARCH.md](COMPLETION_RESEARCH.md) preserve sources and explicit
unknowns. The `production-source-baseline.json`, `local-profile-before.json` and
other source fixtures support reproducible visual/source comparisons.

Large browser payload traces, PNG screenshots and raw text logs are intentionally
untracked. File names in old narratives may refer to these local-only artifacts;
run the documented tests to regenerate current evidence. Compact final gate
summaries are retained in `production/`. Private database archives never belong here.
