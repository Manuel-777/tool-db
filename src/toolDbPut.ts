import { PutMessage, textRandom, VerificationData } from ".";
import ToolDb from "./tooldb";

import proofOfWork from "./utils/proofOfWork";

/**
 * Triggers a PUT request to other peers.
 * @param key key where we want to put the data at.
 * @param value Data we want to any (any type)
 * @param userNamespaced If this key bolongs to a user or its public. Making it private will enforce validation for our address and signatures.
 * @returns Promise<Data | null>
 */
export default function toolDbPut<T = any>(
  this: ToolDb,
  key: string,
  value: T,
  userNamespaced = false
): Promise<PutMessage<T> | null> {
  return new Promise((resolve, reject) => {
    if (key.includes(".")) {
      // Dots are used as a delimitator character between bublic keys and the key of the user's data
      reject(new Error(`Key cannot include dots!; ${key}`));
      return;
    }

    if (!this.getAddress()) {
      reject(new Error("You need to log in before you can PUT."));
      return;
    }

    const timestamp = new Date().getTime();
    const dataString = `${JSON.stringify(
      value
    )}${this.getAddress()}${timestamp}`;

    // WORK
    proofOfWork(dataString, this.options.pow)
      .then(({ hash, nonce }) => {
        const signature = this.signData(hash);
        if (signature && this.getAddress()) {
          const finalKey = userNamespaced
            ? `:${this.getAddress()}.${key}`
            : key;
          // Compose the message
          const data: VerificationData = {
            k: finalKey,
            a: this.getAddress() || "",
            n: nonce,
            t: timestamp,
            h: hash,
            s: signature.signature,
            v: value,
          };

          this.store.put(finalKey, JSON.stringify(data), (err, data) => {
            //
          });

          if (this.options.debug) {
            console.log("PUT > " + key, data);
          }

          const finalMessage: PutMessage = {
            type: "put",
            id: textRandom(10),
            to: [],
            data,
          };
          this.network.sendToAll(finalMessage);

          resolve(finalMessage);
        }
      })
      .catch(reject);
  });
}
