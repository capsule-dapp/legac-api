import { encrypt } from '../helpers/crypto';
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { BirdeyeService } from './birdeye.service';
import { NATIVE_MINT } from '@solana/spl-token';
import { connection } from '../config/config';
import bs58 from 'bs58'

const birdeyeService = new BirdeyeService();

export class WalletService {
    private connection: Connection;

    constructor() {
        this.connection = connection;
    }

    create() {
        const keypair = Keypair.generate();
        return {
            publicKey: keypair.publicKey.toString(),
            secretKey: encrypt(bs58.encode(keypair.secretKey))
        }
    }

    async getWalletBalance(address: string) {
        const balance = await this.connection.getBalance(new PublicKey(address));
        const solanaPrice = await birdeyeService.getTokenPrice(NATIVE_MINT.toBase58());
        const balanceInUSD = solanaPrice.priceInUSD * balance;
        console.log(solanaPrice)
        return {
            balance,
            balanceInUSD,
            solanaPrice: solanaPrice.priceInUSD,
            solanaPriceChange24h: solanaPrice.priceInUSDChange24h
        }
    }
}