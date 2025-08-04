# Legac: Decentralized Capsule Inheritance Platform

Legac is a decentralized platform built on the Solana blockchain, enabling users to create time-based or inactivity-based capsules that lock assets (e.g., SPL tokens) for designated heirs. Heirs must verify their identity by answering security questions before claiming assets. The backend uses Node.js, Express, and PostgreSQL, with a React Native mobile app for the frontend. The platform supports multiple heirs per capsule, temporary password authentication, and secure email notifications.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)

## Features
- **Capsule Creation**: Users (owners) can create capsules to lock SPL tokens with time-based or inactivity-based unlock conditions.
- **Single Heirs**: Assign heirs to a single capsule, receiving a notification with temporary login credentials.
- **Security Questions**: Heirs must answer multiple security questions to verify their identity before claiming assets.
- **Solana Integration**: Built with Anchor for Solana smart contracts, handling token transfers and capsule management.
- **Authentication**: Role-based access for owners and heirs, with temporary passwords (expiring in 2 hours) for heirs.
- **Notifications**: Email notifications sent to heirs with login credentials and app download links.
- **React Native Frontend**: Mobile app for heirs to log in, answer security questions, and claim capsules.
- **Security**: JWT authentication, bcrypt for passwords and answers.

## Architecture
- **Backend**: Node.js with Express, TypeScript, PostgreSQL, and Anchor for Solana integration.
- **Blockchain**: Solana devnet for smart contracts and token management.
- **Database**: PostgreSQL with tables for users, capsules, heirs, security questions.
- **Services**:
  - `CapsuleService`: Handles capsule creation and Solana transactions.
  - `EmailService`: Sends notifications using Nodemailer.
  - `AuthService`: Manages temporary passwords and authentication.
- **External Dependencies**: Redis for caching, Winston for logging, Zod for input validation.

## Prerequisites
- Node.js: v18.x or higher
- PostgreSQL: v14.x or higher
- Redis: v6.x or higher
- Solana CLI: For devnet interactions
- Anchor CLI: v0.29.0 for Solana smart contracts
- React Native: For the mobile app
- Git: For version control
- NPM: For package management

## Installation

1. **Clone the Repository**:
   ```bash
    git clone https://github.com/capsule-dapp/legac-api.git
    cd legac-api
   ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Setup Postgres**
    ```bash
    psql -U postgres -c "CREATE DATABASE legac;"
    ```

5. **Setup Redis**
    ```bash
    sudo apt-get install redis-server
    sudo systemctl enable redis
    sudo systemctl start redis
    ```

## Configuration

1. **Create `.env` File: Copy `.env.example` to `.env` and update with your configuration:**
    ```env
    PORT=3000
    DATABASE_URL=<DATABASE URL>
    JWT_SECRET=<SECRET>
    REDIS_URL=<REDIS URL>
    SMTP_HOST=<SMTP HOST>
    SMTP_PORT=<SMTP PORT>
    SMTP_SECURE=<SMTP SECURE>
    SMTP_USER=<SMTP USERNAME>
    SMTP_PASS=<SMTP PASSWORD>
    RPC_ENDPOINT=<RPC URL>
    ENCRYPTION_KEY=<ENC KEY>
    BIRDEYE_KEY=<BIRDEYE KEY>
    ```

### Running the Application

1. Start the Backend
    ```bash
    npm run build
    npm run dev
    ```