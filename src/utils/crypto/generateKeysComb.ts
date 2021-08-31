import generateKeyPair, { KeyPair } from "./generateKeyPair";

export default async function generateKeysComb(): Promise<{
  signKeys: KeyPair;
  encryptionKeys: KeyPair;
}> {
  return new Promise((resolve) => {
    return generateKeyPair("ECDSA", true).then((signKeys) => {
      return generateKeyPair("ECDH", true).then((encryptionKeys) => {
        resolve({
          signKeys,
          encryptionKeys,
        });
      });
    });
  });
}
