import {
  Button,
  ElevatedButton,
  FilledTonalButton,
  OutlinedButton,
  TextButton,
  buttonShapesForSize,
} from '@m3-ui/ui';

export function ButtonBasicLiveExample() {
  return <Button onPress={() => {}}>Save changes</Button>;
}

export function ButtonVariantsLiveExample() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <Button>Save</Button>
      <FilledTonalButton>Next</FilledTonalButton>
      <OutlinedButton>Back</OutlinedButton>
      <TextButton>Learn more</TextButton>
      <ElevatedButton>Open on image</ElevatedButton>
    </div>
  );
}

export function ButtonIconsLiveExample() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <Button startIcon={<span>＋</span>}>Create</Button>
      <FilledTonalButton startIcon={<span>↗</span>}>Share</FilledTonalButton>
      <TextButton endIcon={<span>→</span>}>Learn more</TextButton>
    </div>
  );
}

export function ButtonSizesLiveExample() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <Button size="extraSmall">Extra small</Button>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
      <Button size="extraLarge">Extra large</Button>
    </div>
  );
}

export function ButtonShapesLiveExample() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <Button size="medium" shapes={buttonShapesForSize('medium')}>
        Round
      </Button>
      <Button size="medium" shapes={buttonShapesForSize('medium', 'square')}>
        Square
      </Button>
    </div>
  );
}

export function ButtonStatesLiveExample() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <Button>Enabled</Button>
      <Button isDisabled>Disabled</Button>
      <OutlinedButton>Keyboard focusable</OutlinedButton>
    </div>
  );
}

export const liveExampleRegistry = {
  'button-basic': ButtonBasicLiveExample,
  'button-variants': ButtonVariantsLiveExample,
  'button-icons': ButtonIconsLiveExample,
  'button-sizes': ButtonSizesLiveExample,
  'button-shapes': ButtonShapesLiveExample,
  'button-states': ButtonStatesLiveExample,
} as const;

export type LiveExampleId = keyof typeof liveExampleRegistry;
