import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { AnchorProvider, Program, setProvider, Wallet, BN } from '@coral-xyz/anchor';
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { connection } from '../config/config';
import type { Legac } from './types';
import IDL from "./idl.json"

export const TimeBased = {timeBased: {}}
export const InactivityBased = {inactivityBased: {}};

export type UnlockType = typeof TimeBased | typeof InactivityBased

export class Capsule {
    private connection: Connection;
    private provider: AnchorProvider | null = null;

    constructor() {
        this.connection = connection;
    }

    set_provider(wallet: Wallet) {
        this.provider = new AnchorProvider(this.connection, wallet, {commitment: "confirmed"});
        setProvider(this.provider);
    }

    program(): Program<Legac> {
        if (!this.provider) {
            throw new Error('Anchor provider not provided')
        }

        const program = new Program(IDL as Legac, this.provider) as Program<Legac>;
        return program;
    }

    get_config_pda() {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            this.program().programId
        )[0]
    }

    get_capsule_pda(owner: PublicKey, capsuleID: string) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("capsule"), owner.toBuffer(), Buffer.from(capsuleID)],
            this.program().programId
        )[0]
    }

    get_capsule_token_vault_pda(mint: PublicKey, capsuleID: string) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("capsule_vault"), mint.toBuffer(), Buffer.from(capsuleID)],
            this.program().programId
        )[0]
    }

    get_capsule_nft_vault_pda(mint: PublicKey, capsuleID: string) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("capsule_nft_vault"), mint.toBuffer(), Buffer.from(capsuleID)],
            this.program().programId
        )[0]
    }

    async get_total_capsules() {
        const config = await this.program().account.config.fetch(this.get_config_pda().toBase58())
        return config.totalCapsules
    }

    async generate_capsule_id() {
        let pad;
        const total = await this.get_total_capsules();
        let count = total.toNumber() == 0 ? 1 : total.toNumber() + 1;
        if (count < 10) {
            pad = `00${count}`
        } else if (count >= 10 && count < 100) {
            pad = `0${count}`
        } else {
            pad = count
        }
        return `CAPSULE_${pad}`;
    }

    async get_lock_status(owner: PublicKey, capsuleID: string) {
        console.log(this.get_capsule_pda(owner, capsuleID), capsuleID)
        return await this.program().methods
            .getLockStatus(capsuleID)
            .accountsPartial({capsuleAccount: this.get_capsule_pda(owner, capsuleID)})
            .view()
    }

    async create_crypto_capsule_instruction(
        owner: PublicKey,
        owner_token_account: PublicKey,
        capsuleID: string,
        asset_mint: PublicKey,
        amount: number,
        unlock_type: any,
        unlock_timestamp: BN | null,
        inactivity_period: BN | null,
        beneficiary: PublicKey,
    ) {
        const ix = await this.program().methods.createCryptoCapsule(
            capsuleID,
            unlock_type,
            unlock_timestamp,
            inactivity_period,
            beneficiary,
            amount,
            false
        ).accountsPartial({
            signer: owner,
            configAccount: this.get_config_pda(),
            assetMint: asset_mint,
            assetTokenVault: this.get_capsule_token_vault_pda(asset_mint, capsuleID),
            userAssetTokenAccount: owner_token_account,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId
        }).instruction()
        return ix;
    }

    async create_nft_capsule_instruction(
        owner: PublicKey,
        owner_token_account: PublicKey,
        capsuleID: string,
        asset_mint: PublicKey,
        unlock_type: UnlockType,
        unlock_timestamp: BN | null,
        inactivity_period: BN | null,
        beneficiary: PublicKey,
    ) {
        const ix = await this.program().methods.createNftCapsule(
            capsuleID,
            unlock_type,
            unlock_timestamp,
            inactivity_period,
            beneficiary,
            false
        ).accountsPartial({
            signer: owner,
            configAccount: this.get_config_pda(),
            assetNftMint: asset_mint,
            assetNftVault: this.get_capsule_token_vault_pda(asset_mint, capsuleID),
            userAssetNftAccount: owner_token_account,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId
        }).instruction()
        return ix;
    }

    async create_document_capsule_instruction(
        owner: PublicKey,
        capsuleID: string,
        document_uri: string,
        unlock_type: UnlockType,
        document_format: string,
        unlock_timestamp: BN | null,
        inactivity_period: BN | null,
        beneficiary: PublicKey,
    ) {
        const ix = await this.program().methods.createDocumentCapsule(
            capsuleID,
            unlock_type,
            unlock_timestamp,
            inactivity_period,
            beneficiary,
            document_uri,
            document_format,
            false
        ).accountsPartial({
            signer: owner,
            configAccount: this.get_config_pda(),
            systemProgram: SystemProgram.programId
        }).instruction()
        return ix;
    }

    async create_message_capsule_instruction(
        owner: PublicKey,
        capsuleID: string,
        unlock_type: UnlockType,
        message: string,
        unlock_timestamp: BN | null,
        inactivity_period: BN | null,
        beneficiary: PublicKey,
    ) {
        const ix = await this.program().methods.createMessageCapsule(
            capsuleID,
            unlock_type,
            unlock_timestamp,
            inactivity_period,
            beneficiary,
            message,
            false
        ).accountsPartial({
            signer: owner,
            configAccount: this.get_config_pda(),
            systemProgram: SystemProgram.programId
        }).instruction()
        return ix;
    }
}