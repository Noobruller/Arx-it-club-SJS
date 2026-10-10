/**
 * MongoDB Persistence Service
 * Provides real persistence for the ARX IT Club backend across serverless and long-running instances.
 */

import { MongoClient } from 'mongodb';

const PRIMARY_URI = process.env.MONGODB_URI || 'mongodb+srv://natanyonas413_db_user:l4KA1lYI50QO4Xa8@cluster0.d7hmsjs.mongodb.net/arxitclub?retryWrites=true&w=majority';
const DIRECT_REPLICA_URI = 'mongodb://natanyonas413_db_user:l4KA1lYI50QO4Xa8@ac-y6j5ymx-shard-00-00.d7hmsjs.mongodb.net:27017,ac-y6j5ymx-shard-00-01.d7hmsjs.mongodb.net:27017,ac-y6j5ymx-shard-00-02.d7hmsjs.mongodb.net:27017/arxitclub?ssl=true&replicaSet=atlas-lukoow-shard-0&authSource=admin&retryWrites=true&w=majority';
const DB_NAME = 'arxitclub';

let client = null;
let db = null;
let connectPromise = null;

export async function getDb() {
  if (db) return db;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    // 1. Try connecting with PRIMARY_URI
    try {
      client = new MongoClient(PRIMARY_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
      await client.connect();
      db = client.db(DB_NAME);
      console.log('[MongoDB] Connected successfully via primary URI to database:', DB_NAME);
      return db;
    } catch (err) {
      console.warn('[MongoDB] Primary connection attempt failed (' + err.message + '). Trying direct replica set fallback...');
      try {
        client = new MongoClient(DIRECT_REPLICA_URI, { serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000 });
        await client.connect();
        db = client.db(DB_NAME);
        console.log('[MongoDB] Connected successfully via direct replica set fallback to database:', DB_NAME);
        return db;
      } catch (fallbackErr) {
        console.error('[MongoDB] All connection attempts failed:', fallbackErr.message);
        connectPromise = null;
        return null;
      }
    }
  })();

  return connectPromise;
}

export async function mongoSaveMember(member) {
  const mdb = await getDb();
  if (!mdb || !member) return;
  try {
    await mdb.collection('members').replaceOne({ id: member.id }, { ...member }, { upsert: true });
  } catch (err) {
    console.error('[MongoDB] saveMember error:', err.message);
  }
}

export async function mongoLoadAllMembers() {
  const mdb = await getDb();
  if (!mdb) return [];
  try {
    return await mdb.collection('members').find({}).toArray();
  } catch (err) {
    console.error('[MongoDB] loadAllMembers error:', err.message);
    return [];
  }
}

export async function mongoDeleteMember(id) {
  const mdb = await getDb();
  if (!mdb) return;
  try {
    await mdb.collection('members').deleteOne({ id });
  } catch (err) {
    console.error('[MongoDB] deleteMember error:', err.message);
  }
}

export async function mongoSaveAwardFile(file) {
  const mdb = await getDb();
  if (!mdb || !file) return;
  try {
    await mdb.collection('awardFiles').replaceOne({ id: file.id }, { ...file }, { upsert: true });
  } catch (err) {
    console.error('[MongoDB] saveAwardFile error:', err.message);
  }
}

export async function mongoLoadAllAwardFiles() {
  const mdb = await getDb();
  if (!mdb) return [];
  try {
    return await mdb.collection('awardFiles').find({}).toArray();
  } catch (err) {
    console.error('[MongoDB] loadAllAwardFiles error:', err.message);
    return [];
  }
}

export async function mongoSaveItem(collection, item, idField = 'id') {
  const mdb = await getDb();
  if (!mdb || !item) return;
  try {
    const filter = { [idField]: item[idField] };
    await mdb.collection(collection).replaceOne(filter, { ...item }, { upsert: true });
  } catch (err) {
    console.error(`[MongoDB] saveItem(${collection}) error:`, err.message);
  }
}

export async function mongoLoadAll(collection) {
  const mdb = await getDb();
  if (!mdb) return [];
  try {
    return await mdb.collection(collection).find({}).toArray();
  } catch (err) {
    console.error(`[MongoDB] loadAll(${collection}) error:`, err.message);
    return [];
  }
}

export async function mongoDeleteItem(collection, idField, idValue) {
  const mdb = await getDb();
  if (!mdb) return;
  try {
    await mdb.collection(collection).deleteOne({ [idField]: idValue });
  } catch (err) {
    console.error(`[MongoDB] deleteItem(${collection}) error:`, err.message);
  }
}

export async function mongoSaveSettings(settings) {
  const mdb = await getDb();
  if (!mdb || !settings) return;
  try {
    await mdb.collection('settings').replaceOne({ id: 'current' }, { id: 'current', ...settings }, { upsert: true });
  } catch (err) {
    console.error('[MongoDB] saveSettings error:', err.message);
  }
}

export async function mongoLoadSettings() {
  const mdb = await getDb();
  if (!mdb) return null;
  try {
    const doc = await mdb.collection('settings').findOne({ id: 'current' });
    if (doc) {
      delete doc._id;
      delete doc.id;
      return doc;
    }
    return null;
  } catch (err) {
    console.error('[MongoDB] loadSettings error:', err.message);
    return null;
  }
}

export async function mongoIsConnected() {
  const mdb = await getDb();
  return mdb !== null;
}
