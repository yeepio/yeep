export const up = async (db) => {
  await db.collection('orgs').createIndex(
    { slug: 1 },
    {
      unique: true,
      name: 'slug_uidx',
      collation: { locale: 'en', strength: 1 },
    }
  );
};

export const down = async (db) => {
  await db.collection('orgs').dropIndex('slug_uidx');
};
