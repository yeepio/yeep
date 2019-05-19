import { MongoClient } from 'mongodb';
// import { promisify } from 'util';


const connectDb = async () => {
  const url = 'mongodb://localhost:27017';
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  return client;
}

const clearFixtures = async () => {
  const dbName = 'test';
  const client = await connectDb();
  const db = client.db(dbName);

  try {
    await db.collection('users').deleteMany({ isFixture: true });
    await db.collection('orgs').deleteMany({ isFixture: true });
    await db.collection('roles').deleteMany({ isFixture: true });
    await db.collection('permissions').deleteMany({ isFixture: true });
  } catch (err) {
    throw err;
  } finally {
    client.close();
  }
}

export default clearFixtures;