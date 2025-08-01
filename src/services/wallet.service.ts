import { decrypt, encrypt } from '../helpers/crypto';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js'
import { BirdeyeService } from './birdeye.service';
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, getMint, NATIVE_MINT } from '@solana/spl-token';
import { connection } from '../config/config';
import { logger } from '../config/logger';
import bs58 from 'bs58'

const birdeyeService = new BirdeyeService();

export interface SendSOLParams {
    sender: string;
    destination: string;
    amount: number;
}

export interface SendNFTParams {
    destination: string;
    sender: string;
    mint: string;
}

export interface SendSPLTokenParams {
    destination: string;
    sender: string;
    amount: number;
    mint: string;
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
        if (!this.connection)
            throw new Error("Connection not found")

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

    async sendNFT(params: SendNFTParams, secretKey: string) {
        if (!this.connection)
            throw new Error("Connection not found")

        if (params.destination == "" || params.sender == "")
            throw new Error("Provide recipient or sender wallet address")

        let retries = 0;
        do {
            try {
                const mint = new PublicKey(params.mint);
                const sender = new PublicKey(params.sender);
                const recipient = new PublicKey(params.destination);

                const signer = this.signer(secretKey);

                logger.info('get sender and destination token account info')
                const senderTokenAccount = await getAssociatedTokenAddress(mint, sender);
                const recipientTokenAccount = await getAssociatedTokenAddress(mint, recipient);

                const transaction = new Transaction();

                logger.info('check if account info is found else create one')
                if (!await this.connection.getAccountInfo(recipientTokenAccount)) {
                    logger.info(`create recipient token account for mint ${mint.toBase58()}`)
                    transaction.add(
                        createAssociatedTokenAccountInstruction(
                            signer.publicKey,
                            recipientTokenAccount,
                            recipient,
                            mint
                        )
                    )
                }

                logger.info('build spl token transfer instruction')
                transaction.add(
                    createTransferInstruction(
                        senderTokenAccount,
                        recipientTokenAccount,
                        sender,
                        1,
                    )
                )

                const signature = await sendAndConfirmTransaction(this.connection, transaction, [signer])
                if (!signature) {
                    retries++
                } else {
                    retries = 10;
                    return signature;
                }
                logger.info(
                    `NFT token transfer successfull: from: ${sender.toBase58()} to: ${recipient.toBase58()} mint: ${mint.toBase58()}`
                )
                return signature;
            } catch (error) {
                retries++;
            }
        } while (retries < 3);
        return null;
    }

    async sendSPLToken(params: SendSPLTokenParams, secretKey: string) {
        if (!this.connection)
            throw new Error("Connection not found")

        if (params.destination == "" || params.sender == "")
            throw new Error("Provide recipient or sender wallet address")

        if (params.amount == 0)
            throw new Error("Provide an actual amount to send")

        let retries = 0;
        do {
            try {
                const mint = new PublicKey(params.mint);
                const sender = new PublicKey(params.sender);
                const recipient = new PublicKey(params.destination);

                const signer = this.signer(secretKey);

                logger.info('get sender and destination token account info')
                const senderTokenAccount = await getAssociatedTokenAddress(mint, sender);
                const recipientTokenAccount = await getAssociatedTokenAddress(mint, recipient);

                logger.info('check sender wallet balance')
                const senderBalance = await this.connection.getTokenAccountBalance(senderTokenAccount)
                if (senderBalance.value.uiAmount == null || senderBalance.value.uiAmount < params.amount)
                    throw new Error("Insufficient balance")

                const transaction = new Transaction();

                logger.info('check if account info is found else create one')
                if (!await this.connection.getAccountInfo(recipientTokenAccount)) {
                    logger.info(`create recipient token account for mint ${mint.toBase58()}`)
                    transaction.add(
                        createAssociatedTokenAccountInstruction(
                            signer.publicKey,
                            recipientTokenAccount,
                            recipient,
                            mint
                        )
                    )
                }

                logger.info('get mint info to get actual amount to send')
                const mintInfo = await getMint(this.connection, mint)
                const actualAmount = Math.pow(10, mintInfo.decimals) * params.amount

                console.log(`actual amount to send: ${actualAmount}`)
                if (actualAmount <= 0) {
                    logger.warn(`amount to send is not valid: ${actualAmount}`)
                    return null;
                }

                logger.info('build spl token transfer instruction')
                transaction.add(
                    createTransferInstruction(
                        senderTokenAccount,
                        recipientTokenAccount,
                        sender,
                        actualAmount,
                    )
                )

                const signature = await sendAndConfirmTransaction(this.connection, transaction, [signer])
                if (!signature) {
                    retries++
                } else {
                    retries = 10;
                    logger.info(
                        `SPL token transfer successfull: ${actualAmount} from: ${sender.toBase58()} to: ${recipient.toBase58()} mint: ${mint.toBase58()}`
                    )
                    return signature;
                }
                return signature;
            } catch (error) {
                console.log(error)
                retries++;
            }
        } while (retries < 3);
        return null;
    }
}