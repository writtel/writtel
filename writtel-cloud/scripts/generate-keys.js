const { generateKeyPair } = require('crypto');
const path = require('path');
const fs = require('fs');

generateKeyPair('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
}, (err, publicKey, privateKey) => {
  if (err) {
    console.error(err);
    return;
  }

  fs.writeFileSync(path.resolve(__dirname, '..', 'functions', 'jwt-private-key.pem'), privateKey);
  fs.writeFileSync(path.resolve(__dirname, '..', 'functions', 'jwt-public-key.pem'), publicKey);
})
