import { config } from "../config/config";

export class BirdeyeService {
    private baseUrl: string;
    private headers: object;

    constructor() {
        if (!config.birdeyeKey) {
            throw new Error("Birdeye API key is not configured");
        }

        this.baseUrl = "https://public-api.birdeye.so";
        this.headers = {
            'accept': 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': config.birdeyeKey,
        };
    }

    async getTokenPrice(mint: string): Promise<any> {
        if (!mint) {
            throw new Error('Mint address is required');
        }

        const url = `${this.baseUrl}/defi/price?address=${mint}&ui_amount_mode=raw`;
        const response = await fetch(url, { method: 'GET', headers: this.headers as HeadersInit });
        if (!response.ok) {
            throw new Error('Failed to fetch token price');
        }
        const data = await response.json();
        return {
            priceInUSDChange24h: data.data.priceChange24h,
            priceInNative: data.data.priceInNative,
            priceInUSD: data.data.value,
        };
    }
}