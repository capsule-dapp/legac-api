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

export function generateSecurePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}<>?';

    const values = new Uint32Array(length);
    crypto.randomFillSync(values);

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[values[i] % charset.length];
    }

    return password;
  }