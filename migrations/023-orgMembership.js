export const up = async (db) => {
  await db.collection('orgMemberships').createIndex(
    {
      'roles.id': 1,
      'roles.resourceId': 1,
    },
    {
      name: 'roleAssignment_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('orgMemberships').dropIndex('roleAssignment_idx');
};
