/**
 * MongoDB Persistence Service
 * Provides real persistence for the ARX IT Club backend across serverless and long-running instances.
 */

import { MongoClient } from 'mongodb';

const DIRECT_REPLICA_URI = 'mongodb://natanyonas413_db_user:l4KA1lYI50QO4Xa8@ac-y6j5ymx-shard-00-00.d7hmsjs.mongodb.net:27017,ac-y6j5ymx-shard-00-01.d7hmsjs.mongodb.net:27017,ac-y6j5ymx-shard-00-02.d7hmsjs.mongodb.net:27017/arxitclub?ssl=true&replicaSet=atlas-lukoow-shard-0&authSource=admin&retryWrites=true&w=majority';
const PRIMARY_URI = process.env.MONGODB_URI || DIRECT_REPLICA_URI;
const DB_NAME = 'arxitclub';

let client = null;
let db = null;
let connectPromise = null;

export async function getDb() {
  if (db) return db;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    // 1. Try DIRECT_REPLICA_URI first (fastest & bypasses SRV DNS blocking) if primary is not explicitly set, or PRIMARY_URI first
    const firstUri = (process.env.MONGODB_URI && process.env.MONGODB_URI !== DIRECT_REPLICA_URI) ? PRIMARY_URI : DIRECT_REPLICA_URI;
    const secondUri = (firstUri === DIRECT_REPLICA_URI) ? PRIMARY_URI : DIRECT_REPLICA_URI;

    try {
      client = new MongoClient(firstUri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
      await client.connect();
      db = client.db(DB_NAME);
      console.log('[MongoDB] Connected successfully to database:', DB_NAME);
      return db;
    } catch (err) {
      console.warn('[MongoDB] First connection attempt failed (' + err.message + '). Trying fallback URI...');
      try {
        client = new MongoClient(secondUri, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
        await client.connect();
        db = client.db(DB_NAME);
        console.log('[MongoDB] Connected successfully via fallback URI to database:', DB_NAME);
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

export async function mongoFindMember(filter) {
  const mdb = await getDb();
  if (!mdb || !filter) return null;
  try {
    const doc = await mdb.collection('members').findOne(filter);
    if (doc) {
      delete doc._id;
      return doc;
    }
    return null;
  } catch (err) {
    console.error('[MongoDB] findMember error:', err.message);
    return null;
  }
}
