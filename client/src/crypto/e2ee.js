import * as sodium from 'libsodium-wrappers';

export async function initSodium() {
  await sodium.ready;
}

export function generateKeyPair() {
  const keyPair = sodium.crypto_box_keypair();
  return {
    publicKey: sodium.to_base64(keyPair.publicKey),
    privateKey: sodium.to_base64(keyPair.privateKey)
  };
}

export function encryptMessage(message, recipientPublicKeyBase64, senderPrivateKeyBase64) {
  const recipientPublicKey = sodium.from_base64(recipientPublicKeyBase64);
  const senderPrivateKey = sodium.from_base64(senderPrivateKeyBase64);
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const encrypted = sodium.crypto_box_easy(message, nonce, recipientPublicKey, senderPrivateKey);
  return {
    payload: sodium.to_base64(encrypted),
    nonce: sodium.to_base64(nonce)
  };
}

export function decryptMessage(encryptedBase64, nonceBase64, senderPublicKeyBase64, recipientPrivateKeyBase64) {
  const encrypted = sodium.from_base64(encryptedBase64);
  const nonce = sodium.from_base64(nonceBase64);
  const senderPublicKey = sodium.from_base64(senderPublicKeyBase64);
  const recipientPrivateKey = sodium.from_base64(recipientPrivateKeyBase64);
  const decrypted = sodium.crypto_box_open_easy(encrypted, nonce, senderPublicKey, recipientPrivateKey);
  return new TextDecoder().decode(decrypted);
}