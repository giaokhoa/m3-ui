export const androidX = {
  repository: 'androidx/androidx',
  revision: '160825094a81825468a95b115bfb1b541e549856',
  tokenRoot: 'compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens',
};

export const tokenSources = ['ElevationTokens.kt', 'StateTokens.kt', 'SwitchTokens.kt'].map((file) => ({
  file,
  path: `${androidX.tokenRoot}/${file}`,
}));
