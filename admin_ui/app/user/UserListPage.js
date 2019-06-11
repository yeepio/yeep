import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import ButtonLink from '../../components/ButtonLink';
import Select from 'react-select';
import Grid from '../../components/Grid';
import Input from '../../components/Input';

// Dummy data
let userHeadings = [
  { label: 'Username', className: 'text-left' },
  { label: 'Full name', className: 'text-left' },
  { label: 'Verified?' },
  { label: 'Primary email', className: 'text-left' },
  { label: 'Orgs' },
  { label: 'Roles' },
  { label: 'Actions', isSortable: false },
];
let userData = [
  {
    id: 1,
    username: 'rf123',
    fullName: 'Rodney Fields',
    verified: true,
    email: 'rodney@gmail.com',
    orgs: 1,
    roles: 1,
  },
  {
    id: 2,
    username: 'manuela1091',
    fullName: 'Manuela Carvalho',
    verified: true,
    email: 'mcarvallho45@hotmail.com',
    orgs: 2,
    roles: 2,
  },
  {
    id: 3,
    username: 'pmartin_5',
    fullName: 'Philip Martin',
    verified: true,
    email: 'mcarvallho45@hotmail.com',
    orgs: 2,
    roles: 2,
  },
  {
    id: 4,
    username: 'leeleeva',
    fullName: 'Liva Christensen',
    verified: true,
    email: 'leeleeva@gmail.com',
    orgs: 1,
    roles: 1,
  },
  {
    id: 5,
    username: 'abc1',
    fullName: 'Alfredo Wendel',
    verified: false,
    email: 'alfredo@hotmail.com',
    orgs: 0,
    roles: 0,
  },
  {
    id: 6,
    username: 'traphunt444',
    fullName: 'Junstine Singh',
    verified: false,
    email: 'jsingh123@yandex.ru',
    orgs: 0,
    roles: 0,
  },
  {
    id: 7,
    username: 'ag1',
    fullName: 'Afranio Goncalves',
    verified: true,
    email: 'ag1@hotmail.com',
    orgs: 1,
    roles: 1,
  },
  {
    id: 8,
    username: 'carl_pedersen_1981',
    fullName: 'Carl Pedersen',
    verified: true,
    email: 'card_pedersen@gmail.com',
    orgs: 1,
    roles: 1,
  },
  {
    id: 9,
    username: 'kagkouras1',
    fullName: 'George Kagkouras',
    verified: true,
    email: 'giorgaros_sexy@otenet.gr',
    orgs: 2,
    roles: 2,
  },
  {
    id: 10,
    username: 'silly-smile',
    fullName: 'Julia Francescu',
    verified: true,
    email: 'ssm1978@gmail.com',
    orgs: 2,
    roles: 2,
  },
];

const UserListPage = () => {
  useDocumentTitle('Users');
  return (
    <React.Fragment>
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="font-semibold text-3xl mb-6">Users</h1>
      <fieldset className="mb-6">
        <legend>Filters and quick search</legend>
        <div className="sm:flex items-center">
          <Select
            className="flex-auto mb-3 sm:mb-0 sm:mr-3"
            placeholder="All organisations"
            options={[
              { value: 1, label: 'Org 1' },
              { value: 2, label: 'Org 2' },
              { value: 3, label: 'Org 3' },
              { value: 4, label: 'Org 4' },
            ]}
            isClearable={true}
          />
          <Select
            className="flex-auto mb-3 sm:mb-0 sm:mr-3"
            placeholder="All roles"
            options={[
              { value: 1, label: 'Role 1' },
              { value: 2, label: 'Role 2' },
              { value: 3, label: 'Role 3' },
            ]}
            isClearable={true}
          />
          <Input placeholder="quicksearch" className="w-full sm:w-1/3" />
        </div>
      </fieldset>
      <Grid
        className="mb-6"
        headings={userHeadings}
        data={userData}
        renderer={(userData, index) => {
          return (
            <tr key={`userRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">{userData.username}</td>
              <td className="p-2">
                <Link to={`${userData.id}/edit`}>{userData.fullName}</Link>
              </td>
              <td className="p-2 text-center">
                {userData.verified && <img src="/icon-yes.svg" alt="Verified email" width={16} />}
                {!userData.verified && (
                  <img src="/icon-no.svg" alt="Non-verified email" width={16} />
                )}
              </td>
              <td className="p-2">{userData.email}</td>
              <td className="p-2 text-center">{userData.orgs}</td>
              <td className="p-2 text-center">{userData.roles}</td>
              <td className="p-2 text-center">
                <Link to={`${userData.id}/edit`}>Edit</Link> <a href="/">Remove</a>
              </td>
            </tr>
          );
        }}
      />
      <p>
        <Link to="..">Return to the dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default UserListPage;
