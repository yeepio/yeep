import { MongoClient } from 'mongodb';

const connectDb = async (uri) => {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true });
  return client;
}

const unloadFixtures = async (config) => {
  const client = await connectDb(config.mongo.uri);
  const db = client.db();

  try {
    await Promise.all([
      db.collection('users').deleteMany({ isFixture: true }),
      db.collection('orgs').deleteMany({ isFixture: true }),
      db.collection('roles').deleteMany({ isFixture: true }),
      db.collection('permissions').deleteMany({ isFixture: true }),
      db.collection('authFactors').deleteMany({ isFixture: true }),
      db.collection('orgMemberships').deleteMany({ isFixture: true }),
    ]);
  } catch (err) {
    throw err;
  } finally {
    client.close();
  }
}

export default unloadFixtures;