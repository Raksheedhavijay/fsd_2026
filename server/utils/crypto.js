const crypto = require('crypto');

const KEY = crypto.scryptSync(
  process.env.AES_SECRET_KEY || 'fallback_key_32chars_minimum!!xx',
  'salt', 32
);
const ALGO = 'aes-256-cbc';

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (hash) => {
  const [ivHex, encHex] = hash.split(':');
  const decipher = crypto.createDecipheriv(ALGO, KEY, Buffer.from(ivHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')),
    decipher.final()
  ]).toString();
};

module.exports = { encrypt, decrypt };
