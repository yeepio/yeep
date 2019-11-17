import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

const DashboardOnboarding = ({ orgCount, permissionCount, roleCount, userCount }) => {
  const user = useSelector((state) => state.session.user);
  return (
    <React.Fragment>
      <p className="mb-4">
        Welcome <strong>{user.fullName}</strong>.
        <br />
        Not sure where to start? Follow these 4 steps below:
      </p>
      <OnboardingPane
        number={1}
        link="/organizations/create"
        linkText="Create an organisation"
        description='An organisation is the "umbrella" under which users, permissions (and roles) will be grouped. You can create as many organisations as you want. Users can belong to as many organisations as you see fit.'
        successText={orgCount ? `${orgCount} organisations have been created` : null}
      />
      <OnboardingPane
        number={2}
        link="/permissions/create"
        linkText="Create one (or more) permissions"
        description='A permission is meant to be assigned to a user and help you identify what they can and can not do. Permissions can be scoped to an organisation or be "global". For example, a "Blog" organisation would most probably have permissions like "blog_read", "blog_write", "blog_administer".'
        successText={permissionCount ? `${permissionCount} permissions have been created` : null}
      />
      <OnboardingPane
        number={3}
        link="/roles/create"
        linkText="Create roles (optional step)"
        description='A role is a grouping of permissions and allows an admin to quickly assign multiple permissions to a user. For example, a "Blog editor" role could contain the "blog_read" and "blog_write" permissions but not a "blog_administer" one.'
        successText={roleCount ? `${roleCount} roles have been created` : null}
      />
      <OnboardingPane
        number={4}
        link="/users/create"
        linkText="Create (or invite) users"
        description="Finally you can create your users and assign them to one or more organisations with the appropriate roles and / or permissions. You can also partially create profiles and invite the users via email to log in and create their profiles."
        successText={userCount ? `${userCount} users have been created` : null}
      />
    </React.Fragment>
  );
};

DashboardOnboarding.propTypes = {
  orgCount: PropTypes.number,
  permissionCount: PropTypes.number,
  roleCount: PropTypes.number,
  userCount: PropTypes.number,
};

export default DashboardOnboarding;

const OnboardingPane = ({ number, link, linkText, description, successText = null }) => {
  return (
    <div
      className={classNames(
        {
          border: successText === null,
          'border-grey': successText === null,
        },
        {
          'bg-green-lightest': successText !== null,
        },
        'rounded-lg',
        'p-4',
        'flex',
        'md:items-center',
        'mb-4'
      )}
    >
      <div
        className={classNames(
          'mr-3',
          'w-16',
          'h-16',
          'flex-none',
          'flex',
          'rounded',
          'rounded-full',
          'justify-center',
          'items-center',
          {
            'bg-grey': successText === null,
          },
          {
            'bg-green-dark': successText !== null,
          }
        )}
      >
        <span className="text-3xl text-white">
          {successText ? (
            <img src="/icon-yes-white.svg" width="36" height="29" alt="Checkmark" />
          ) : (
            number
          )}
        </span>
      </div>
      <div>
        <Link
          to={link}
          className={classNames('text-2xl', 'font-bold', {
            'text-green-dark': successText,
            'hover:text-green-darker': successText,
          })}
        >
          {linkText}
        </Link>
        {successText && <p className="text-green-dark md:float-right">{successText}</p>}
        <p>{description}</p>
      </div>
    </div>
  );
};
OnboardingPane.propTypes = {
  number: PropTypes.number.isRequired,
  link: PropTypes.string.isRequired,
  linkText: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  successText: PropTypes.string,
};
