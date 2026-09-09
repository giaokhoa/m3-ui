import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Button,
  CircularProgressIndicator,
  CircularWavyProgressIndicator,
  ContainedLoadingIndicator,
  LinearProgressIndicator,
  LinearWavyProgressIndicator,
  LoadingIndicator,
  PlainTooltip,
  RichTooltip,
  RichTooltipTrigger,
  Snackbar,
  SnackbarAction,
  SnackbarDismissAction,
  ThemeProvider,
  TooltipTrigger,
} from './index';

function renderLane6(element: ReactElement) {
  return renderToString(
    <ThemeProvider mode="light" portalContainer={null}>
      {element}
    </ThemeProvider>,
  );
}

describe('Lane 6 feedback and status SSR contracts', () => {
  it('renders standard and wavy progress semantics without invalid geometry', () => {
    const html = renderLane6(
      <>
        <LinearProgressIndicator aria-label="Server linear progress" value={0.4} />
        <LinearProgressIndicator aria-label="Server linear loading" isIndeterminate />
        <CircularProgressIndicator aria-label="Server circular progress" value={0.6} />
        <LinearWavyProgressIndicator aria-label="Server wavy progress" value={0.5} />
        <CircularWavyProgressIndicator aria-label="Server wavy loading" isIndeterminate />
      </>,
    );

    expect(html.match(/role="progressbar"/g)?.length).toBe(5);
    expect(html).toContain('aria-valuenow="0.4"');
    expect(html).toContain('aria-valuenow="0.6"');
    expect(html).not.toContain('aria-valuenow="NaN"');
    expect(html).not.toContain('NaN');
  });

  it('keeps LoadingIndicator server output deterministic for determinate and indeterminate states', () => {
    const tree = (
      <>
        <LoadingIndicator aria-label="Server loading" />
        <LoadingIndicator aria-label="Server loading progress" value={0.5} />
        <ContainedLoadingIndicator aria-label="Server contained loading" />
        <ContainedLoadingIndicator
          aria-label="Server contained progress"
          value={0.75}
        />
      </>
    );

    const first = renderLane6(tree);
    const second = renderLane6(tree);

    expect(second).toBe(first);
    expect(first).toContain('data-mode="indeterminate"');
    expect(first).toContain('data-mode="determinate"');
    expect(first).toContain('data-contained="true"');
    expect(first).toContain('aria-valuenow="0.5"');
    expect(first).toContain('aria-valuenow="0.75"');
    expect(first).not.toContain('NaN');
  });

  it('renders Snackbar message, action, and dismiss semantics without owning host lifecycle', () => {
    const html = renderLane6(
      <Snackbar
        action={<SnackbarAction onPress={() => {}}>Undo</SnackbarAction>}
        dismissAction={
          <SnackbarDismissAction aria-label="Dismiss server snackbar" onPress={() => {}}>
            <span aria-hidden="true">×</span>
          </SnackbarDismissAction>
        }
      >
        Server snackbar message
      </Snackbar>,
    );

    expect(html).toContain('Server snackbar message');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
    expect(html).toContain('Undo');
    expect(html).toContain('aria-label="Dismiss server snackbar"');
    expect(html).not.toContain('data-timeout');
  });

  it('keeps closed plain and rich tooltip compositions server-safe without rendering open overlays', () => {
    const html = renderLane6(
      <>
        <TooltipTrigger delay={0} closeDelay={0}>
          <Button>Server plain tooltip trigger</Button>
          <PlainTooltip>Server plain tooltip body</PlainTooltip>
        </TooltipTrigger>
        <RichTooltipTrigger>
          <Button>Server rich tooltip trigger</Button>
          <RichTooltip>Server rich tooltip body</RichTooltip>
        </RichTooltipTrigger>
      </>,
    );

    expect(html).toContain('Server plain tooltip trigger');
    expect(html).toContain('Server rich tooltip trigger');
    expect(html).not.toContain('Server plain tooltip body');
    expect(html).not.toContain('Server rich tooltip body');
    expect(html).not.toContain('role="tooltip"');
    expect(html).not.toContain('role="dialog"');
  });
});
