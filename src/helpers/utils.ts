import { Wallet } from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import * as web3 from '@solana/web3.js';
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