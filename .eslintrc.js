module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'rules': {
    'linebreak-style': 0,
    'max-len': [{
      'ignoreComments': true,
    }]
  },
};
