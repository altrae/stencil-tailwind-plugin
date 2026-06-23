import { configurePluginOptions, PluginConfigDefaults } from './config/pluginConfiguration';
import { configureLogging } from './debug/logger';
import { configuredTransform, postTransformDependencyUpdate, buildStart, buildEnd, processGlobalStyles } from './plugin';

export type TailwindConfig = string;
export type TailwindPluginConfig = TailwindPluginFunctionalConfig;
export type TailwindPluginFunctionalConfig = (filename: string) => TailwindConfig;

export interface PluginConfigurationOptions {
  enableDebug?: boolean;
  injectTailwindConfiguration?: TailwindPluginConfig;
  minify?: boolean;
  optimise?: boolean;
  stripComments?: boolean;
  tailwindCssPath?: string;
}

export interface PluginConfigOptionsDefaults {
  DEFAULT: PluginConfigurationOptions;
}

export const PluginOptions = Object.freeze(PluginConfigDefaults);

let globalPluginConfigurationOptions = PluginOptions.DEFAULT;

function configureOptions(opts?: PluginConfigurationOptions) {
  const options = {
    ...globalPluginConfigurationOptions,
    ...opts,
  };

  const config = configurePluginOptions(options);
  configureLogging(options.enableDebug ?? false);

  return config;
}

export function setPluginConfigurationDefaults(opts: PluginConfigurationOptions): PluginConfigurationOptions {
  globalPluginConfigurationOptions = {
    ...globalPluginConfigurationOptions,
    ...opts,
  };

  return globalPluginConfigurationOptions;
}

export default function tailwindPlugin(opts?: PluginConfigurationOptions) {
  const config = configureOptions(opts);

  return {
    buildEnd,
    buildStart,
    name: 'tailwind',
    transform: configuredTransform(config),
  };
}

export function tailwindHMR(opts?: PluginConfigurationOptions) {
  const config = configureOptions(opts);

  return {
    buildEnd,
    buildStart,
    name: 'tailwind-hmr',
    pluginType: 'css',
    transform: postTransformDependencyUpdate(config),
  };
}

export function tailwindGlobal(opts?: PluginConfigurationOptions) {
  const config = configureOptions(opts);

  return {
    buildEnd,
    buildStart,
    name: 'tailwind-global',
    pluginType: 'css',
    transform: processGlobalStyles(config),
  };
}
