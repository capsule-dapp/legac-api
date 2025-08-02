import { QueryResult } from "pg";
import { CreateHeir } from "../schemas/heirs.schema";
import { pool } from "../config/database";
import { HeirResponse } from "../dtos/heirs.dtos";

interface Heir {
    id: number
    user_id: number,
    fullname: string
    email: string
    title: string
    age: string
    wallet_address: string,
    wallet_secret: string,
    temporary_password?: string,
    password_expiry?: Date,
    check_in?: Date
}

export class HeirRepository {
    async create(heir: CreateHeir, user_id: number, wallet_address: string, wallet_secret: string) {
        try {
            const query = `
            INSERT INTO heirs (user_id, fullname, email, title, state, country, dob, age, wallet_address, wallet_secret)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const values = [user_id, heir.fullname, heir.email, heir.title, heir.state, heir.country, heir.dob, heir.age, wallet_address, wallet_secret];
        const result: QueryResult<HeirResponse> = await pool.query(query, values);
        return result.rows[0];
        } catch(error) {
            throw new Error(error as any)
        }
    }

    async find(id: number, user_id: number) {
        const query = `
            SELECT * FROM heirs
            WHERE id = $1 AND user_id = $2
        `;

        const values = [id, user_id];
        const result: QueryResult<HeirResponse> = await pool.query(query, values);
        return result.rows[0];
    }

    async findById(id: number) {
        const query = `
            SELECT * FROM heirs
            WHERE id = $1
        `;

        const values = [id];
        const result: QueryResult<HeirResponse> = await pool.query(query, values);
        return result.rows[0];
    }

    async findByUser(user_id: number) {
        const query = `
            SELECT id, user_id, fullname, email, title, state, country, dob, age, wallet_address FROM heirs
            WHERE user_id = $1
        `;

        const values = [user_id];
        const result: QueryResult<HeirResponse> = await pool.query(query, values);
        return result.rows[0];
    }

    async findByEmail(email: string) {
        const query = `
            SELECT * FROM heirs
            WHERE email = $1
        `;

        const values = [email];
        const result: QueryResult = await pool.query(query, values);
        return result.rows[0];
    }

    async updateUniquePassword(heirID: number, password: string) {
        const query = `
            UPDATE heirs
            SET temporary_password = $1,
                password_expiry = $2
            WHERE id = $3;
        `;

        await pool.query(query, [password, heirID])
    }
}