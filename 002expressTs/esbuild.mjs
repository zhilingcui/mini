//@ts-check
import * as esbuild from 'esbuild';

const options = {
  watch: process.argv.includes('--watch'),
  minify: process.argv.includes('--minify'),
};

const successMessage = options.watch
    ? 'Watch build succeeded'
    : 'Build succeeded';

/** @type {import('esbuild').Plugin[]} */
const plugins = [
  {
      name: 'watch-plugin',
      setup(build) {
          build.onEnd((result) => {
              if (result.errors.length === 0) {
                  console.log(getTime() + successMessage);
              }
          });
      },
  },
];

const nodeContext = await esbuild.context({
  entryPoints: [
      'index.ts'
  ],
  outdir: 'dist',
  bundle: true,
  target: 'es6',
  format: 'cjs',
  loader: { '.ts': 'ts' },
  external: ['express'],
  outExtension: {
  },
  platform: 'node',
  sourcemap: !options.minify,
  minify: options.minify,
  plugins,
});

if (options.watch) {
  await Promise.all([
      nodeContext.watch()
  ]);
} else {
  await Promise.all([
      nodeContext.rebuild()
  ]);
  nodeContext.dispose();
}

function getTime() {
  const date = new Date();
  return `[${`${padZeroes(date.getHours())}:${padZeroes(
      date.getMinutes()
  )}:${padZeroes(date.getSeconds())}`}] `;
}


/**
 * @param {number} i
 */
function padZeroes(i) {
  return i.toString().padStart(2, '0');
}
