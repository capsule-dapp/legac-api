import { encrypt } from '../helpers/crypto';
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

export class WalletService {
    create() {
        const keypair = Keypair.generate();
        return {
            publicKey: keypair.publicKey.toString(),
            secretKey: encrypt(bs58.encode(keypair.secretKey))
        }
    }
}