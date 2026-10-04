# Portfolio engineering guide

## Problem and architecture

Titancore is a versioned Laravel/nWidart platform-kernel snapshot. Its engineering focus is shared AI infrastructure and module integration rather than a customer-facing product.

The implementation lives under `TitanCore_V1.9/`:

- `AI/` — orchestrator pipeline, provider adapters, tool executor, permission gate, vector-store contracts, and value objects.
- `Services/` — model gateway, provider failover, AI run logging, settings, and agent-contract services.
- `TitanSDK/` — stable public contracts, events, exceptions, facades, and manifests intended for consuming modules.
- `Providers/`, `Routes/`, `Http/`, `Database/`, `Jobs/` — Laravel integration, persistence, APIs, and background work.
- `Docs/` — testing instructions, OpenAPI/starter-kit material, scan reports, and the runtime verification audit.
- `module.json` and `composer.json` — nWidart metadata, providers, PHP/Laravel requirements, and package autoloading.

The central AI pipeline in `AI/AIOrchestratorPipeline.php` is ordered as guardrail → retrieval → tool execution → citation. `Services/ProviderFailoverChain.php` provides ordered chat/embedding fallback for configured retryable failures. `TitanSDK/README.md` documents the intended boundary: consumers use public contracts; runtime/provider/controller implementation remains in TitanCore.

## Why it is useful

This is a good platform-engineering study in:

- contract extraction and backward-compatible namespace mapping;
- manifest-backed tools and capability discovery;
- permission/allowlist/input-validation boundaries;
- provider adapters, failover, health checks, and run logging;
- module health/repair conventions and Laravel integration.

It should not be presented as a single unified AI authority. The tracked [runtime verification audit](../Docs/TitanCore_Runtime_Verification_Audit_Pass12.md) found direct AI paths that bypass the central model gateway and identified a missing `KnowledgeSyncService.php` → `EmbeddingService::ingestDocumentFromRaw()` call. Its overall conclusion is “not production-ready as a single runtime authority.”

## Quickstart

The checked-in [testing guide](../TitanCore_V1.9/Docs/TESTING.md) requires a host Laravel application:

```text
1. Place the module under Modules/TitanCore.
2. Install dev dependencies in the host application.
3. Set AI_BINDING_MODE=stub for tests.
4. Run php artisan test --testsuite=Unit
5. Run php artisan test --testsuite=Feature
6. Optionally seed with php artisan module:seed TitanCore
```

The archive is not a complete standalone app. These commands were inspected from the repository documentation and were not run in this task.

## Repository hygiene

See [REPOSITORY_HYGIENE.md](REPOSITORY_HYGIENE.md) and [repository-hygiene.json](repository-hygiene.json) for the evaluator, the two explicitly bounded deprecated alias collisions, and the retained blueprint archive. Run `node scripts/check-repository-hygiene.mjs` from the repository root; it fails on new collisions, stale inventory, or OS metadata.

## Evidence and limitations

- Unit tests include `TitanCoreAIServiceTest.php`, provider/adapter tests, manifest validation, tool executor, vector store, and legacy compatibility coverage.
- The runtime audit separates Implemented, Partially Implemented, and Not Verified behaviour; it records tool permission/allowlist/input validation and the ordered orchestrator as verified code paths, while universal routing, sandboxing, output validation, workflow rollback/cancellation, and performance remain unverified.
- Open draft PRs #45, #47, #49, and #51 were left untouched. Their files do not overlap this guide.
- The nested versioned source, starter kit, scan reports, and SDK were preserved for lineage. No archive or donor file was removed because safe retirement was not proven.
