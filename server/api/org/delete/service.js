async function deleteOrg(db, { id }) {
  const OrgModel = db.model('Org');
  const result = await OrgModel.deleteOne({ _id: id });
  return !!result.ok;
}

export default deleteOrg;
