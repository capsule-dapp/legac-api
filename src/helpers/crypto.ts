import { config } from '../config/config';
import CryptoJS from "crypto-js";

export function encrypt(data: any) {
  var ciphertext = CryptoJS.AES.encrypt(data, config.encryptionKey as string).toString();
  return ciphertext;
}

export function decrypt(decryptedData: string) {
  var bytes = CryptoJS.AES.decrypt(decryptedData, config.encryptionKey as string);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}