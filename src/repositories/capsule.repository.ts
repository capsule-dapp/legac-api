import { QueryResult } from "pg";
import { pool } from "../config/database";
import { CreateCapsuleType } from "../schemas/capsule.schema";

export class CapsuleRepository {
    async findAll(userID: number) {

    }

    async create(userID: number, capsule: CreateCapsuleType) {
        const createCapsuleQuery = `
            INSERT INTO capsules (capsule_type, capsule_unique_id, capsule_address, heir_id, multisig_enabled)
            VALUES($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const capsuleValues = [capsule.capsule_type, capsule.capsule_unique_id, capsule.capsule_address, capsule.heir_id, capsule.multisig_enabled];
        const capsuleResult = await pool.query(createCapsuleQuery, capsuleValues);

        const userCapsuleQuery = `
            INSERT INTO user_capsules (user_id, capsule_id)
            VALUES($1, $2)
        `;
        const userCapsuleValues = [userID, capsuleResult.rows[0].id]
        await pool.query(userCapsuleQuery, userCapsuleValues)
    }

    async findById(capsule_id: number) {
        const query = `
            SELECT * FROM capsules
            WHERE capsule_id = $1
        `;

        const values = [capsule_id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findByAddress(capsule_address: string) {
        const query = `
            SELECT * FROM capsules
            WHERE capsule_address = $1
        `;

        const values = [capsule_address];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findByUniqueIdAndAddress(capsule_address: string, capsule_unique_id: string) {
        const query = `
            SELECT * FROM capsules
            WHERE capsule_address = $1 AND capsule_unique_id = $2
        `;

        const values = [capsule_address, capsule_unique_id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}