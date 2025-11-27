// config/db.js
const { PrismaClient } = require('@prisma/client');
const { sendTelegramAlert } = require("./notifier");

const prisma = new PrismaClient();

async function testDBConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');

    if (process.env.NODE_ENV === "production") {
      await sendTelegramAlert("✅ UBMA incubator Connected to PostgreSQL via Prisma with success", "localhost", "System");
    }

    return true;
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL via Prisma:', err);

    if (process.env.NODE_ENV === "production") {
      await sendTelegramAlert("❌ UBMA incubator to connect to PostgreSQL via Prisma", "localhost", "System");
    }

    return false;
  }
}

module.exports = { prisma, testDBConnection };
