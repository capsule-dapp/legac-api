import { pool } from "../config/database";
import { CreateCapsuleType } from "../schemas/capsule.schema";

export class CapsuleRepository {
    async findAll(userID: number) {

    }

    async create(userID: number, capsule: CreateCapsuleType) {
        try {
            await pool.query("BEGIN")
            const createCapsuleQuery = `
                INSERT INTO capsule (capsule_type, capsule_unique_id, capsule_address, heir_id, multisig_enabled)
                VALUES($1, $2, $3, $4, $5)
            `;
            const capsuleValues = [capsule.capsule_type, capsule.capsule_unique_id, capsule.capsule_address, capsule.heir_id, capsule.multisig_enabled];
            const capsuleResult = await pool.query(createCapsuleQuery, capsuleValues);

            const userCapsuleQuery = `
                INSERT INTO user_capsules (user_id, capsule_id)
                VALUES($1, $2)
            `;
            const userCapsuleValues = [userID, capsuleResult.rows[0].id]
            await pool.query(userCapsuleQuery, userCapsuleValues)
            await pool.query('COMMIT')
        } catch (error) {
            await pool.query('COMMIT')
            throw error
        }
    }
}