export const up = async (db) => {
  await db.collection('orgMemberships').createIndex(
    {
      'permissions.id': 1,
      'permissions.resourceId': 1,
    },
    {
      name: 'permissionAssignment_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('orgMemberships').dropIndex('permissionAssignment_idx');
};
