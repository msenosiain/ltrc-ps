// Migración: asignar deporte 'rugby' y categoría 'plantel_superior' a jugadores sin esos campos
// Uso: node scripts/migrate-player-sport.js

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'ltrc-ps';

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const players = db.collection('players');

  const sportResult = await players.updateMany(
    { sport: { $exists: false } },
    { $set: { sport: 'rugby' } }
  );
  console.log(`Sport actualizado: ${sportResult.modifiedCount} jugadores`);

  const categoryResult = await players.updateMany(
    { category: { $exists: false } },
    { $set: { category: 'plantel_superior' } }
  );
  console.log(
    `Categoría actualizada: ${categoryResult.modifiedCount} jugadores`
  );

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
