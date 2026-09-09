import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Checkbox,
  MultiChoiceSegmentedButton,
  MultiChoiceSegmentedButtonRow,
  RadioButton,
  RadioGroup,
  RangeSlider,
  SingleChoiceSegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Slider,
  Switch,
  ThemeProvider,
} from './index';

function renderSelectionControl(element: ReactElement) {
  return renderToString(
    <ThemeProvider mode="light" portalContainer={null}>
      {element}
    </ThemeProvider>,
  );
}

describe('selection-control SSR contracts', () => {
  it('renders checkbox selected and indeterminate state without browser globals', () => {
    const selected = renderSelectionControl(
      <Checkbox defaultSelected>Selected checkbox</Checkbox>,
    );
    expect(selected).toContain('type="checkbox"');
    expect(selected).toContain('checked=""');
    expect(selected).toContain('Selected checkbox');

    const indeterminate = renderSelectionControl(
      <Checkbox isIndeterminate>Indeterminate checkbox</Checkbox>,
    );
    expect(indeterminate).toContain('Indeterminate checkbox');
    expect(indeterminate).toContain('checkbox__indeterminate-path');
  });

  it('renders radio-group selection and switch state deterministically', () => {
    const radios = renderSelectionControl(
      <RadioGroup aria-label="Delivery" defaultValue="standard">
        <RadioButton value="standard">Standard</RadioButton>
        <RadioButton value="express">Express</RadioButton>
      </RadioGroup>,
    );
    expect(radios).toContain('role="radiogroup"');
    expect(radios).toContain('Standard');
    expect(radios).toContain('Express');
    expect(radios).toContain('checked=""');

    const switchMarkup = renderSelectionControl(
      <Switch defaultSelected>Airplane mode</Switch>,
    );
    expect(switchMarkup).toContain('role="switch"');
    expect(switchMarkup).toContain('checked=""');
    expect(switchMarkup).toContain('Airplane mode');
  });

  it('renders single and range slider native value contracts before hydration', () => {
    const slider = renderSelectionControl(
      <Slider label="Volume" defaultValue={40} />,
    );
    expect(slider).toContain('type="range"');
    expect(slider).toContain('value="40"');
    expect(slider).toContain('Volume');

    const range = renderSelectionControl(
      <RangeSlider
        label="Price range"
        defaultValue={[25, 75]}
        thumbLabels={['Minimum price', 'Maximum price']}
      />,
    );
    expect(range).toContain('value="25"');
    expect(range).toContain('value="75"');
    expect(range).toContain('Minimum price');
    expect(range).toContain('Maximum price');
  });

  it('renders single- and multi-choice segmented semantics from initial state', () => {
    const single = renderSelectionControl(
      <SingleChoiceSegmentedButtonRow
        aria-label="Sort order"
        defaultValue="recent"
      >
        <SingleChoiceSegmentedButton value="recent">
          Recent
        </SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="popular">
          Popular
        </SingleChoiceSegmentedButton>
      </SingleChoiceSegmentedButtonRow>,
    );
    expect(single).toContain('role="radiogroup"');
    expect(single).toContain('Recent');
    expect(single).toContain('Popular');
    expect(single).toContain('checked=""');

    const multi = renderSelectionControl(
      <MultiChoiceSegmentedButtonRow aria-label="Filters">
        <MultiChoiceSegmentedButton defaultSelected>
          Photos
        </MultiChoiceSegmentedButton>
        <MultiChoiceSegmentedButton>Videos</MultiChoiceSegmentedButton>
      </MultiChoiceSegmentedButtonRow>,
    );
    expect(multi).toContain('role="group"');
    expect(multi).toContain('Photos');
    expect(multi).toContain('Videos');
    expect(multi).toContain('checked=""');
  });
});
