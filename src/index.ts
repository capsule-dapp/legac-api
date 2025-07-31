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

(async () => {
  const accounts = await connection.getTokenAccountsByOwner(new PublicKey("Gmxxv2WFabZuGUC5XZUPPyBbRr9qcNvciWVGscaDPh5C"), { programId: TOKEN_PROGRAM_ID })
  console.log(await connection.getTokenLargestAccounts(new PublicKey("E493htDD3KuJdDCgYyU85yop6QUAQTFeQAxECWdA2SDJ")))
  console.log(await connection.getTokenSupply(new PublicKey("E493htDD3KuJdDCgYyU85yop6QUAQTFeQAxECWdA2SDJ")))
  console.log(accounts)
})()

// spl-token create-token --decimals 9
// spl-token create-account {mint}
// spl-token mint {mint} 10000000 {account}
// spl-token transfer {mint} {amount} {recipient} --fund-recipient

// NFT
// spl-token mint 3R4Vz87DiurPyHwS9UYjiA46tiEz7cdcFCzx9Zy36h1h 1 6Dnd9UJQj6VqXvgkssR2cFd7pcHr5hmp5rcg1vnVbgd2
// spl-token transfer 3R4Vz87DiurPyHwS9UYjiA46tiEz7cdcFCzx9Zy36h1h 1 Gmxxv2WFabZuGUC5XZUPPyBbRr9qcNvciWVGscaDPh5C --fund-recipient

// spl-token mint F1TkNXiW83QaP3PzciEWLuAArWjghmiWQpLdH9QLFLVd 60000000 89GQzXGQDhiEfxuy1DL1n8cQ4iQMkekKhBSiXEnbDn4L
// spl-token transfer F1TkNXiW83QaP3PzciEWLuAArWjghmiWQpLdH9QLFLVd 100000 Gmxxv2WFabZuGUC5XZUPPyBbRr9qcNvciWVGscaDPh5C --fund-recipient

// spl-token mint E493htDD3KuJdDCgYyU85yop6QUAQTFeQAxECWdA2SDJ 10000000 CrGfr83LiowJJU8Xesf5dBpzYzGesAdgaP9ESYWekroR
// spl-token transfer E493htDD3KuJdDCgYyU85yop6QUAQTFeQAxECWdA2SDJ 500 Gmxxv2WFabZuGUC5XZUPPyBbRr9qcNvciWVGscaDPh5C --fund-recipient
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
