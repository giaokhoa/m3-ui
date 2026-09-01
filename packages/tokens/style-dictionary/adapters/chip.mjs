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

  const actionBase = 'component.chip.action.base';
  const actionRules = actionVariants.flatMap((variant) => {
    const prefix = `component.chip.variant.${variant}`;
    const selector = `.chip--${className(variant)} > .chip__visual`;
    return [
      '', `${selector} {`,
      line('--_chip-container-color', get(`${prefix}.containerColor`)),
      line('--_chip-label-color', get(`${prefix}.labelColor`)),
      line('--_chip-leading-icon-color', get(`${prefix}.leadingIconColor`)),
      line('--_chip-trailing-icon-color', get(`${prefix}.trailingIconColor`)),
      line('--_chip-outline-color', get(`${prefix}.outlineColor`)),
      line('--_chip-outline-width', get(`${prefix}.outlineWidth`)),
      '}', '', `.chip--${className(variant)}[data-disabled] > .chip__visual {`,
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
    const selector = `.chip--${className(variant)} > .chip__visual`;
    const elevated = variant === 'elevatedFilter';
    const unselectedOutlineColor = elevated ? get(`${prefix}.unselectedOutlineColor`) : get(`${selectableBase}.unselectedOutlineColor`);
    const disabledUnselectedOutlineColor = elevated ? get(`${prefix}.disabledUnselectedOutlineColor`) : get(`${selectableBase}.disabledUnselectedOutlineColor`);
    const unselectedOutlineWidth = elevated ? get(`${prefix}.unselectedOutlineWidth`) : get(`${selectableBase}.unselectedOutlineWidth`);
    const disabledUnselectedContainerColor = elevated ? get(`${prefix}.disabledUnselectedContainerColor`) : get(`${selectableBase}.disabledUnselectedContainerColor`);

    return [
      '', `${selector} {`,
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
      '}', '', `${selector}[data-expressive-shapes]:not([data-selected]) {`,
      line('--_chip-leading-icon-color', get(`${prefix}.expressiveUnselectedLeadingIconColor`)),
      '}', '', `.chip--${className(variant)}[data-disabled] > .chip__visual {`,
      line('--_chip-container-color', withOpacity(disabledUnselectedContainerColor, get(`${selectableBase}.disabledContainerOpacity`))),
      line('--_chip-label-color', withOpacity(get(`${selectableBase}.disabledContentColor`), get(`${selectableBase}.disabledContentOpacity`))),
      line('--_chip-leading-icon-color', withOpacity(get(`${selectableBase}.disabledContentColor`), get(`${selectableBase}.disabledContentOpacity`))),
      line('--_chip-trailing-icon-color', withOpacity(get(`${selectableBase}.disabledContentColor`), get(`${selectableBase}.disabledContentOpacity`))),
      line('--_chip-outline-color', withOpacity(disabledUnselectedOutlineColor, get(`${selectableBase}.disabledOutlineOpacity`))),
      line('--_chip-outline-width', unselectedOutlineWidth),
      '}', '', `.chip--${className(variant)}[data-disabled] > .chip__visual[data-selected] {`,
      line('--_chip-container-color', withOpacity(get(`${selectableBase}.disabledSelectedContainerColor`), get(`${selectableBase}.disabledContainerOpacity`))),
      line('--_chip-outline-color', withOpacity(get(`${selectableBase}.disabledSelectedOutlineColor`), get(`${selectableBase}.disabledOutlineOpacity`))),
      line('--_chip-outline-width', get(`${selectableBase}.selectedOutlineWidth`)),
      '}',
    ];
  });

  return [...actionRules, ...selectableRules, ''].join('\n');
}

export default defineCssAdapter('chip', createChipCss);
