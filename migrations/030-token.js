export const up = async (db) => {
  await db.collection('tokens').createIndex(
    { org: 1 },
    {
      name: 'org_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('tokens').dropIndex('org_idx');
};
