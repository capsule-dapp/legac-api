import cron from "node-cron";
import bcrypt from 'bcryptjs';
import { Capsule } from "../contract/contract";
import { pool } from "../config/database";
import { decrypt } from "../helpers/crypto";
import { anchorWallet } from "../helpers/utils";
import { PublicKey } from "@solana/web3.js";
import { logger } from "../config/logger";
import { HeirRepository } from "../repositories/heirs.repository";
import { CapsuleRepository } from "../repositories/capsule.repository";
import { EmailService } from "../services/email.service";
import { Cache } from "../config/redis";

const capsuleRepository = new CapsuleRepository()
const heirRepository = new HeirRepository()
const emailService = new EmailService()
const cacheService = new Cache();
const capsule = new Capsule();

export const capsuleLockScheduler = () => {
    try {
        cron
          .schedule("*/1 * * * *", () => {
            (async () => {
              try {
                const response = await cacheService.getOrSet(
                  `capsules:all`,
                  await capsuleRepository.findAllCapsuleAssociation(),
                  50
                );

                if (response.length > 0) {
                  for (let data of response) {
                    capsule.set_provider(anchorWallet(decrypt(data.user_secret)))
                    // console.log(await capsule.get_lock_status(new PublicKey("9ebk9U8cPbSdsTnMQEQA9m9eCkakXfJUHSnvAmHaQCPP"), data.capsule_unique_id))
                    const lock_status = true;
                    if (lock_status && data.capsule_unique_id == 'CAPSULE_011') {
                      logger.info('update capsule status')
                      await capsuleRepository.updateStatus(data.capsule_id, 'pending')

                      logger.info('generate unique password for beneficiary login')
                      const temporary_password = "Y3ir@pwieo"
                      const hased_temporary_password = await bcrypt.hash(temporary_password, 10)

                      logger.info('update beneficiary temporary password')
                      await heirRepository.updateUniquePassword(data.heir_id, hased_temporary_password)

                      logger.info('Notify beneficiary via email')
                      await emailService.sendCapsuleClaimEmail(data.heir_email, data.heir_fullname, temporary_password)
                    }
                  }
                }
              } catch(error) {
                logger.warn('Could not track and update beneficiary of capsule unlock', error)
              }
            })()
          })
          .start();
    } catch (error) {
        console.error(
          `Error running the Schedule Job alerting beneficiary if capsules are unlocked: ${error}`
        );
    }
}

// SELECT users.id, users.email as user_email, users.wallet_address as user_address, users.wallet_secret as user_secret, capsules.capsule_unique_id, capsules.capsule_address, heirs.fullname as heir_fullname, heirs.wallet_address as heir_address, heirs.wallet_secret as heir_secret, heirs.email as heir_email FROM capsules LEFT JOIN user_capsules ON capsules.id = user_capsules.capsule_id LEFT JOIN users ON user_capsules.user_id = users.id  LEFT JOIN heirs ON heirs.id = capsules.heir_id;