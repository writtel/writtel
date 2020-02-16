const config = {
  presets: ['@babel/react', '@babel/env'],
  plugins: [
    ['css-modules-transform', {
      'extensions': ['.module.css', '.module.scss'],
      'generateScopedName': '[hash:8]',
      'camelCase': 'only',
    }]
  ]
};

require('@babel/register')(config);
