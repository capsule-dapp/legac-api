import assetRoutes from './routes/asset.routes';
import capsuleRoutes from './routes/capsule.routes';
import { swaggerSpec } from './swagger/swagger';
import authRoutes from './routes/auth.routes';
import walletRoutes from './routes/wallet.routes'
import heirRoutes from './routes/heirs.routes';
import { initDb } from './config/database';
import swaggerUi from 'swagger-ui-express';
import { config, connection } from './config/config';
import { logger } from './config/logger';
import { connect } from './config/redis';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { decrypt, encrypt } from './helpers/crypto';
import { Capsule } from './contract/contract';
import { CapsuleService } from './services/capsule.service';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { capsuleLockScheduler } from './jobs/capsule.job';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// load environment variables
dotenv.config();

const app = express();
const port = config.port;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// Routes
app.use('/auth', authRoutes);
app.use('/heirs', heirRoutes);
app.use('/assets', assetRoutes);
app.use('/wallets', walletRoutes);
app.use('/capsules', capsuleRoutes);

// spl-token create-token --decimals 9
// spl-token create-account {mint}
// spl-token mint {mint} 10000000 {account}
// spl-token transfer {mint} {amount} {recipient} --fund-recipient

// NFT
// spl-token mint r8sYkgTustBp2kAoDHrsUbanVi4DVV38BSWSGzmcztF 1 DQAZ66d36HXDQpC1bxo28HJV3xxsaNr15AcMpW9HibtS
// spl-token transfer r8sYkgTustBp2kAoDHrsUbanVi4DVV38BSWSGzmcztF 1 Gmxxv2WFabZuGUC5XZUPPyBbRr9qcNvciWVGscaDPh5C --fund-recipient

// spl-token mint F1TkNXiW83QaP3PzciEWLuAArWjghmiWQpLdH9QLFLVd 60000000 DQAZ66d36HXDQpC1bxo28HJV3xxsaNr15AcMpW9HibtS
// spl-token transfer F1TkNXiW83QaP3PzciEWLuAArWjghmiWQpLdH9QLFLVd 100000 Gmxxv2WFabZuGUC5XZUPPyBbRr9qcNvciWVGscaDPh5C --fund-recipient

// spl-token mint 7MoPxTt1sMGZRTC9mv69ZABjbB6cAmsGSYkuv7UPCLXL 10000000 FoPyRnruujZrpPqM41AkU9fHpf6aM53xGStinFxeTwAf
// spl-token transfer 7MoPxTt1sMGZRTC9mv69ZABjbB6cAmsGSYkuv7UPCLXL 5000 Gmxxv2WFabZuGUC5XZUPPyBbRr9qcNvciWVGscaDPh5C --fund-recipient
// register jobs
capsuleLockScheduler()

connect()
  .then(res => logger.info('redis connected'))
  .catch(err => logger.error(`Failed to initialize redis: ${err}`))


// Database initialization and server start
initDb().then(() => {
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`API docs available at http://localhost:${port}/api-docs`);
  });
}).catch((error) => {
  logger.error(`Failed to initialize database: ${error.message}`);
});
