/**
 * Migration: rename role 'user' → 'manager' in all users
 *
 * Usage:
 *   node scripts/migrate-role-user-to-manager.js
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'ltrc-ps';

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const users = db.collection('users');

  const result = await users.updateMany(
    { roles: 'user' },
    { $set: { 'roles.$[elem]': 'manager' } },
    { arrayFilters: [{ elem: { $eq: 'user' } }] }
  );

  console.log(
    `Migrated ${result.modifiedCount} users: role 'user' → 'manager'`
  );
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
