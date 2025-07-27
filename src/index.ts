import { TokenService } from './services/token.service';
import { swaggerSpec } from './swagger/swagger';
import authRoutes from './routes/auth.routes';
import heirRoutes from './routes/heirs.routes';
import { initDb } from './config/database';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/config';
import { logger } from './config/logger';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

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

const tokensrv = new TokenService();
tokensrv.getWalletTokens("GYUSY9r751KMeYK9JfvNJpmBtJWKzsorwPqoXhvJXao4").then(tokens => {
    console.log(tokens);
}).catch(error => {
    console.error(`Error fetching tokens: ${error.message}`);
});

// Routes
app.use('/auth', authRoutes);
app.use('/heirs', heirRoutes);
// app.use('/capsules', capsuleRoutes);

// Database initialization and server start
initDb().then(() => {
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`API docs available at http://localhost:${port}/api-docs`);
  });
}).catch((error) => {
  logger.error(`Failed to initialize database: ${error.message}`);
});