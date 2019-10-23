import React from 'react';
import { useImmerReducer } from 'use-immer';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import Input from '../../components/Input';
import Button from '../../components/Button';

const SET_USERNAME = 'SET_USERNAME';
const SET_FULLNAME = 'SET_FULLNAME';
const SET_PASSWORD = 'SET_PASSWORD';
const ADD_EMAIL = 'ADD_EMAIL';
const REMOVE_EMAIL = 'REMOVE_EMAIL';
const SET_EMAIL_VERIFIED = 'SET_EMAIL_VERIFIED';
const SET_EMAIL_PRIMARY = 'SET_EMAIL_PRIMARY';
const SET_EMAIL_ADDRESS = 'SET_EMAIL_ADDRESS';

function reducer(draft, action) {
  switch (action.type) {
    case SET_USERNAME:
      draft.username = action.value;
      break;
    case SET_PASSWORD:
      draft.password = action.value;
      break;
    case SET_FULLNAME:
      draft.fullName = action.value;
      break;
    case ADD_EMAIL:
      draft.emails.push({
        address: '',
        isPrimary: false,
        isVerified: false,
      });
      break;
    case REMOVE_EMAIL: {
      const shouldRecalculatePrimary = draft.emails[action.index].isPrimary;
      draft.emails.splice(action.index, 1);
      if (shouldRecalculatePrimary) {
        draft.emails[0].isPrimary = true;
      }
      break;
    }
    case SET_EMAIL_ADDRESS:
      draft.emails[action.index].address = action.value;
      break;
    case SET_EMAIL_PRIMARY:
      draft.emails = draft.emails.map((e, i) => {
        e.isPrimary = i === action.index;
        return e;
      });
      break;
    case SET_EMAIL_VERIFIED:
      draft.emails[action.index].isVerified = !draft.emails[action.index].isVerified;
      break;
    default:
      throw new Error();
  }
}

const UserCreateForm = ({ defaultValues, isSavePending, errors, onSubmit, onCancel }) => {
  const [values, dispatch] = useImmerReducer(reducer, defaultValues);
  const [isPasswordDisplayed, setPasswordDisplayed] = React.useState(false);

  const onFormSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      onSubmit(values);
    },
    [onSubmit, values]
  );

  return (
    <form onSubmit={onFormSubmit}>
      <fieldset className="mb-6">
        <legend>User details</legend>
        {errors.generic && (
          <div className="bg-red-lightest text-red rounded border border-red-lighter p-3 mb-4">
            {errors.generic}
          </div>
        )}
        <div className="form-group mb-4">
          <label htmlFor="fullName">Full Name</label>
          <Input
            id="fullName"
            className="w-full sm:w-1/2"
            value={values.fullName}
            onChange={(event) => dispatch({ type: SET_FULLNAME, value: event.target.value })}
            disabled={isSavePending}
            maxLength="100"
          />
          {errors.fullName && <p className="invalid mt-2">{errors.fullName}</p>}
        </div>
        <div className="form-group mb-4">
          <label htmlFor="username">Username</label>
          <Input
            id="username"
            className="w-full sm:w-1/2"
            value={values.username}
            onChange={(event) => dispatch({ type: SET_USERNAME, value: event.target.value })}
            disabled={isSavePending}
            maxLength="30"
          />
          {errors.username && <p className="invalid mt-2">{errors.username}</p>}
        </div>
        <div className="form-group mb-4">
          <label htmlFor="password">Password</label>
          <Input
            id="password"
            type={isPasswordDisplayed ? 'text' : 'password'}
            className="w-full sm:w-1/2"
            value={values.password}
            onChange={(event) => dispatch({ type: SET_PASSWORD, value: event.target.value })}
            disabled={isSavePending}
            maxLength="50"
          />
          <button
            type="button"
            className="pseudolink self-center whitespace-no-wrap ml-3"
            onClick={() => setPasswordDisplayed((prevValue) => !prevValue)}
          >
            {isPasswordDisplayed ? 'Hide' : 'Show'}
          </button>
          {errors.password && <p className="invalid mt-2">{errors.password}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="email-0">Email(s)</label>
          <div className="w-full sm:w-1/2">
            {values.emails.map((email, i) => {
              return (
                <div key={i} className="mb-2 flex">
                  <Input
                    id={`email-${i}`}
                    type="email"
                    className="w-full"
                    value={email.address}
                    onChange={(event) =>
                      dispatch({ type: SET_EMAIL_ADDRESS, index: i, value: event.target.value })
                    }
                    disabled={isSavePending}
                    maxLength="100"
                  />
                  <button
                    type="button"
                    className="pseudolink self-center whitespace-no-wrap ml-3"
                    onClick={() => dispatch({ type: SET_EMAIL_PRIMARY, index: i })}
                    disabled={email.isPrimary}
                  >
                    {email.isPrimary ? 'Primary' : 'Make primary'}
                  </button>
                  <button
                    type="button"
                    className="pseudolink self-center whitespace-no-wrap ml-3"
                    onClick={() => dispatch({ type: SET_EMAIL_VERIFIED, index: i })}
                  >
                    Mark {email.isVerified ? 'unverified' : 'verified'}
                  </button>
                  {values.emails.length > 1 && (
                    <button
                      type="button"
                      className="pseudolink self-center whitespace-no-wrap ml-3"
                      onClick={() => dispatch({ type: REMOVE_EMAIL, index: i })}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {errors.emails && <p className="invalid">{errors.emails}</p>}
        </div>
        <div className="form-submit mb-4">
          <button
            type="button"
            className="pseudolink"
            onClick={() => dispatch({ type: ADD_EMAIL })}
          >
            Add a new email address
          </button>
        </div>
        <div className="form-submit">
          <Button type="submit" disabled={isSavePending}>
            Save
          </Button>
          <button
            type="button"
            className="pseudolink ml-4"
            onClick={onCancel}
            disabled={isSavePending}
          >
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
};

UserCreateForm.propTypes = {
  defaultValues: PropTypes.object,
  errors: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  isSavePending: PropTypes.bool,
};

UserCreateForm.defaultProps = {
  defaultValues: {
    username: '',
    password: '',
    fullName: '',
    emails: [
      {
        address: '',
        isVerified: false,
        isPrimary: true,
      },
    ],
  },
  errors: {},
  onSubmit: noop,
  onCancel: noop,
  isSavePending: false,
};

export default UserCreateForm;
