import { pool } from "../config/database";

export class OtpRepository {
    async create(email: string, code: string, expires_in: Date) {
        const query = `
            INSERT INTO otps (email, code, expires_in)
            VALUES ($1, $2, $3)
        `;

        await pool.query(query, [email, code, expires_in])
    }

    async findByEmail(email: string) {
        const query = `
            SELECT * FROM otps WHERE email = $1 AND expires_in > CURRENT_TIMESTAMP
        `;
        const result = await pool.query(query, [email])
        return result.rows[0];
    }

    async delete(email: string) {
        const query = `
            DELETE FROM otps WHERE email = $1
        `;
        const result = await pool.query(query, [email])
        return result.rows[0];
    }
}