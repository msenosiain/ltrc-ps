// Migración: convertir parentContact (objeto) a parentContacts (array)
// Uso: node scripts/migrate-parent-contacts.js

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'ltrc-ps';

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const players = db.collection('players');

  // Find players that still have the old parentContact field (single object)
  const cursor = players.find({ parentContact: { $exists: true } });

  let migrated = 0;
  for await (const player of cursor) {
    const contact = player.parentContact;
    const parentContacts = contact && contact.name ? [contact] : [];

    await players.updateOne(
      { _id: player._id },
      {
        $set: { parentContacts },
        $unset: { parentContact: '' },
      }
    );
    migrated++;
  }

  console.log(`Migrados: ${migrated} jugadores (parentContact → parentContacts)`);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
