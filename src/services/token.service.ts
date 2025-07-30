import { fetchAllDigitalAssetWithTokenByOwner } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { publicKey } from "@metaplex-foundation/umi";
import { connection } from "../config/config";
import { PublicKey } from '@solana/web3.js';
import { BirdeyeService } from './birdeye.service';

export interface TokenAsset {
    mint: string;
    decimals: number;
    symbol: string;
    name: string;
    uri: string;
    balance: number | null;
}

export interface NFTAsset {
    mint: string;
    symbol: string;
    name: string;
    uri: string;
    edition?: string | null;
    collection?: string | null;
}

const birdeyeService = new BirdeyeService();

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

        const tokenAssets = assets.filter(asset => asset.mint.decimals > 0);
        return Promise.all(
            tokenAssets.map(async asset => {
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
        const assets = await fetchAllDigitalAssetWithTokenByOwner(
            this.umi,
            publicKey(address)
        )

        const nftAssets = assets.filter(asset => asset.mint.decimals == 0);
        return Promise.all(
            nftAssets.map(async asset => {
                return {
                    mint: asset.mint.publicKey,
                    symbol: asset.metadata.symbol,
                    name: asset.metadata.name,
                    uri: asset.metadata.uri,
                    edition: asset.edition?.publicKey,
                    collection: asset.metadata.collection.__option == 'Some' ? asset.metadata.collection.value : null
                } as NFTAsset;
            })
        );
    }

    async getTokenPrice(mint: string): Promise<any> {
        const response = await birdeyeService.getTokenPrice(mint).catch(error => {
            throw new Error(`Failed to fetch token price: ${error.message}`);
        });
        console.log(`Token price for ${mint}:`, response);
        return response;
    }
}