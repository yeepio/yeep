export const up = async (db) => {
  await db
    .collection('tokens')
    .createIndex({ expiresAt: 1 }, { name: 'expiresAt_idx', expireAfterSeconds: 0 });
};

export const down = async (db) => {
  await db.collection('tokens').dropIndex('expiresAt_idx');
};
