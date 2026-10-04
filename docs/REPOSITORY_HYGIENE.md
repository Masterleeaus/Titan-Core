# Repository hygiene and provenance

This boundary records the remaining cleanup decisions visible in the default branch. It is evidence for a reviewer, not a claim that the repository is a standalone production application.

Run the dependency-free evaluator from the repository root:

```bash
node scripts/check-repository-hygiene.mjs
```

The expected result is:

```
repository hygiene check: 2 approved case collisions; 1 retained binary artifacts; no unexpected metadata
```

## Approved case collisions

`KBHealthService.php` and `KBPublishService.php` are deprecated backwards-compatible aliases for the canonical `KbHealthService.php` and `KbPublishService.php` implementations. Current internal search results use the canonical class names; the aliases remain because their public compatibility contract is not proven safe to remove.

They are explicitly inventory-boundary material, not a second active implementation. Before retiring them, test downstream host applications and either move the compatibility classes through a verified classmap-safe path or obtain an intentional breaking-change decision.

## Retained binary artifact

`TitanCore_V1.9/Blueprints/AIControlledModuleBlueprint_PASS17/Titan_AI_Controlled_Module_Blueprint_UI_Added_PASS17.zip` is retained as lineage material. It is recorded in `TitanCore_V1.9/MANIFEST.sha256`, but no runtime import was established. Do not present it as an active dependency. Remove or move it only after provenance, license/attribution, and reachability are documented.

## Scope

The evaluator fails on any new case collision, stale inventory entry, tracked `.DS_Store`/`Thumbs.db`, or missing retained artifact. It does not claim that the aliases or archive are production-ready; it makes the unresolved decisions explicit and reviewable.
