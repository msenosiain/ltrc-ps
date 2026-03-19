/**
 * Migration: Remove sport from matches, ensure tournament + category are set,
 * add attendance array where missing.
 *
 * Usage:
 *   node scripts/migrate-matches-remove-sport.js
 *
 * Connects to localhost:27017/ltrc-ps by default.
 * Set MONGO_URI env var to override.
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ltrc-ps';

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();

  const matches = db.collection('matches');
  const tournaments = db.collection('tournaments');

  // 1. Check for orphaned matches (no tournament)
  const orphans = await matches.find({ tournament: null }).toArray();
  if (orphans.length > 0) {
    console.error(`❌ Found ${orphans.length} matches without tournament:`);
    for (const m of orphans) {
      console.error(`   - ${m._id} | ${m.opponent ?? '(no opponent)'} | ${m.date}`);
    }
    console.error('Fix these manually before running the migration.');
    await client.close();
    process.exit(1);
  }
  console.log('✅ All matches have a tournament.');

  // 2. Check for matches without category — auto-assign if tournament has one
  const noCat = await matches.find({ category: null }).toArray();
  if (noCat.length > 0) {
    console.log(`⚠️  Found ${noCat.length} matches without category. Attempting auto-assign...`);
    let assigned = 0;
    let failed = 0;
    for (const m of noCat) {
      const tournament = await tournaments.findOne({ _id: m.tournament });
      if (tournament?.categories?.length === 1) {
        await matches.updateOne(
          { _id: m._id },
          { $set: { category: tournament.categories[0] } }
        );
        assigned++;
      } else {
        console.error(
          `   ❌ Cannot auto-assign category for match ${m._id} (tournament ${m.tournament} has ${tournament?.categories?.length ?? 0} categories)`
        );
        failed++;
      }
    }
    console.log(`   Assigned: ${assigned}, Failed: ${failed}`);
    if (failed > 0) {
      console.error('Fix the failed matches manually before continuing.');
      await client.close();
      process.exit(1);
    }
  }
  console.log('✅ All matches have a category.');

  // 3. Remove sport field from all matches
  const unsetResult = await matches.updateMany({}, { $unset: { sport: 1 } });
  console.log(`✅ Removed sport field from ${unsetResult.modifiedCount} matches.`);

  // 4. Add attendance array where missing
  const attendanceResult = await matches.updateMany(
    { attendance: { $exists: false } },
    { $set: { attendance: [] } }
  );
  console.log(`✅ Added attendance array to ${attendanceResult.modifiedCount} matches.`);

  console.log('\n🎉 Migration complete.');
  await client.close();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
