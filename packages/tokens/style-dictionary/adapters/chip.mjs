import {
  cssValue,
  defineCssAdapter,
  tokenReader,
  withOpacity,
} from '../adapter-helpers.mjs';

const actionVariants = ['assist', 'elevatedAssist', 'suggestion', 'elevatedSuggestion'];
const selectableVariants = ['filter', 'elevatedFilter', 'input'];

export function createChipCss(context) {
  const get = tokenReader(context, 'Chip CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const className = (variant) => variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const typography = [
    line('--_chip-font-family', `var(--font-family-${get('component.chip.typography.fontFamily')})`),
    line('--_chip-font-size', get('component.chip.typography.fontSize')),
    line('--_chip-line-height', get('component.chip.typography.lineHeight')),
    line('--_chip-font-weight', get('component.chip.typography.fontWeight')),
    line('--_chip-letter-spacing', get('component.chip.typography.letterSpacing')),
  ];

  const actionBase = 'component.chip.action.base';
  const actionRules = actionVariants.flatMap((variant) => {
    const prefix = `component.chip.variant.${variant}`;
    const rootSelector = `.chip--${className(variant)}`;
    const selector = `${rootSelector} > .chip__visual`;
    return [
      '', `${rootSelector} {`,
      line('--_chip-hit-size', get(`${actionBase}.minimumInteractiveSize`)),
      '}', '', `${selector} {`,
      line('--_chip-height', get(`${actionBase}.height`)),
      line('--_chip-container-radius', get(`${actionBase}.containerRadius`)),
      line('--_chip-padding-inline-start', get(`${actionBase}.contentPaddingInline`)),
      line('--_chip-padding-inline-end', get(`${actionBase}.contentPaddingInline`)),
      line('--_chip-leading-gap', get(`${actionBase}.iconSpacing`)),
      line('--_chip-trailing-gap', get(`${actionBase}.iconSpacing`)),
      line('--_chip-leading-icon-size', get(`${actionBase}.iconSize`)),
      line('--_chip-trailing-icon-size', get(`${actionBase}.iconSize`)),
      line('--_chip-avatar-size', 0),
      line('--_chip-avatar-radius', 0),
      line('--_chip-avatar-opacity', 1),
      line('--_chip-shape-transition', 'none'),
      ...typography,
      line('--_chip-container-color', get(`${prefix}.containerColor`)),
      line('--_chip-label-color', get(`${prefix}.labelColor`)),
      line('--_chip-leading-icon-color', get(`${prefix}.leadingIconColor`)),
      line('--_chip-trailing-icon-color', get(`${prefix}.trailingIconColor`)),
      line('--_chip-outline-color', get(`${prefix}.outlineColor`)),
      line('--_chip-outline-width', get(`${prefix}.outlineWidth`)),
      '}', '', `${rootSelector}[data-disabled] > .chip__visual {`,
      line('--_chip-container-color', withOpacity(get(`${prefix}.disabledContainerColor`), get(`${prefix}.disabledContainerOpacity`))),
      line('--_chip-label-color', withOpacity(get(`${actionBase}.disabledLabelColor`), get(`${actionBase}.disabledLabelOpacity`))),
      line('--_chip-leading-icon-color', withOpacity(get(`${actionBase}.disabledIconColor`), get(`${actionBase}.disabledIconOpacity`))),
      line('--_chip-trailing-icon-color', withOpacity(get(`${actionBase}.disabledIconColor`), get(`${actionBase}.disabledIconOpacity`))),
      line('--_chip-outline-color', withOpacity(get(`${prefix}.disabledOutlineColor`), get(`${prefix}.disabledOutlineOpacity`))),
      line('--_chip-outline-width', get(`${prefix}.outlineWidth`)),
      '}',
    ];
  });

  const selectableBase = 'component.chip.selectable.base';
  const selectableRules = selectableVariants.flatMap((variant) => {
    const prefix = `component.chip.variant.${variant}`;
    const rootSelector = `.chip--${className(variant)}`;
    const selector = `${rootSelector} > .chip__visual`;
    const elevated = variant === 'elevatedFilter';
    const input = variant === 'input';
    const unselectedOutlineColor = elevated ? get(`${prefix}.unselectedOutlineColor`) : get(`${selectableBase}.unselectedOutlineColor`);
    const disabledUnselectedOutlineColor = elevated ? get(`${prefix}.disabledUnselectedOutlineColor`) : get(`${selectableBase}.disabledUnselectedOutlineColor`);
    const unselectedOutlineWidth = elevated ? get(`${prefix}.unselectedOutlineWidth`) : get(`${selectableBase}.unselectedOutlineWidth`);
    const disabledUnselectedContainerColor = elevated ? get(`${prefix}.disabledUnselectedContainerColor`) : get(`${selectableBase}.disabledUnselectedContainerColor`);
    const avatarSize = input ? get(`${prefix}.avatarSize`) : get(`${selectableBase}.avatarSize`);
    const disabledAvatarOpacity = input ? get(`${prefix}.disabledAvatarOpacity`) : get(`${selectableBase}.disabledAvatarOpacity`);

    const inputPaddingRules = input ? [
      '', `${rootSelector} > .chip__visual {`,
      line('--_chip-padding-inline-start', get('component.chip.inputPadding.compact')),
      line('--_chip-padding-inline-end', get('component.chip.inputPadding.compact')),
      '}', '', `${rootSelector}[data-has-leading]:not([data-has-avatar]) > .chip__visual {`,
      line('--_chip-padding-inline-start', get('component.chip.inputPadding.withIcon')),
      '}', '', `${rootSelector}[data-has-trailing] > .chip__visual {`,
      line('--_chip-padding-inline-end', get('component.chip.inputPadding.withIcon')),
      '}',
    ] : [];

    return [
      '', `${rootSelector} {`,
      line('--_chip-hit-size', get(`${selectableBase}.minimumInteractiveSize`)),
      '}', '', `${selector} {`,
      line('--_chip-height', get(`${selectableBase}.height`)),
      line('--_chip-container-radius', get(`${selectableBase}.containerRadius`)),
      line('--_chip-padding-inline-start', get(`${selectableBase}.contentPaddingInline`)),
      line('--_chip-padding-inline-end', get(`${selectableBase}.contentPaddingInline`)),
      line('--_chip-leading-gap', get(`${selectableBase}.iconSpacing`)),
      line('--_chip-trailing-gap', get(`${selectableBase}.iconSpacing`)),
      line('--_chip-leading-icon-size', get(`${selectableBase}.leadingIconSize`)),
      line('--_chip-trailing-icon-size', get(`${selectableBase}.trailingIconSize`)),
      line('--_chip-avatar-size', avatarSize),
      line('--_chip-avatar-radius', get(`${selectableBase}.avatarRadius`)),
      line('--_chip-avatar-opacity', 1),
      line('--_chip-shape-transition', 'none'),
      ...typography,
      line('--_chip-container-color', get(`${prefix}.unselectedContainerColor`)),
      line('--_chip-label-color', get(`${prefix}.unselectedLabelColor`)),
      line('--_chip-leading-icon-color', get(`${prefix}.unselectedLeadingIconColor`)),
      line('--_chip-trailing-icon-color', get(`${prefix}.unselectedTrailingIconColor`)),
      line('--_chip-outline-color', unselectedOutlineColor),
      line('--_chip-outline-width', unselectedOutlineWidth),
      '}', '', `${selector}[data-selected] {`,
      line('--_chip-container-color', get(`${prefix}.selectedContainerColor`)),
      line('--_chip-label-color', get(`${prefix}.selectedLabelColor`)),
      line('--_chip-leading-icon-color', get(`${prefix}.selectedLeadingIconColor`)),
      line('--_chip-trailing-icon-color', get(`${prefix}.selectedTrailingIconColor`)),
      line('--_chip-outline-color', get(`${selectableBase}.selectedOutlineColor`)),
      line('--_chip-outline-width', get(`${selectableBase}.selectedOutlineWidth`)),
      '}', '', `${rootSelector}[data-expressive-shapes] > .chip__visual {`,
      line('--_chip-container-radius', get('component.chip.shape.unselectedRadius')),
      line('--_chip-shape-transition', `border-radius ${get('motion.spring.fastSpatial.duration')} ${get('motion.spring.fastSpatial.easing')}`),
      '}', '', `${rootSelector}[data-expressive-shapes] > .chip__visual[data-selected] {`,
      line('--_chip-container-radius', get('component.chip.shape.selectedRadius')),
      '}', '', `${rootSelector}[data-expressive-shapes][data-pressed] > .chip__visual {`,
      line('--_chip-container-radius', get('component.chip.shape.pressedRadius')),
      '}', '', `${rootSelector}[data-expressive-shapes][data-has-leading][data-has-trailing] > .chip__visual {`,
      line('--_chip-leading-gap', get(`${selectableBase}.compactIconSpacing`)),
      line('--_chip-trailing-gap', get(`${selectableBase}.compactIconSpacing`)),
      '}', '', `${rootSelector}[data-expressive-shapes][data-has-leading]:not([data-has-trailing]) > .chip__visual {`,
      line('--_chip-leading-gap', get(`${selectableBase}.compactIconSpacing`)),
      '}', '', `${rootSelector}[data-expressive-shapes][data-has-trailing]:not([data-has-leading]):not([data-has-avatar]) > .chip__visual {`,
      line('--_chip-trailing-gap', get(`${selectableBase}.compactIconSpacing`)),
      '}', '', `${rootSelector}[data-expressive-shapes][data-has-avatar][data-has-trailing] > .chip__visual {`,
      line('--_chip-leading-gap', get(`${selectableBase}.compactIconSpacing`)),
      line('--_chip-trailing-gap', get(`${selectableBase}.compactIconSpacing`)),
      '}', '', `${rootSelector}[data-expressive-shapes][data-has-avatar]:not([data-has-trailing]) > .chip__visual {`,
      line('--_chip-leading-gap', get(`${selectableBase}.compactIconSpacing`)),
      '}', '', `${selector}[data-expressive-shapes]:not([data-selected]) {`,
      line('--_chip-leading-icon-color', get(`${prefix}.expressiveUnselectedLeadingIconColor`)),
      '}', '', `${rootSelector}[data-disabled] > .chip__visual {`,
      line('--_chip-avatar-opacity', disabledAvatarOpacity),
      line('--_chip-container-color', withOpacity(disabledUnselectedContainerColor, get(`${selectableBase}.disabledContainerOpacity`))),
      line('--_chip-label-color', withOpacity(get(`${selectableBase}.disabledContentColor`), get(`${selectableBase}.disabledContentOpacity`))),
      line('--_chip-leading-icon-color', withOpacity(get(`${selectableBase}.disabledContentColor`), get(`${selectableBase}.disabledContentOpacity`))),
      line('--_chip-trailing-icon-color', withOpacity(get(`${selectableBase}.disabledContentColor`), get(`${selectableBase}.disabledContentOpacity`))),
      line('--_chip-outline-color', withOpacity(disabledUnselectedOutlineColor, get(`${selectableBase}.disabledOutlineOpacity`))),
      line('--_chip-outline-width', unselectedOutlineWidth),
      '}', '', `${rootSelector}[data-disabled] > .chip__visual[data-selected] {`,
      line('--_chip-container-color', withOpacity(get(`${selectableBase}.disabledSelectedContainerColor`), get(`${selectableBase}.disabledContainerOpacity`))),
      line('--_chip-outline-color', withOpacity(get(`${selectableBase}.disabledSelectedOutlineColor`), get(`${selectableBase}.disabledOutlineOpacity`))),
      line('--_chip-outline-width', get(`${selectableBase}.selectedOutlineWidth`)),
      '}',
      ...inputPaddingRules,
    ];
  });

  return [...actionRules, ...selectableRules, ''].join('\n');
}

export default defineCssAdapter('chip', createChipCss);
