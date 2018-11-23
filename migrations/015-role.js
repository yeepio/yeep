export const up = async (db) => {
  const now = new Date();
  const permissions = await db
    .collection('permissions')
    .find(
      {
        name: { $regex: /^yeep\./ },
      },
      {
        projection: {
          _id: 1,
        },
      }
    )
    .toArray();
  await db.collection('roles').insertOne({
    name: 'admin',
    isSystemRole: true,
    permissions: permissions.map((e) => e._id),
    createdAt: now,
    updatedAt: now,
  });
};

export const down = async (db) => {
  await db.collection('roles').deleteOne({
    name: 'admin',
  });
};
