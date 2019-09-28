export const up = async (db) => {
  await db.collection('orgs').createIndex(
    { name: 'text' },
    {
      name: 'text_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('orgs').dropIndex('text_idx');
};
