import { ec } from "elliptic";

import arrayBufferToString from "../arrayBufferToString";
import base64ToUint8 from "../base64ToUint8";

export default function recoverPubKeyFromPrivate(
  privateKey: ArrayBuffer
): string {
  const ecCurve =
    typeof window === "undefined"
      ? ((global as any).ecp256 as any)
      : ((window as any).ecp256 as any);

  const publicKey = ecCurve.keyFromPrivate(
    base64ToUint8(arrayBufferToString(privateKey))
  );

  return publicKey.getPublic().encode("hex", false);
}
