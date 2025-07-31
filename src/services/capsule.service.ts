import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { Capsule, InactivityBased, TimeBased } from "../contract/contract"
import { logger } from "../config/logger";
import {createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { connection } from "../config/config";
import { BN, Wallet } from "@coral-xyz/anchor";
import { anchorWallet } from "../helpers/utils";
import { unlockArgs } from "@metaplex-foundation/mpl-token-metadata";

export class CapsuleService  {
    private wallet: Wallet;
    private capsule: Capsule;
    private connection: Connection;

    constructor(secretKey: string) {
        this.connection = connection;
        this.capsule = new Capsule()
        this.wallet = anchorWallet(secretKey);
        this.capsule.set_provider(this.wallet)
    }

    async create_crypto_capsule(
        owner: PublicKey,
        asset_mint: PublicKey,
        amount: number,
        unlock_type: 'time_based' | 'inactivity_based',
        unlock_timestamp: number | null,
        inactivity_period: number | null,
        beneficiary: PublicKey,
      ): Promise<string> {
        let retries = 0;
        const maxRetries = 3;

        do {
          try {
            let capsule_unlock_type = TimeBased;
            let capsule_unlock_timestamp: BN | null;
            let capsule_inactivity_period: BN | null;

            // Validate unlock type
            // if (unlock_type === 'time_based') {
            //     capsule_unlock_type = TimeBased;
            //     if (unlock_timestamp == null) {
            //         logger.warn('Unlock timestamp required for time_based capsule');
            //         throw new Error('Unlock timestamp required for time_based capsule');
            //     }
            //     if (unlock_timestamp <= 0) {
            //         logger.warn(`Invalid unlock timestamp: ${unlock_timestamp}`);
            //         throw new Error('Invalid unlock timestamp');
            //     }
            // } else if (unlock_type === 'inactivity_based') {
            //     capsule_unlock_type = InactivityBased;
            //     if (inactivity_period == null) {
            //         logger.warn('Inactivity period required for inactivity_based capsule');
            //         throw new Error('Inactivity period required for inactivity_based capsule');
            //     }
            //     if (!Number.isFinite(inactivity_period) || inactivity_period <= 0) {
            //         logger.warn(`Invalid inactivity period: ${inactivity_period}`);
            //         throw new Error('Invalid inactivity period');
            //     }
            // } else {
            //     logger.warn(`Invalid unlock type: ${unlock_type}`);
            //     throw new Error('Invalid unlock type');
            // }

            console.log('utime', unlock_timestamp, 'inp', inactivity_period)

            if (amount <= 0) {
                logger.warn('Amount must be positive');
                throw new Error('Provide a positive amount to lock');
            }

            const mintInfo = await getMint(this.connection, asset_mint)
            let actualAmount = Math.pow(10, mintInfo.decimals) * amount

            const transaction = new Transaction();

            // Create beneficiary token account if it doesn't exist
            logger.info('Creating token account for beneficiary');
            const beneficiary_token_account = await getAssociatedTokenAddress(asset_mint, beneficiary);
            const beneficiaryAccountInfo = await this.connection.getAccountInfo(beneficiary_token_account);
            if (!beneficiaryAccountInfo) {
                logger.info('Creating beneficiary token account');
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        owner,
                        beneficiary_token_account,
                        beneficiary,
                        asset_mint
                    )
                );
            }

            logger.info('get owner token account')
            const owner_token_account = await getAssociatedTokenAddress(asset_mint, owner);

            // Create capsule instruction
            logger.info('Calling crypto capsule instruction');
            const capsuleID = await this.capsule.generate_capsule_id();
            console.log(owner.toBase58(), owner_token_account.toBase58(), capsuleID, asset_mint.toBase58(), actualAmount, capsule_unlock_type, unlock_timestamp, inactivity_period, beneficiary.toBase58())
            const create_capsule_instruction = await this.capsule.create_crypto_capsule_instruction(
                owner,
                owner_token_account,
                capsuleID,
                asset_mint,
                new BN(actualAmount),
                capsule_unlock_type,
                unlock_timestamp != null ? new BN(unlock_timestamp) : null,
                inactivity_period != null ? new BN(inactivity_period) : null,
                beneficiary
            );
            // transaction.add(create_capsule_instruction);
            console.log(create_capsule_instruction)

            // Add small SOL transfer (optional, for testing)
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: owner,
                    toPubkey: beneficiary,
                    lamports: 0.0003 * LAMPORTS_PER_SOL,
                })
            );

            const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.wallet.payer]);
            logger.info(
                `Crypto capsule created: ID=${capsuleID}, owner=${owner.toBase58()}, beneficiary=${beneficiary.toBase58()}, signature=${signature}`
            );
            return signature;
          } catch (error: any) {
            logger.error(`Attempt ${retries + 1} failed: ${error.message}`);
            retries++;
            if (retries >= maxRetries) {
              throw new Error(`Failed to create crypto capsule after ${maxRetries} attempts: ${error.message}`);
            }
          }
        } while (retries < maxRetries);
        throw new Error('Failed to create crypto capsule: max retries exceeded');
    }
}