// Migración: asignar categoría 'plantel_superior' a todos los jugadores existentes sin categoría
// Uso: node scripts/migrate-player-categories.js

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'ltrc-ps';

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const players = db.collection('players');

  const result = await players.updateMany(
    { category: { $exists: false } },
    { $set: { category: 'plantel_superior' } }
  );

  console.log(`Jugadores actualizados: ${result.modifiedCount}`);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
