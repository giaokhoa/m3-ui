export const androidX = {
  repository: 'androidx/androidx',
  revision: '160825094a81825468a95b115bfb1b541e549856',
  tokenRoot:
    'compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens',
};

function lowerCamel(value) {
  return value.length === 0 ? value : value[0].toLowerCase() + value.slice(1);
}

function kebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

const token = (file, blobSha) => {
  const objectName = file.replace(/\.kt$/, '');
  if (!objectName.endsWith('Tokens')) {
    throw new Error(`Token source must end in Tokens.kt: ${file}`);
  }
  const stem = objectName.slice(0, -'Tokens'.length);
  return {
    file,
    path: `${androidX.tokenRoot}/${file}`,
    blobSha,
    exportName: `${lowerCamel(stem)}TokensGenerated`,
    output: `packages/tokens/src/generated/androidx/${kebab(stem)}.ts`,
  };
};

export const tokenSources = [
  token('ElevationTokens.kt', '5b5fd66d3a9e061ac9de98c4958344d2e7be923c'),
  token('StateTokens.kt', '5a52d587e453e00fdbb345a775985e20d6a41d2c'),
  token('SwitchTokens.kt', '1fd474ec436e63b0ec54c455f32445d2d4ef5123'),
  token('FilledButtonTokens.kt', 'ed1d4ee4f451fc7b2d096ee70a5e50e660ad7d0a'),
  token('ElevatedButtonTokens.kt', 'b9ffc0d0f046806763fa838d6815420570d18b95'),
  token('FilledTonalButtonTokens.kt', 'b3c0a76019f053859859e14b9dffccf228d1a9f9'),
  token('OutlinedButtonTokens.kt', '254fd1b836065e4c5206b70375c30e2bc7305f79'),
  token('TextButtonTokens.kt', 'a12ea2050e53a13e45087c88a3c27d64b5b3e667'),
  token('BaselineButtonTokens.kt', 'f974ca86600932605c3b2f4175388a8bf86b5775'),
  token('ButtonXSmallTokens.kt', 'c2ebcaf01565c9b18ee6e702cbbb39c243f33c52'),
  token('ButtonSmallTokens.kt', '1334de16e3e9762bd212d382103750265064d327'),
  token('ButtonMediumTokens.kt', '0fb707f53335f8c9e034271f30ab028ba0092291'),
  token('ButtonLargeTokens.kt', '5b874fefa3eaa5a4a09d1a5d6863891f6ce29821'),
  token('ButtonXLargeTokens.kt', 'bbd04f4ab069623f433cace49a281fc88da7d53b'),
  token('CheckboxTokens.kt', '2e134988e3b23bb08dd846f449cc5c2e82c6ccba'),
  token('RadioButtonTokens.kt', 'abd46df399f6e310e113f66cd51ab9250735215f'),
  token('FilledTextFieldTokens.kt', '695660fd929571097319d6d55fa81a07ac72eb3c'),
  token('OutlinedTextFieldTokens.kt', '081e501128dc5ce9956ab41e0d2d4520c3f4b8cd'),
  token('FilledCardTokens.kt', '5f0f86b53697654e1dfef1b00c5ecdb597390105'),
  token('ElevatedCardTokens.kt', '1b24ec988b58c200a0fa770928b22fe9fe29674d'),
  token('OutlinedCardTokens.kt', '9720f886c5a4f2c65a4495dc105fa337323e8d5c'),
  token('AssistChipTokens.kt', 'e8f5556725202de78973cd3c5ab423fc8de799c2'),
  token('FilterChipTokens.kt', '7d345151d924ea369c607d2b5ad43249423f8eee'),
  token('InputChipTokens.kt', '64a1334f9ee19cb0b7907b9ab8a953d33de30361'),
  token('SuggestionChipTokens.kt', '7218641931e2dd11f1bb22fd8222418996a0483b'),
  token('ChipsTokens.kt', '367c8a2e41dc363b9dbba3dd436474384a69993b'),
  token('ShapeKeyTokens.kt', '03f3d967c02653a64f1826d24ce44019e842b01d'),
  token('ShapeTokens.kt', '2fe916fd86be3606accb29af36ffb49d3a6ca94b'),
  token('TypeScaleTokens.kt', '3a4e1b13c2094fb6748ade6ca68eec2caa8141c5'),
  token('TypefaceTokens.kt', '9490324c68b1337716c604e44bbf44d3930620c6'),
  token('TypographyKeyTokens.kt', '563f00220877498437942fd46a18f54338963ccf'),
  token('TypographyTokens.kt', 'e528032a82d970f731806b6ea92363f3f095b25e'),
  token('StandardMotionTokens.kt', '29f2e0c7229b116e53bb97823fbef86486f3954e'),
  token('ExpressiveMotionTokens.kt', '0b1321847815a61676fa8b1435d801b08f5a6e99'),
  token('MotionSchemeKeyTokens.kt', '945a81f7e3ac1bbea342f85ab4050df9dbffe3c1'),
  token('MotionTokens.kt', '477f00627a7473442492283a32e702a01d60f898'),
];
