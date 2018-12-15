export const up = async (db) => {
  await db.collection('permissions').createIndex(
    { name: 1 },
    {
      unique: true,
      name: 'name_uidx',
      collation: { locale: 'en', strength: 2 },
    }
  );
};

export const down = async (db) => {
  await db.collection('permissions').dropIndex('name_uidx');
};
