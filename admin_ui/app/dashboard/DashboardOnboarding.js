import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';

const DashboardOnboarding = ({ orgCount, permissionCount, roleCount, userCount }) => {
  return (
    <React.Fragment>
      <p className="mb-4">
        Welcome XXXX.
        <br />
        Not sure where to start? Follow these 4 steps below:
      </p>
      <OnboardingPane
        number={1}
        link="/organizations/create"
        linkText="Create an organisation"
        description='An organisation is the "umbrella" under which users, permissions (and roles) will be grouped. You can create as many organisations as you want. Users can belong to as many organisations as you see fit.'
      />
      <div className="rounded-lg p-4 flex md:items-center mb-4 bg-green-lightest">
        <div className="mr-3 w-16 h-16 flex-none bg-green-dark flex rounded rounded-full justify-center items-center rounded">
          <span className="text-3xl text-white">
            <img src="/icon-yes-white.svg" width="36" height="29" alt="Checkmark" />
          </span>
        </div>
        <div>
          <Link to="organizations/create" className="text-2xl font-bold text-green-dark">
            Create an organisation
          </Link>
          <p className="text-green-dark md:float-right">Great! 10 permissions have been created</p>
          <p>
            An organisation is the &quot;umbrella&quot; under which users, permissions (and roles)
            will be grouped. You can create as many organisations as you want. Users can belong to
            as many organisations as you see fit.
          </p>
        </div>
      </div>
      <p>
        {orgCount} - {permissionCount} - {roleCount} - {userCount}
      </p>
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

const OnboardingPane = ({ number, link, linkText, description, successText }) => {
  return (
    <div className="border border-grey rounded-lg p-4 flex md:items-center mb-4">
      <OnboardingNumber number={number} />
      <div>
        <Link to={link} className="text-2xl font-bold">
          {linkText}
        </Link>
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
  successText: PropTypes.string
};

/**
 * Helper sub-component, outputs the large number-in-a-circle inside each OnboardingPane
 * @param number
 */
const OnboardingNumber = ({ number }) => {
  return (
    <div className="mr-3 w-16 h-16 flex-none bg-grey flex rounded rounded-full justify-center items-center rounded">
      <span className="text-3xl text-white">{number}</span>
    </div>
  );
};
OnboardingNumber.propTypes = {
  number: PropTypes.number.isRequired,
};
