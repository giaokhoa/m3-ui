import { useState } from 'react';
import {
  BottomSheet,
  Button,
  HorizontalMultiBrowseCarousel,
  ModalBottomSheet,
  SheetValue,
  Surface,
  getMaterialTypeCssProperties,
  useSheetState,
} from '@m3-ui/ui';
import './carousel-sheet-demos.css';

const carouselItems = [
  'Plan',
  'Build',
  'Review',
  'Ship',
  'Measure',
  'Iterate',
] as const;

export function CarouselPreview() {
  return (
    <div className="docs-carousel-demo">
      <HorizontalMultiBrowseCarousel
        aria-label="Product workflow"
        contentPadding={8}
        itemCount={carouselItems.length}
        itemSpacing={8}
        preferredItemWidth={176}
      >
        {({ index, isFocal }) => (
          <Surface
            className="docs-carousel-demo__item"
            color={isFocal ? 'var(--primary-container)' : 'var(--surface-container-high)'}
            contentColor={isFocal ? 'var(--on-primary-container)' : 'var(--on-surface)'}
          >
            <span style={getMaterialTypeCssProperties('titleMedium')}>
              {carouselItems[index]}
            </span>
          </Surface>
        )}
      </HorizontalMultiBrowseCarousel>
    </div>
  );
}

function SheetContent({ label }: { label: string }) {
  return (
    <div className="docs-bottom-sheet-demo__body">
      <div style={getMaterialTypeCssProperties('titleLarge')}>{label}</div>
      <p style={getMaterialTypeCssProperties('bodyMedium')}>
        SheetState owns the Material anchors while the surrounding composition
        owns where the sheet is placed.
      </p>
      <Button>Continue</Button>
    </div>
  );
}

export function BottomSheetPreview() {
  const state = useSheetState({
    initialValue: SheetValue.PartiallyExpanded,
  });

  return (
    <div className="docs-bottom-sheet-demo__stage">
      <div className="docs-bottom-sheet-demo__controls">
        <Button onPress={() => state.partialExpand()}>Partial</Button>
        <Button onPress={() => state.expand()}>Expand</Button>
      </div>
      <div
        className="docs-bottom-sheet-demo__background"
        style={getMaterialTypeCssProperties('bodyMedium')}
      >
        Background content remains interactive because this sheet is non-modal.
      </div>
      <BottomSheet
        aria-label="Example bottom sheet"
        partialExpandedHeight={168}
        state={state}
      >
        <SheetContent label="Local bottom sheet" />
      </BottomSheet>
    </div>
  );
}

export function ModalBottomSheetPreview() {
  const [open, setOpen] = useState(false);
  const state = useSheetState();

  return (
    <div className="docs-bottom-sheet-demo__modal-trigger">
      <Button onPress={() => setOpen(true)}>Open modal bottom sheet</Button>
      {open ? (
        <ModalBottomSheet
          aria-label="Example modal bottom sheet"
          onDismissRequest={() => setOpen(false)}
          state={state}
        >
          <SheetContent label="Modal bottom sheet" />
        </ModalBottomSheet>
      ) : null}
    </div>
  );
}
