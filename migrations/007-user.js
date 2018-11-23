export const up = async (db) => {
  await db.collection('users').createIndex(
    { 'emails.address': 1 },
    {
      unique: true,
      name: 'email_address_uidx',
      collation: { locale: 'en', strength: 2 },
    }
  );
};

export const down = async (db) => {
  await db.collection('users').dropIndex('email_address_uidx');
};
