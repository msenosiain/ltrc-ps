// Migración: asignar sports: [] y categories: [] a usuarios existentes que no tengan estos campos
// Uso: node scripts/migrate-user-sports-categories.js

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'ltrc-ps';

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const users = db.collection('users');

  const result = await users.updateMany(
    { sports: { $exists: false } },
    { $set: { sports: [], categories: [] } }
  );

  console.log(`Updated ${result.modifiedCount} users with sports/categories defaults`);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
