import postcssrc from 'postcss-load-config';
import cssnano from 'cssnano';
import combine from 'postcss-combine-duplicated-selectors';
import mediaCombine from 'postcss-combine-media-query';
import discardComments from 'postcss-discard-comments';

async function loadPlugins() {
  const ctx: postcssrc.ConfigContext = {};

  try {
    const configPlugins = await postcssrc(ctx);

    return configPlugins.plugins;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.startsWith('No PostCSS Config found in')) {
      return [];
    }

    throw new Error(
      `'stencil-tailwind-plugin' is unable to resolve modules required from configuration files. Make sure it is installed\nError: ${message}`,
    );
  }
}

function findIndexOfPlugin(configPlugins: postcssrc.ResultPlugin[], name: string) {
  return configPlugins.findIndex((plugin) => {
    if ('postcssPlugin' in plugin) {
      return plugin.postcssPlugin === name;
    }

    if (typeof plugin === 'function') {
      const createdPlugin = (plugin as typeof Function)();

      return 'postcssPlugin' in createdPlugin && createdPlugin.postcssPlugin === name;
    }

    return false;
  });
}

interface PostcssPlugins {
  after: postcssrc.ResultPlugin[];
  before: postcssrc.ResultPlugin[];
}

export function stripCommentsPlugin() {
  return discardComments({ removeAll: true });
}

export function getMinifyPlugins() {
  return [
    mediaCombine(),
    combine({ removeDuplicatedValues: true }),
    cssnano(),
  ];
}

export async function getPostcssPlugins(): Promise<PostcssPlugins> {
  const configPlugins = await loadPlugins();

  const configPluginTailwindIdx = findIndexOfPlugin(configPlugins, '@tailwindcss/postcss');

  const afterTailwind = configPluginTailwindIdx === -1 ? configPlugins : configPlugins.slice(configPluginTailwindIdx + 1);
  const beforeTailwind = configPluginTailwindIdx === -1 ? [] : configPlugins.slice(0, configPluginTailwindIdx);

  return {
    after: afterTailwind,
    before: beforeTailwind,
  };
}
