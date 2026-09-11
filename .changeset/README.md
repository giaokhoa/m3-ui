# Changesets

Changesets records release-affecting package changes for the lockstep `@m3-ui/ui` + `@m3-ui/tokens` release policy.

Use `pnpm changeset` to create a change record when a pull request changes a future public package contract. The command pins Changesets 3.0.2 through `pnpm dlx`. The dry-run reads the resulting release plan but does not apply versions to the working tree and does not publish anything.

The first public version is still a maintainer decision. Do not use Changesets to infer that version from the current `0.0.0` workspace placeholder.

The private docs and Storybook applications are ignored by release planning; they may consume UI in the workspace but are not distribution packages. The configured access mode is deliberately `restricted` while package publication remains disabled. Public npm access, scope ownership, license, minimum consumer Node, first public version and registry authorization must be resolved explicitly before any publish workflow is introduced.
