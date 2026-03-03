/**
 * Migración: valores de PlayerPositionEnum de strings descriptivos a números (1-15)
 *
 * Uso:
 *   node scripts/migrate-player-positions.js
 *
 * Requiere que MongoDB esté corriendo (docker-compose up).
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ltrc-ps';

const POSITION_MAP = {
  'Loose-head prop':    '1',
  'Hooker':             '2',
  'Tight-head prop':    '3',
  'Left Second-row':    '4',
  'Right Second-row':   '5',
  'Blindside flanker':  '6',
  'Open side flanker':  '7',
  'Number 8':           '8',
  'Scrum-half':         '9',
  'Fly-half':           '10',
  'Left wing':          '11',
  'Inside centre':      '12',
  'Outside centre':     '13',
  'Right wing':         '14',
  'Full-back':          '15',
};

async function migrate() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();
  const players = db.collection('players');

  let updated = 0;

  for (const [oldValue, newValue] of Object.entries(POSITION_MAP)) {
    // Actualizar campo position
    const r1 = await players.updateMany(
      { position: oldValue },
      { $set: { position: newValue } }
    );
    // Actualizar campo alternatePosition
    const r2 = await players.updateMany(
      { alternatePosition: oldValue },
      { $set: { alternatePosition: newValue } }
    );
    updated += r1.modifiedCount + r2.modifiedCount;
  }

  console.log(`Migración completada. Documentos actualizados: ${updated}`);
  await client.close();
}

migrate().catch((err) => {
  console.error('Error en la migración:', err);
  process.exit(1);
});
