import { Wallet } from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import * as web3 from '@solana/web3.js';
import crypto from "crypto";

export function validatePublicKey(address: string) {
    const pubkey = new web3.PublicKey(address);
    return web3.PublicKey.isOnCurve(pubkey.toBytes());
}

export function anchorWallet(secret_key: string) {
    let keypair = web3.Keypair.fromSecretKey(
        bs58.decode(secret_key)
    );
    return new Wallet(keypair)
}

export function generateSecurePassword(length = 12) {
    if (length < 6) throw new Error("Password length must be at least 6");

    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()';
    const all = lowercase + uppercase + digits + symbols;

    const getRandomChar = (charset: any) =>
      charset[Math.floor(Math.random() * charset.length)];

    let password = [
      getRandomChar(lowercase),
      getRandomChar(uppercase),
      getRandomChar(digits),
      getRandomChar(symbols),
    ];

    while (password.length < length) {
      password.push(getRandomChar(all));
    }

    // Shuffle the password to avoid predictable order
    for (let i = password.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
}