import CryptoJS from "crypto-js";

import { KEY_HEX, IV_HEX } from "../../config";

const key = CryptoJS.enc.Hex.parse(KEY_HEX);
const iv = CryptoJS.enc.Hex.parse(IV_HEX);

export function convertWordArrayToBuffer(wordArray) {
  const l = wordArray.sigBytes;
  const words = wordArray.words;
  const result = new Uint8Array(l);
  let i = 0; /*dst*/
  let j = 0; /*src*/
  while (true) {
    // here i is a multiple of 4
    if (i == l) break;
    let w = words[j++];
    result[i++] = (w & 0xff000000) >>> 24;
    if (i == l) break;
    result[i++] = (w & 0x00ff0000) >>> 16;
    if (i == l) break;
    result[i++] = (w & 0x0000ff00) >>> 8;
    if (i == l) break;
    result[i++] = w & 0x000000ff;
  }
  return result;
}

export function decryptBuffer(buffer) {
  const inputWordArray = CryptoJS.lib.WordArray.create(buffer);
  const outputWordArray = CryptoJS.AES.decrypt(
    { ciphertext: inputWordArray },
    key,
    { iv }
  );
  const decryptedBuffer = convertWordArrayToBuffer(outputWordArray);
  return decryptedBuffer;
}

export function createBlobUrl(buffer) {
  const blob = new Blob([buffer]);
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}
