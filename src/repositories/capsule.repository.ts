import { QueryResult } from "pg";
import { pool } from "../config/database";
import { CreateCapsuleType } from "../schemas/capsule.schema";

export class CapsuleRepository {
    async findAll(userID: number) {
        const query = `
            SELECT capsules.id, capsules.capsule_type, capsules.capsule_unique_id, capsules.capsule_address, capsules.heir_id FROM capsules LEFT JOIN user_capsules
            ON capsules.id = user_capsules.capsule_id
            WHERE user_capsules.user_id = $1
        `;

        const result = await pool.query(query, [userID]);
        return result.rows
    }

    async findSecurityQuestions(capsule_id: number) {
        const query = `
            SELECT question, answer FROM capsule_security_questions
            WHERE capsule_id = $1
        `;

        const result = await pool.query(query, [capsule_id]);
        return result.rows
    }

    async create(userID: number, capsule: CreateCapsuleType) {
        const createCapsuleQuery = `
            INSERT INTO capsules (capsule_type, capsule_unique_id, capsule_address, heir_id)
            VALUES($1, $2, $3, $4)
            RETURNING *
        `;
        const capsuleValues = [capsule.capsule_type, capsule.capsule_unique_id, capsule.capsule_address, capsule.heir_id];
        const capsuleResult = await pool.query(createCapsuleQuery, capsuleValues);
        const capsuleID = capsuleResult.rows[0].id

        const userCapsuleQuery = `
            INSERT INTO user_capsules (user_id, capsule_id)
            VALUES($1, $2)
        `;
        const userCapsuleValues = [userID, capsuleID]
        await pool.query(userCapsuleQuery, userCapsuleValues)

        for (let security_question of capsule.security_questions) {
            const securityQuestionQuery = `
                INSERT INTO capsule_security_questions (capsule_id, question, answer)
                VALUES ($1, $2, $3)
            `
            await pool.query(
                securityQuestionQuery,
                [capsuleID, security_question.question, security_question.answer]
            )
        }
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

    async updateStatus(capsuleID: string, status: string) {
        const query = `
            UPDATE capsules SET status = $1
            WHERE id = $2
        `;
        const values = [status, capsuleID];
        await pool.query(query, values);
    }

    async findAllCapsuleAssociation() {
        const query = `
            SELECT users.email as user_email, users.wallet_address as user_address, users.wallet_secret as user_secret, capsules.id as capsule_id, capsules.capsule_unique_id, capsules.capsule_address, heirs.id as heir_id, heirs.fullname as heir_fullname, heirs.wallet_address as heir_address, heirs.wallet_secret as heir_secret, heirs.email as heir_email FROM capsules LEFT JOIN user_capsules ON capsules.id = user_capsules.capsule_id LEFT JOIN users ON user_capsules.user_id = users.id  LEFT JOIN heirs ON heirs.id = capsules.heir_id WHERE capsules.status = 'locked';
        `;
        const result = await pool.query(query)
        return result.rows;
    }
}