import {
  Checkbox,
  RadioButton,
  RadioGroup,
  RangeSlider,
  Slider,
  Switch,
} from '@m3-ui/ui';

export function CheckboxPreview() {
  return (
    <div className="docs-control-stack">
      <Checkbox defaultSelected>Selected</Checkbox>
      <Checkbox>Unselected</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
      <Checkbox isDisabled>Disabled</Checkbox>
    </div>
  );
}

export function RadioButtonPreview() {
  return (
    <RadioGroup defaultValue="standard" label="Density">
      <RadioButton value="compact">Compact</RadioButton>
      <RadioButton value="standard">Standard</RadioButton>
      <RadioButton value="comfortable">Comfortable</RadioButton>
    </RadioGroup>
  );
}

export function SwitchPreview() {
  return (
    <div className="docs-control-stack">
      <Switch defaultSelected>Notifications</Switch>
      <Switch>Sync over mobile data</Switch>
      <Switch isDisabled>Managed setting</Switch>
    </div>
  );
}

export function SliderPreview() {
  return (
    <div className="docs-slider-stack">
      <Slider defaultValue={40} label="Volume" />
      <Slider
        defaultValue={60}
        label="Stepped value"
        maxValue={100}
        minValue={0}
        showTicks
        showValueIndicator
        step={20}
      />
      <RangeSlider
        defaultValue={[25, 75]}
        label="Range"
        thumbLabels={['Minimum', 'Maximum']}
      />
    </div>
  );
}
