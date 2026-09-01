import { Button } from '@m3-ui/ui';

export function ButtonBasicLiveExample() {
  return <Button>Save changes</Button>;
}

export const liveExampleRegistry = {
  'button-basic': ButtonBasicLiveExample,
} as const;

export type LiveExampleId = keyof typeof liveExampleRegistry;
