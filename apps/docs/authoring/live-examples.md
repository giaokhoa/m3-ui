# Live example authoring

Public MDX pages can render a curated example together with source that is generated from the exact TSX component used for the preview.

## Add an example

1. Add a named function component to `src/liveExamples.tsx`.
2. Add that function to `liveExampleRegistry` under a stable string id.
3. Use only public `@m3-ui/ui` APIs in consumer-facing examples.
4. Run `pnpm --filter @m3-ui/docs examples:generate` locally when inspecting generated output. Dev, build, test, and typecheck run it automatically.

The generator parses the registered function declaration with TypeScript and emits its relevant imports plus the same function source to `src/generated/live-examples.generated.json`. Do not maintain a second handwritten code snippet for a registered example. If the rendered TSX changes, generated source changes with it.

Keep registered examples as named function declarations. The generator rejects missing components or unsupported registry entries instead of guessing.

## Use from MDX

Content MDX must not import `src/liveExample.tsx` or `src/liveExamples.tsx` directly. `LiveExample` is registered through the shared MDX runtime map:

```mdx
<LiveExample example="button-basic" />
```

The source reveal is available by default. To start with source expanded in a fixture or a page where code should be immediately visible:

```mdx
<LiveExample example="button-basic" sourceInitiallyOpen />
```

Set `showSource={false}` only when a rendered preview intentionally should not expose source. Component guides should normally keep source available so the canonical example is copyable.

## Copy interaction

The runtime copy action uses the browser Clipboard API. Status feedback is exposed through a polite `role="status"` live region, and the source reveal button exposes `aria-expanded`/`aria-controls`. Visible reveal/copy controls use public m3-ui buttons.

## Scope

Live examples are curated documentation examples, not a Storybook control matrix. Keep exhaustive state/variant combinations in Storybook and use `LiveExample` for the small set of developer-facing examples that should remain directly copyable.
