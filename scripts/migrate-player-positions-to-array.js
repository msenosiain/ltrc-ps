// Migración: convertir position + alternatePosition (campos individuales) a positions (array)
// Uso: node scripts/migrate-player-positions-to-array.js

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'ltrc-ps';

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const players = db.collection('players');

  const cursor = players.find({
    $or: [
      { position: { $exists: true } },
      { alternatePosition: { $exists: true } },
    ],
  });

  let migrated = 0;
  for await (const player of cursor) {
    const positions = [];
    if (player.position) positions.push(player.position);
    if (player.alternatePosition) positions.push(player.alternatePosition);

    await players.updateOne(
      { _id: player._id },
      {
        $set: { positions },
        $unset: { position: '', alternatePosition: '' },
      }
    );
    migrated++;
  }

  console.log(`Migrados: ${migrated} jugadores (position/alternatePosition → positions[])`);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
