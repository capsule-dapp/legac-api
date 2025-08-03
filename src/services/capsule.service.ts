import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { Capsule, InactivityBased, TimeBased } from "../contract/contract"
import { logger } from "../config/logger";
import {createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getAssociatedTokenAddressSync, getMint } from "@solana/spl-token";
import { connection } from "../config/config";
import { BN, Wallet } from "@coral-xyz/anchor";
import { anchorWallet } from "../helpers/utils";

export interface CapsuleData {
    owner: string;
    capsuleID: string;
    capsuleType: string;
    beneficiary: string;
    mint: string;
    amount: number;
    assetUri?: string;
    documentFormat?: string;
    encryptedMessage?: string;
    unlockTimestamp?: string,
    assetVault?: string;
    isLocked: boolean;
}

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
      ): Promise<{signature: string; capsuleID: string; capsulePDA: string}> {
        let retries = 0;
        const maxRetries = 3;

        do {
          try {
            let capsule_unlock_type;

            // Validate unlock type
            if (unlock_type === 'time_based') {
                capsule_unlock_type = TimeBased;
                if (unlock_timestamp == null) {
                    logger.warn('Unlock timestamp required for time_based capsule');
                    throw new Error('Unlock timestamp required for time_based capsule');
                }
                if (unlock_timestamp <= 0) {
                    logger.warn(`Invalid unlock timestamp: ${unlock_timestamp}`);
                    throw new Error('Invalid unlock timestamp');
                }
            } else if (unlock_type === 'inactivity_based') {
                capsule_unlock_type = InactivityBased;
                if (inactivity_period == null) {
                    logger.warn('Inactivity period required for inactivity_based capsule');
                    throw new Error('Inactivity period required for inactivity_based capsule');
                }
                if (!Number.isFinite(inactivity_period) || inactivity_period <= 0) {
                    logger.warn(`Invalid inactivity period: ${inactivity_period}`);
                    throw new Error('Invalid inactivity period');
                }
            } else {
                logger.warn(`Invalid unlock type: ${unlock_type}`);
                throw new Error('Invalid unlock type');
            }

            if (amount <= 0) {
                logger.warn('Amount must be positive');
                throw new Error('Provide a positive amount to lock');
            }

            const owner_balance = await this.connection.getBalance(owner);
            if (owner_balance <= 0) {
                logger.warn(`Owner wallet balance is zero: ${owner.toBase58()}`);
                throw new Error('Owner wallet balance is zero');
            }

            const mintInfo = await getMint(this.connection, asset_mint)
            let actualAmount = Math.pow(10, mintInfo.decimals) * amount

            const transaction = new Transaction();

            // Add small SOL transfer (optional, for testing)
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: owner,
                    toPubkey: beneficiary,
                    lamports: 0.003 * LAMPORTS_PER_SOL,
                })
            );

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
            const owner_token_balance = await this.connection.getTokenAccountBalance(owner_token_account);
            if (owner_token_balance.value.uiAmount == null || owner_token_balance.value.uiAmount < amount)
                throw new Error("Insufficient balance")

            // Create capsule instruction
            logger.info('Calling crypto capsule instruction');
            const capsuleID = await this.capsule.generate_capsule_id();
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
            transaction.add(create_capsule_instruction);

            const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.wallet.payer]);
            logger.info(
                `Crypto capsule created: ID=${capsuleID}, owner=${owner.toBase58()}, beneficiary=${beneficiary.toBase58()}, signature=${signature}`
            );
            return {signature, capsuleID, capsulePDA: this.capsule.get_capsule_pda(owner, capsuleID).toBase58()};
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

    async create_native_capsule(
        owner: PublicKey,
        amount: number,
        unlock_type: 'time_based' | 'inactivity_based',
        unlock_timestamp: number | null,
        inactivity_period: number | null,
        beneficiary: PublicKey,
      ): Promise<{signature: string; capsuleID: string; capsulePDA: string}> {
        let retries = 0;
        const maxRetries = 3;

        do {
          try {
            let capsule_unlock_type;

            // Validate unlock type
            if (unlock_type === 'time_based') {
                capsule_unlock_type = TimeBased;
                if (unlock_timestamp == null) {
                    logger.warn('Unlock timestamp required for time_based capsule');
                    throw new Error('Unlock timestamp required for time_based capsule');
                }
                if (unlock_timestamp <= 0) {
                    logger.warn(`Invalid unlock timestamp: ${unlock_timestamp}`);
                    throw new Error('Invalid unlock timestamp');
                }
            } else if (unlock_type === 'inactivity_based') {
                capsule_unlock_type = InactivityBased;
                if (inactivity_period == null) {
                    logger.warn('Inactivity period required for inactivity_based capsule');
                    throw new Error('Inactivity period required for inactivity_based capsule');
                }
                if (!Number.isFinite(inactivity_period) || inactivity_period <= 0) {
                    logger.warn(`Invalid inactivity period: ${inactivity_period}`);
                    throw new Error('Invalid inactivity period');
                }
            } else {
                logger.warn(`Invalid unlock type: ${unlock_type}`);
                throw new Error('Invalid unlock type');
            }

            if (amount <= 0) {
                logger.warn('Amount must be positive');
                throw new Error('Provide a positive amount to lock');
            }

            const owner_balance = await this.connection.getBalance(owner);
            if (owner_balance <= 0 || owner_balance < amount * LAMPORTS_PER_SOL) {
                logger.warn(`Owner wallet balance is insufficient: ${owner.toBase58()}`);
                throw new Error('Owner wallet balance is insufficient');
            }

            const transaction = new Transaction();

            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: owner,
                    toPubkey: beneficiary,
                    lamports: Math.floor(0.003 * LAMPORTS_PER_SOL),
                })
            );

            // Create capsule instruction
            let actualAmount = amount * LAMPORTS_PER_SOL;
            logger.info('Calling crypto capsule instruction');
            const capsuleID = await this.capsule.generate_capsule_id();
            const create_capsule_instruction = await this.capsule.create_sol_capsule_instruction(
                owner,
                capsuleID,
                new BN(actualAmount),
                capsule_unlock_type,
                unlock_timestamp != null ? new BN(unlock_timestamp) : null,
                inactivity_period != null ? new BN(inactivity_period) : null,
                beneficiary
            );
            transaction.add(create_capsule_instruction);

            const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.wallet.payer]);
            logger.info(
                `Crypto capsule created: ID=${capsuleID}, owner=${owner.toBase58()}, beneficiary=${beneficiary.toBase58()}, signature=${signature}`
            );
            return {signature, capsuleID, capsulePDA: this.capsule.get_capsule_pda(owner, capsuleID).toBase58()};
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

    async create_nft_capsule(
        owner: PublicKey,
        asset_mint: PublicKey,
        unlock_type: 'time_based' | 'inactivity_based',
        unlock_timestamp: number | null,
        inactivity_period: number | null,
        beneficiary: PublicKey,
      ): Promise<{signature: string; capsuleID: string; capsulePDA: string}> {
        let retries = 0;
        const maxRetries = 3;

        do {
          try {
            let capsule_unlock_type;

            // Validate unlock type
            if (unlock_type === 'time_based') {
                capsule_unlock_type = TimeBased;
                if (unlock_timestamp == null) {
                    logger.warn('Unlock timestamp required for time_based capsule');
                    throw new Error('Unlock timestamp required for time_based capsule');
                }
                if (unlock_timestamp <= 0) {
                    logger.warn(`Invalid unlock timestamp: ${unlock_timestamp}`);
                    throw new Error('Invalid unlock timestamp');
                }
            } else if (unlock_type === 'inactivity_based') {
                capsule_unlock_type = InactivityBased;
                if (inactivity_period == null) {
                    logger.warn('Inactivity period required for inactivity_based capsule');
                    throw new Error('Inactivity period required for inactivity_based capsule');
                }
                if (!Number.isFinite(inactivity_period) || inactivity_period <= 0) {
                    logger.warn(`Invalid inactivity period: ${inactivity_period}`);
                    throw new Error('Invalid inactivity period');
                }
            } else {
                logger.warn(`Invalid unlock type: ${unlock_type}`);
                throw new Error('Invalid unlock type');
            }

            const owner_balance = await this.connection.getBalance(owner);
            if (owner_balance <= 0) {
                logger.warn(`Owner wallet balance is zero: ${owner.toBase58()}`);
                throw new Error('Owner wallet balance is zero');
            }

            const transaction = new Transaction();


            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: owner,
                    toPubkey: beneficiary,
                    lamports: 0.003 * LAMPORTS_PER_SOL,
                })
            );

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
            const owner_token_balance = await this.connection.getTokenAccountBalance(owner_token_account);
            if (owner_token_balance.value.uiAmount == null || owner_token_balance.value.uiAmount < 1)
                throw new Error("Insufficient balance")

            // Create capsule instruction
            logger.info('Calling nft capsule instruction');
            const capsuleID = await this.capsule.generate_capsule_id();
            const create_capsule_instruction = await this.capsule.create_nft_capsule_instruction(
                owner,
                owner_token_account,
                capsuleID,
                asset_mint,
                capsule_unlock_type,
                unlock_timestamp != null ? new BN(unlock_timestamp) : null,
                inactivity_period != null ? new BN(inactivity_period) : null,
                beneficiary
            );
            transaction.add(create_capsule_instruction);

            const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.wallet.payer]);
            logger.info(
                `Crypto capsule created: ID=${capsuleID}, owner=${owner.toBase58()}, beneficiary=${beneficiary.toBase58()}, signature=${signature}`
            );
            return {signature, capsuleID, capsulePDA: this.capsule.get_capsule_pda(owner, capsuleID).toBase58()};
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

    async get_capsule(capsule_address: string) {
        const capsule = await this.capsule.program().account.capsule.fetch(capsule_address)
        if ('cryptocurrency' in capsule.assetType) {
            const mintInfo = await getMint(this.connection, capsule.assetMint!)
            const uiAmount = capsule.amount.toNumber() / Math.pow(10, mintInfo.decimals)
            return {
                owner: capsule.owner.toBase58(),
                capsuleID: capsule.capsuleId,
                capsuleType: 'Cryptocurrency',
                amount: uiAmount,
                beneficiary: capsule.beneficiary.toBase58(),
                mint: capsule.assetMint!.toBase58(),
                assetVault: capsule.assetTokenVault?.toBase58(),
                unlockTimestamp: capsule?.unlockTimestamp,
                isLocked: capsule.isLocked,
            } as CapsuleData
        }

        if ('native' in capsule.assetType) {
            const uiAmount = capsule.amount.toNumber() / LAMPORTS_PER_SOL
            return {
                owner: capsule.owner.toBase58(),
                capsuleID: capsule.capsuleId,
                capsuleType: 'Native',
                amount: uiAmount,
                beneficiary: capsule.beneficiary.toBase58(),
                unlockTimestamp: capsule?.unlockTimestamp,
                mint: capsule.assetMint!.toBase58(),
                isLocked: capsule.isLocked,
            } as CapsuleData
        }

        if ('nft' in capsule.assetType) {
            return {
                owner: capsule.owner.toBase58(),
                capsuleID: capsule.capsuleId,
                capsuleType: 'NFT',
                beneficiary: capsule.beneficiary.toBase58(),
                mint: capsule.assetMint!.toBase58(),
                assetVault: capsule.assetNftVault?.toBase58(),
                unlockTimestamp: capsule?.unlockTimestamp,
                isLocked: capsule.isLocked,
            } as CapsuleData
        }
    }

    async execute_release(capsule_address: string) {
        let retries = 0;
        const maxRetries = 3;
        do {
            try {
                const capsule = await this.get_capsule(capsule_address)
                if (capsule?.isLocked) {
                    throw new Error(`Capsule ${capsule_address} is locked`)
                }

                const tx = new Transaction();

                if (capsule?.capsuleType == 'Cryptocurrency') {
                    logger.info('Executing Release for Cryptocurrency')
                    const cryptoIx = await this.capsule.execute_crypto_release(
                        new PublicKey(capsule.owner),
                        capsule.capsuleID,
                        new PublicKey(capsule.beneficiary),
                        new PublicKey(capsule.assetVault!),
                        getAssociatedTokenAddressSync(new PublicKey(capsule.mint), new PublicKey(capsule.beneficiary)),
                        new PublicKey(capsule.mint)
                    )
                    tx.add(cryptoIx)
                }

                if (capsule?.capsuleType == 'NFT') {
                    logger.info('Executing Release for NFT')
                    const nftIx = await this.capsule.execute_nft_release(
                        new PublicKey(capsule.owner),
                        capsule.capsuleID,
                        new PublicKey(capsule.beneficiary),
                        new PublicKey(capsule.assetVault!),
                        getAssociatedTokenAddressSync(new PublicKey(capsule.mint), new PublicKey(capsule.beneficiary)),
                        new PublicKey(capsule.mint)
                    )
                    tx.add(nftIx)
                }

                if (capsule?.capsuleType == 'Native') {
                    logger.info('Executing Release for SOLANA')
                    const nativeIx = await this.capsule.execute_native_release(
                        new PublicKey(capsule.owner),
                        capsule.capsuleID,
                        new PublicKey(capsule.beneficiary)
                    )
                    tx.add(nativeIx)
                }

                const signature = await sendAndConfirmTransaction(this.connection, tx, [this.wallet.payer]);
                logger.info(`Capsule release executed successfully: ${capsule_address}`);
                return signature;
            } catch (error: any) {
                logger.error(`Attempt ${retries + 1} failed: ${error.message}`);
                retries++;
                if (retries >= maxRetries) {
                    throw new Error(`Failed to execute capsule release after ${maxRetries} attempts: ${error.message}`);
                }
            }
        } while (retries < maxRetries);

    }
}