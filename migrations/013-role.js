export const up = async (db) => {
  await db.collection('roles').createIndex(
    { name: 1 },
    {
      unique: true,
      name: 'name_uidx',
      collation: { locale: 'en', strength: 1 },
    }
  );
};

export const down = async (db) => {
  await db.collection('roles').dropIndex('name_uidx');
};
