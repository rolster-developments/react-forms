import rolster from '@rolster/rollup';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default rolster({
  entryFiles: ['index'],
  packages: [
    '@rolster/forms',
    '@rolster/forms/helpers',
    '@rolster/validators',
    'react',
    'uuid'
  ],
  plugins: [peerDepsExternal()]
});
