# Phase 2 GitHub and deployment

Baseline and latest inspected origin/main:dad2a282f2e83ee2938cce7eac219883ad5b49a0.
Release branch:phase2/university-release. Original history is preserved; no force
push, merge or public deployment is authorized by this phase.

Local8080 now runs the rebuilt Phase2 production images and migration008. Additive
import installed8/44/43/12/322; original records and user survived full-stack restart.
Private backup restored exactly into a separate database. Existing persistent volume
and credentials are preserved. No production secrets, DNS or paid services changed.

Local full18/18, container16/16, expanded production-preview and professor-demo
checks pass. Workflow now also runs the Phase2 import/API/browser matrix and
Gujarati dictionary test, uploading evidence. Git attributes preserve all14 reviewed
frontend hashes after a fresh staged checkout. Source scan and private-value review
found no credentials or unapproved frontend changes in the curated release.

Publication checkpoint: feature branch/PR and its remote CI result are the remaining
release actions. This is not a claim that the new workflow has passed remotely.
The prior main workflow37985673390 succeeded; that result is historical only.

Existing public Vercel integrations previously failed. Local container verification
does not certify those services. Provider access/configuration and a separately
authorized deployment remain necessary; no hosting success is claimed.
