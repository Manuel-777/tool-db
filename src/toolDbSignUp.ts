import ToolDb from "./tooldb";

import { EncryptedKeystoreV3Json } from "web3-core";

import {
  PutMessage,
  textRandom,
  VerificationData,
  encryptWithPass,
  generateIv,
  proofOfWork,
  sha256,
} from ".";

export default async function toolDbSignUp(
  this: ToolDb,
  user: string,
  password: string
): Promise<PutMessage<any>> {
  const userRoot = `==${user}`;
  return new Promise((resolve, reject) => {
    this.getData<EncryptedKeystoreV3Json>(userRoot, false, 3000)
      .then((data) => {
        if (data === null) {
          const account = this.web3.eth.accounts.create();
          const iv = generateIv();
          encryptWithPass(account.privateKey, password, iv).then(
            (encryptedPrivateKey) => {
              if (encryptedPrivateKey) {
                const userData = account.encrypt(sha256(password));

                const timestamp = new Date().getTime();
                const userDataString = `${JSON.stringify(userData)}${
                  account.address
                }${timestamp}`;

                proofOfWork(userDataString, 0)
                  .then(({ hash, nonce }) => {
                    const signature = this.web3.eth.accounts.sign(
                      hash,
                      account.privateKey
                    );

                    const signupMessage: VerificationData<EncryptedKeystoreV3Json> =
                      {
                        k: userRoot,
                        a: account.address,
                        n: nonce,
                        t: timestamp,
                        h: hash,
                        s: signature.signature,
                        v: userData,
                        c: null,
                      };

                    this.store.put(
                      userRoot,
                      JSON.stringify(signupMessage),
                      (err, data) => {
                        //
                      }
                    );

                    if (this.options.debug) {
                      console.log("SIGNUP PUT > " + userRoot, signupMessage);
                    }

                    const finalMsg = {
                      type: "put",
                      id: textRandom(10),
                      to: [],
                      data: signupMessage,
                    } as PutMessage;

                    this.network.sendToAll(finalMsg);
                    resolve(finalMsg);
                  })
                  .catch(reject);
              }
            }
          );
        } else {
          reject(new Error("User already exists!"));
        }
      })
      .catch(() => {
        reject(new Error("Could not fetch user"));
      });
  });
}
