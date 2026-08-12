declare module 'postcss-combine-media-query' {
  import type { PluginCreator } from 'postcss';

  const combineMediaQueries: PluginCreator<Record<string, never>>;

  export default combineMediaQueries;
}
