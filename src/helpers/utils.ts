import * as web3 from '@solana/web3.js';
export function validatePublicKey(address: string) {
    const pubkey = new web3.PublicKey(address);
    return web3.PublicKey.isOnCurve(pubkey.toBytes());
}