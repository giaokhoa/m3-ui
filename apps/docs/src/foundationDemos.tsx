import type { CSSProperties } from 'react';
import {
  colorRoleToCssVariable,
  createDynamicColorScheme,
  getMaterialTypeCssProperties,
  schemeToCssVariables,
  type ColorRole,
  type MaterialTypeEmphasis,
  type MaterialTypeRole,
  type ThemeStyle,
} from '@m3-ui/ui';

interface ColorRolePair {
  label: string;
  role: ColorRole;
  onRole: ColorRole;
}

const colorRolePairs: readonly ColorRolePair[] = [
  { label: 'Primary', role: 'primary', onRole: 'onPrimary' },
  {
    label: 'Primary container',
    role: 'primaryContainer',
    onRole: 'onPrimaryContainer',
  },
  { label: 'Secondary', role: 'secondary', onRole: 'onSecondary' },
  {
    label: 'Secondary container',
    role: 'secondaryContainer',
    onRole: 'onSecondaryContainer',
  },
  { label: 'Tertiary', role: 'tertiary', onRole: 'onTertiary' },
  {
    label: 'Tertiary container',
    role: 'tertiaryContainer',
    onRole: 'onTertiaryContainer',
  },
  { label: 'Error', role: 'error', onRole: 'onError' },
  {
    label: 'Error container',
    role: 'errorContainer',
    onRole: 'onErrorContainer',
  },
  { label: 'Surface', role: 'surface', onRole: 'onSurface' },
  {
    label: 'Surface variant',
    role: 'surfaceVariant',
    onRole: 'onSurfaceVariant',
  },
  {
    label: 'Surface container low',
    role: 'surfaceContainerLow',
    onRole: 'onSurface',
  },
  {
    label: 'Surface container',
    role: 'surfaceContainer',
    onRole: 'onSurface',
  },
  {
    label: 'Surface container high',
    role: 'surfaceContainerHigh',
    onRole: 'onSurface',
  },
  {
    label: 'Inverse surface',
    role: 'inverseSurface',
    onRole: 'inverseOnSurface',
  },
] as const;

const typeRoles: readonly MaterialTypeRole[] = [
  'displayLarge',
  'displayMedium',
  'displaySmall',
  'headlineLarge',
  'headlineMedium',
  'headlineSmall',
  'titleLarge',
  'titleMedium',
  'titleSmall',
  'bodyLarge',
  'bodyMedium',
  'bodySmall',
  'labelLarge',
  'labelMedium',
  'labelSmall',
] as const;

function roleStyle(role: ColorRole, onRole: ColorRole): CSSProperties {
  return {
    background: `var(${colorRoleToCssVariable(role)})`,
    color: `var(${colorRoleToCssVariable(onRole)})`,
  };
}

function ColorRoleSwatches() {
  return (
    <div className="docs-color-grid">
      {colorRolePairs.map(({ label, role, onRole }) => (
        <div className="docs-color-swatch" key={role} style={roleStyle(role, onRole)}>
          <span style={getMaterialTypeCssProperties('labelLarge')}>{label}</span>
          <code className="docs-color-swatch__role">
            {colorRoleToCssVariable(role)}
          </code>
        </div>
      ))}
    </div>
  );
}

export function ColorRoleGrid() {
  return (
    <section aria-label="Current Material color roles" className="docs-foundation-demo">
      <ColorRoleSwatches />
    </section>
  );
}

function generatedThemeStyle(
  sourceColor: string,
  mode: 'light' | 'dark',
  contrastLevel: number,
): ThemeStyle {
  return {
    ...schemeToCssVariables(
      createDynamicColorScheme(sourceColor, mode, contrastLevel),
    ),
    colorScheme: mode,
  };
}

export function DynamicColorPreview({
  sourceColor,
  contrastLevel = 0,
}: {
  sourceColor: string;
  contrastLevel?: number;
}) {
  return (
    <section
      aria-label={`Dynamic Material color generated from ${sourceColor}`}
      className="docs-dynamic-color"
    >
      {(['light', 'dark'] as const).map((mode) => (
        <div
          className="docs-dynamic-color__scheme"
          data-theme={mode}
          key={mode}
          style={generatedThemeStyle(sourceColor, mode, contrastLevel)}
        >
          <div
            className="docs-dynamic-color__header"
            style={getMaterialTypeCssProperties('titleMedium')}
          >
            {mode === 'light' ? 'Light scheme' : 'Dark scheme'}
          </div>
          <ColorRoleSwatches />
        </div>
      ))}
    </section>
  );
}

export function TypeScaleSamples({
  emphasis = 'standard',
}: {
  emphasis?: MaterialTypeEmphasis;
}) {
  return (
    <section
      aria-label={`${emphasis} Material type scale`}
      className="docs-type-scale"
    >
      {typeRoles.map((role) => (
        <div className="docs-type-sample" key={role}>
          <div
            className="docs-type-sample__label"
            style={getMaterialTypeCssProperties('labelMedium')}
          >
            {role}
          </div>
          <div
            className="docs-type-sample__text"
            style={getMaterialTypeCssProperties(role, emphasis)}
          >
            Material 3
          </div>
        </div>
      ))}
    </section>
  );
}
