import { fetchAllDigitalAssetWithTokenByOwner } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { publicKey } from "@metaplex-foundation/umi";
import { connection } from "../config/config";
import { PublicKey } from '@solana/web3.js';

export type TokenAsset = {
    mint: string;
    decimals: number;
    symbol: string;
    name: string;
    uri: string;
}

export class TokenService {
    private umi;
    private connection;

    constructor() {
        this.connection = connection;
        this.umi = createUmi(this.connection)
    }

    async getWalletTokens(address: string): Promise<TokenAsset[]> {
        const assets = await fetchAllDigitalAssetWithTokenByOwner(
            this.umi,
            publicKey(address)
        )
        return Promise.all(
            assets.map(async asset => {
                const account = getAssociatedTokenAddressSync(
                    new PublicKey(asset.mint.publicKey),
                    new PublicKey(address)
                );

                const info = await this.connection.getTokenAccountBalance(account);

                return {
                    mint: asset.mint.publicKey,
                    decimals: asset.mint.decimals,
                    symbol: asset.metadata.symbol,
                    name: asset.metadata.name,
                    uri: asset.metadata.uri,
                    balance: info.value.uiAmount
                } as TokenAsset;
            })
        );
    }

    async getWalletNFTs(address: string) {

    }
}