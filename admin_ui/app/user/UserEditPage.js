import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Input from '../../components/Input';
import Button from '../../components/Button';
import TabLinks from '../../components/TabLinks';

const UserEditPage = ({ userId }) => {
  useDocumentTitle(`Edit user #${userId}`);
  return (
    <React.Fragment>
      <h1 className="mb-6">Edit user &quot;USER_FULLNAME&quot;</h1>
      <TabLinks
        className="mb-6"
        links={[
          {
            label: 'User details',
            to: `/users/${userId}/edit`,
          },
          {
            label: 'Organization membership',
            to: `/users/${userId}/edit/memberships`,
          },
          {
            label: 'System permissions',
            to: `/users/${userId}/edit/system-permissions`,
          }
        ]}
      />
      <fieldset className="mb-6">
        <legend>User details</legend>
        <div className="form-group mb-4">
          <label htmlFor="user-full-name">Full name:</label>
          <Input
            id="user-full-name"
            placeholder="enter your full name"
            className="w-full sm:w-1/2"
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="user-username">Username:</label>
          <Input id="user-username" placeholder="enter your username" className="w-full sm:w-1/2" />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="user-email">
            <strong>Primary</strong> email:
          </label>
          <Input
            id="user-email"
            type="email"
            placeholder="name@domain.com"
            className="w-full sm:w-1/3 border-green-dark"
          />
          <img
            src="/icon-yes.svg"
            alt="Verified email address"
            width="20"
            height="20"
            className="ml-3 mr-1 self-center"
          />
          <span className="text-green-dark self-center">Verified</span>
        </div>
        <div className="form-group mb-4">
          <label htmlFor="user-email-2">Secondary email(s):</label>
          <Input
            id="user-email-2"
            type="email"
            placeholder="name@domain.com"
            className="w-full sm:w-1/3"
          />
          <img
            src="/icon-yes.svg"
            alt="Verified email address"
            width="20"
            height="20"
            className="ml-3 mr-1 self-center"
          />
          <span className="text-green-dark self-center">Verified</span>
          <button className="pseudolink self-center ml-3">Make primary</button>
          <button className="pseudolink self-center ml-3">Remove</button>
        </div>
        <div className="form-group mb-4">
          <label htmlFor="user-email-3">&nbsp;</label>
          <Input
            id="user-email-3"
            type="email"
            placeholder="name@domain.com"
            className="w-full sm:w-1/3"
          />
          <img
            src="/icon-no.svg"
            alt="Not verified email address"
            width="20"
            height="20"
            className="ml-3 mr-1 self-center"
          />
          <span className="text-red-dark self-center">Not verified</span>
          <button className="pseudolink self-center ml-3">Verify</button>
          <button className="pseudolink self-center ml-3">Remove</button>
        </div>
        <div className="form-submit mb-4">
          <button className="pseudolink">Add a new email address</button>
        </div>
        <div className="form-submit">
          <Button className="w-full sm:w-auto">Save changes</Button>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Password</legend>
        <div className="form-group mb-4">
          <label htmlFor="user-password">Password:</label>
          <Input id="user-password" type="password" className="w-full sm:w-1/2" />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="user-verify-password">Verify password:</label>
          <Input id="user-verify-password" type="password" className="w-full sm:w-1/2" />
        </div>
        <div className="form-submit">
          <Button className="w-full sm:w-auto">Update password</Button>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Profile picture</legend>
        <div className="sm:flex mb-4">
          <div className="sm:w-1/4">Picture srouce:</div>
          <div className="sm:w-3/4">
            <label htmlFor="user-pic-source-none" className="block">
              <input
                type="radio"
                name="user-pic-source"
                id="user-pic-source-none"
                className="mr-2"
              />{' '}
              No uploaded picture (will use <a href="#top">your Gravatar</a> if set)
            </label>
            <label htmlFor="user-pic-source-custom" className="block">
              <input
                type="radio"
                name="user-pic-source"
                id="user-pic-source-custom"
                className="mr-2"
                checked="checked"
              />{' '}
              Upload my own profile picture
            </label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="user-pic-upload">Current picture:</label>
          <div className="sm:w-3/4">
            <div className="mb-3">
              <div className="inline-block p-2 border border-grey">
                <img
                  src="/temp-user-pic.jpg"
                  width="120"
                  height="120"
                  alt="User profile"
                  className="block"
                />
              </div>
            </div>
            <div className="mb-3">
              <Button className="w-full sm:w-auto">Upload a new profile pic</Button>
            </div>
            <div className="text-sm text-grey-dark">
              Save as a PNG, JPG or WEBP<br/>
              Minimum size of height or width: 200px<br/>
              Maximum size of height or width: 1000px
            </div>
          </div>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Danger zone</legend>
        <Button danger={true} className="mr-4">Delete user</Button>
        <Button>Deactivate user</Button>
      </fieldset>
      <div><Link to="/users">Return to the list of users</Link></div>
    </React.Fragment>
  );
};

UserEditPage.propTypes = {
  userId: PropTypes.string,
};

export default UserEditPage;
