module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:promise/recommended',
    'plugin:sonarjs/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'promise',
    'sonarjs',
    'optimize-regex',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
  },
  rules: {
    // Performance optimization
    'react/jsx-no-bind': ['error', {
      allowArrowFunctions: true,
      allowFunctions: false,
      allowBind: false,
    }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-fragments': ['error', 'syntax'],
    'optimize-regex/optimize-regex': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    
    // Code quality
    'sonarjs/cognitive-complexity': ['error', 15],
    'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
    'complexity': ['warn', 10],
    'max-depth': ['warn', 3],
    'max-nested-callbacks': ['warn', 3],
    'max-params': ['warn', 4],
    
    // Modularity
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/exports-last': 'error',
    'import/no-default-export': 'warn',
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index',
      ],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc', caseInsensitive: true },
    }],
    
    // Naming conventions
    'camelcase': ['error', { properties: 'never' }],
    
    // Error handling
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-throw-literal': 'error',
    
    // React specific
    'react/prop-types': 'error',
    'react/display-name': 'off',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-danger': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-unknown-property': 'error',
    'react/prefer-es6-class': 'error',
    'react/react-in-jsx-scope': 'error',
    'react/require-render-return': 'error',
    'react/self-closing-comp': 'error',
    'react/sort-comp': 'error',
    
    // Accessibility
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
  },
  overrides: [
    {
      files: ['*.test.js', '*.test.jsx', '*.spec.js', '*.spec.jsx'],
      env: {
        jest: true,
      },
      rules: {
        'max-lines-per-function': 'off',
      },
    },
  ],
}; 