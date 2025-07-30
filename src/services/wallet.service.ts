import { decrypt, encrypt } from '../helpers/crypto';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js'
import { BirdeyeService } from './birdeye.service';
import { NATIVE_MINT } from '@solana/spl-token';
import { connection } from '../config/config';
import { logger } from '../config/logger';
import bs58 from 'bs58'

const birdeyeService = new BirdeyeService();

export interface SendSOLParams {
    sender: string;
    destination: string;
    amount: number;
}

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

    signer(secretKey: string) {
        const decoded = decrypt(secretKey)
        const keypair = Keypair.fromSecretKey(bs58.decode(decoded))
        return keypair
    }

    async getWalletBalance(address: string) {
        const balanceInLamports = await this.connection.getBalance(new PublicKey(address));
        const solanaPrice = await birdeyeService.getTokenPrice(NATIVE_MINT.toBase58());
        const balance = balanceInLamports / LAMPORTS_PER_SOL;
        const balanceInUSD = solanaPrice.priceInUSD * balance;
        return {
            address,
            balanceInUSD,
            balanceInLamports,
            balanceUI: balance,
            solanaPrice: solanaPrice.priceInUSD,
            solanaPriceChange24h: solanaPrice.priceInUSDChange24h,
        }
    }

    async sendSOL(params: SendSOLParams, secretKey: string) {
        if (params.destination == "" || params.sender == "")
            throw new Error("Provide recipient or sender wallet address")

        if (params.amount == 0)
            throw new Error("Provide an actual amount to send")

        let retries = 0;
        do {
            try {
                logger.info('check sender wallet balance')
                const senderBalance = await this.connection.getBalance(new PublicKey(params.sender))
                if (senderBalance == 0 || senderBalance < params.amount)
                    throw new Error("Insufficient balance")

                logger.info('sender wallet balance is sufficient, proceeding with transfer')
                const tx = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: new PublicKey(params.sender),
                        toPubkey: new PublicKey(params.destination),
                        lamports: params.amount * LAMPORTS_PER_SOL
                    })
                );

                const signature = await sendAndConfirmTransaction(this.connection, tx, [this.signer(secretKey)])
                if (!signature) {
                    retries++
                } else {
                    retries = 10;
                    return signature;
                }
                return signature;
            } catch (error) {
                retries++;
            }
        } while (retries < 3);
        return null;
    }
}