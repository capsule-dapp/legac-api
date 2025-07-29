import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { connection } from '../config/config';
import { AnchorProvider, Program, setProvider, Wallet } from '@coral-xyz/anchor';
import type { Legac } from './types';
import IDL from "./idl.json"
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

export class Capsule {
    private connection: Connection;
    private provider: AnchorProvider;

    constructor(secretKey: string) {
        this.connection = connection;
        this.provider = new AnchorProvider(this.connection, this.payer(secretKey), {commitment: "confirmed"});
        setProvider(this.provider);
    }

    payer(secretKey: string) {
        let keypair = Keypair.fromSecretKey(
            bs58.decode(secretKey)
        );
        return new Wallet(keypair)
    }

    program() {
        return new Program(IDL as Legac, this.provider) as Program<Legac>;
    }
}