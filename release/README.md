# Package distribution policy

This directory records the package-distribution contract that must be satisfied before `@m3-ui/ui` or `@m3-ui/tokens` can be published. The machine-readable source is [`package-policy.json`](./package-policy.json); `pnpm test:package-policy` enforces the currently locked boundaries.

The repository is in **pre-publication** state. Both packages remain `private: true`, use `0.0.0` only as an unreleased workspace placeholder, and have no registry/access configuration or publish command. The package-consumer smoke validates tarballs without granting publication authority.

## Metadata classification

| Field | Status | Decision |
| --- | --- | --- |
| `name` | ready | Keep `@m3-ui/ui` and `@m3-ui/tokens`. |
| `description` | ready | Package-specific descriptions are checked into each manifest. |
| `repository` | ready | Both packages point at this GitHub repository with their package directory. |
| `homepage` | ready | Repository README is the current project homepage. |
| `bugs` | ready | GitHub Issues is the issue tracker. |
| `keywords` | ready | Package-specific discovery keywords are present. |
| `files`, `exports`, `main`, `module`, `types`, `sideEffects` | ready | Existing package surface is retained and validated by the packed-consumer gate. |
| `license` | **blocked** | No root `LICENSE` exists and no legal license has been selected. A maintainer must choose the license before publication. Do not infer one from dependencies or upstream Material projects. |
| `engines` | **blocked** | CI proves Node 22 for repository tooling, but no minimum consumer-toolchain Node floor has been selected or compatibility-matrix tested. |
| `author` / `contributors` | intentionally omitted | Git history provides attribution; no package-level legal author identity has been designated. |
| `funding` | intentionally omitted | No funding endpoint or policy is present. |
| `publishConfig` | intentionally omitted while private | Registry and access policy remain blocked on explicit publication authorization. |
| npm scope ownership | **blocked** | Public registry lookup on 2026-09-10 returned 404 for both package names, but that does not prove control of the `@m3-ui` scope. Maintainer evidence of scope ownership is required before publication. |

## Package ownership and versioning

`@m3-ui/tokens` owns canonical/generated Material design data and public token/CSS adapters. `@m3-ui/ui` owns React components, theme/runtime behavior, layout APIs, and public UI CSS. UI depends on tokens; tokens must not depend on UI.

The two packages use **lockstep versions**. Source keeps `@m3-ui/ui -> @m3-ui/tokens` as `workspace:*`; pnpm converts that workspace protocol to the exact current tokens version in a packed artifact. The packed-consumer gate verifies that conversion. This avoids a UI release being paired with an unreviewed token artifact.

`0.0.0` is not a proposed first public version. The first registry version is a named maintainer decision and must be recorded in `package-policy.json` before any release workflow can cross the publication boundary.

After a first version is selected, releases follow Semantic Versioning 2.0.0. The public API includes exported JavaScript/TypeScript symbols, package export paths, documented component behavior, public CSS entrypoints, and public token/CSS custom-property identifiers. Incompatible changes to those contracts are breaking; backward-compatible additions are features; compatible fixes are patches. If the maintainer chooses a `0.y.z` initial series, breaking changes must still be called out explicitly in change records even though SemVer treats major-zero as initial development.

## Change records

**Changesets** is the selected change-record/versioning mechanism and is now configured for dry-run planning. Release-affecting PRs can use `pnpm changeset` to declare the affected package(s), bump class, and user-facing summary. The command pins Changesets 3.0.2 through `pnpm dlx`, so release planning does not require adding release-only tooling to the workspace lockfile. The fixed group keeps UI and tokens on one coordinated version while docs and Storybook remain outside the active release set. The dry-run reads this plan but does not apply version changes to the working tree.

## Consumer and toolchain contract

The supported runtime shape is **browser-oriented ESM through a CSS-aware bundler**. `@m3-ui/ui` has CSS side-effect imports and is not promising direct execution by Node's native ESM loader. Framework SSR is supported only insofar as the framework/bundler processes the package's ESM and CSS contract.

React and React DOM `^19.0.0` remain UI peer dependencies. TypeScript consumers are validated with `moduleResolution: "Bundler"`. Packed artifacts are package-manager agnostic: the external-consumer smoke installs them with npm and verifies that no `workspace:` protocol leaks into consumer-visible manifests.

Repository development and CI are verified on **Node 22** with **pnpm 10.0.0**. Those are development/release-toolchain facts, not a claim that Node 22 is the minimum version every consumer must run. A maintainer must select the minimum consumer-toolchain Node floor before an `engines` field is added.

## Publication boundary

Current visibility policy is private-until-authorized. `private: true` is a hard safety control and npm refuses publication while it is set. No registry credentials, `publishConfig`, npm access level, release tag, or publish command may be added merely to make readiness CI pass.

Run `pnpm release:dry-run` for the deterministic release gate. It runs the package-policy guard, reads the Changesets release plan, builds and packs the real package tarballs, installs those exact tarballs into the external consumer, verifies bundling and TypeScript declarations, records SHA-256 hashes, and reports every unresolved publication blocker. npm/GitHub authentication variables are removed from the child environment and temporary empty npm user/global configs are used so the gate cannot depend on registry credentials.

The same command is available through the manual **Release dry run** GitHub Actions workflow. That workflow has `contents: read` permission only and uploads only the generated validation report. Normal CI preserves the existing policy and packed-consumer gates and additionally runs the same release dry-run.

There is intentionally no publish workflow. Crossing the boundary requires a separate repository change after explicit maintainer authorization that resolves the legal license, first public version, minimum consumer Node support, npm scope ownership, registry and access policy, and then changes the machine-readable publication policy. Merely having a green dry-run is not publication authorization. Parent issue #342 remains open until its children are complete and explicit closure authorization is given.

## Normative packaging references

- npm `package.json` documentation: <https://docs.npmjs.com/files/package.json/>
- pnpm workspace protocol and packed dependency conversion: <https://pnpm.io/workspaces>
- Semantic Versioning 2.0.0: <https://semver.org/>

These references define packaging/versioning mechanics only; they do not select this project's legal license, first public version, npm scope ownership, or publication authorization.
