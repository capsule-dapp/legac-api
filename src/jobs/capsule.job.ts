import cron from "node-cron";
import bcrypt from 'bcryptjs';
import { Capsule } from "../contract/contract";
import { decrypt } from "../helpers/crypto";
import { anchorWallet, generateSecurePassword } from "../helpers/utils";
import { PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { logger } from "../config/logger";
import { HeirRepository } from "../repositories/heirs.repository";
import { CapsuleRepository } from "../repositories/capsule.repository";
import { EmailService } from "../services/email.service";
import { Cache } from "../config/redis";
import { connection } from "../config/config";

const capsuleRepository = new CapsuleRepository();
const heirRepository = new HeirRepository();
const emailService = new EmailService();
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
                    const wallet = anchorWallet(decrypt(data.user_secret));
                    capsule.set_provider(wallet)
                    const lock_status = await capsule.get_lock_status(new PublicKey(data.user_address), data.capsule_unique_id);
                    if (lock_status) {
                      logger.info('update capsule status')
                      await capsuleRepository.updateStatus(data.capsule_id, 'pending')

                      logger.info('generate unique password for beneficiary login')
                      const temporary_password = generateSecurePassword(12);
                      const hased_temporary_password = await bcrypt.hash(temporary_password, 10)

                      logger.info('update beneficiary temporary password')
                      await heirRepository.updateUniquePassword(data.heir_id, hased_temporary_password)

                      const capsule_data = await capsule.program().account.capsule.fetch(new PublicKey(data.capsule_address));
                      if (capsule_data.isLocked) {
                        logger.info(`unlock capsule ${data.capsule_address} for beneficiary`)
                        const unlockCapsuleIx = await capsule.check_condition_for_unlock(data.capsule_unique_id, new PublicKey(data.user_address));
                        const tx = new Transaction().add(unlockCapsuleIx);
                        const signature = await sendAndConfirmTransaction(connection, tx, [wallet.payer]);
                        console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet]`);
                      }

                      logger.info('Invalidate cache')
                      cacheService.delete(`heir:${data.heir_email}`)

                      logger.info('Notify beneficiary via email')
                      await emailService.sendCapsuleClaimEmail(data.heir_email, data.heir_fullname, temporary_password, data.capsule_address)
                    }
                  }
                }
              } catch(error) {
                logger.warn('Could not track and update beneficiary of capsule unlock')
                console.log(error)
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