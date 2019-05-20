import { MongoClient } from 'mongodb';

const connectDb = async (uri) => {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true });
  return client;
}

const unloadFixtures = async (config) => {
  const client = await connectDb(config.mongo.uri);
  const db = client.db();

  try {
    await db.collection('users').deleteMany({ isFixture: true });
    await db.collection('orgs').deleteMany({ isFixture: true });
    await db.collection('roles').deleteMany({ isFixture: true });
    await db.collection('permissions').deleteMany({ isFixture: true });
    await db.collection('authFactors').deleteMany({ isFixture: true });
    await db.collection('orgMemberships').deleteMany({ isFixture: true });
  } catch (err) {
    throw err;
  } finally {
    client.close();
  }
}

export default unloadFixtures;