export const up = async (db) => {
  await db.collection('orgMemberships').createIndex(
    { orgId: 1, userId: 1 },
    {
      unique: true,
      name: 'membership_uidx',
    }
  );
};

export const down = async (db) => {
  await db.collection('orgMemberships').dropIndex('membership_uidx');
};
