import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `.claude` holds nested builder worktrees — whole checkouts, `dist/` and
  // all. Linting them reports another branch's problems as this one's.
  globalIgnores(['dist', '.claude']),
  // Rules and parser for everything; no globals here on purpose. ESLint merges
  // `languageOptions.globals` across every entry whose `files` match, so a
  // `globals.browser` in this block would be added to the Node blocks below
  // rather than replaced by them — `document` and `window` would be declared
  // inside api/ and scripts/, where they do not exist, and no-undef would have
  // nothing to say about a browser API used in a serverless handler.
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // The app itself is the only browser code in the repo.
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { globals: globals.browser },
  },
  // Serverless handlers and build scripts run on Node, not in the browser:
  // `process`, `Buffer`, `console` and friends are real there.
  {
    files: ['api/**/*.js', 'scripts/**/*.js'],
    ignores: ['scripts/page-*.js'],
    languageOptions: { globals: globals.node },
  },
  // scripts/page-*.js is the exception: source written for a page, not for
  // Node. It holds the functions Playwright serialises into a browser with
  // page.evaluate(), where `Image` and `document` are real and `process` is
  // not. A `global` comment could not do this job — ESLint scopes those to a
  // whole file, so declaring browser globals next to the evaluate() call
  // declared them for the Node code around it too.
  {
    files: ['scripts/page-*.js'],
    languageOptions: { globals: globals.browser },
  },
  // Tests run under vitest with `globals: true` (vitest.config.js), so the
  // suite functions are injected rather than imported, and jsdom gives them
  // both environments at once.
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
])
