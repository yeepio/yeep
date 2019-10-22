import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { produce } from 'immer';
import Input from '../../components/Input';
import Button from '../../components/Button';

const UserCreateForm = ({ defaultValues, isSavePending, errors, onSubmit, onCancel }) => {
  const [values, setValues] = React.useState(defaultValues);

  const onFormSubmit = useCallback(
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
            onChange={(event) => {
              const { value } = event.target;
              setValues(
                produce((draft) => {
                  draft.fullName = value;
                })
              );
            }}
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
            onChange={(event) => {
              const { value } = event.target;
              setValues(
                produce((draft) => {
                  draft.username = value;
                })
              );
            }}
            disabled={isSavePending}
            maxLength="30"
          />
          {errors.username && <p className="invalid mt-2">{errors.username}</p>}
        </div>
        <div className="form-group mb-4">
          <label htmlFor="password">Password</label>
          <Input
            id="password"
            type="password"
            className="w-full sm:w-1/2"
            value={values.password}
            onChange={(event) => {
              const { value } = event.target;
              setValues(
                produce((draft) => {
                  draft.password = value;
                })
              );
            }}
            disabled={isSavePending}
            maxLength="50"
          />
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
                    onChange={(event) => {
                      const { value } = event.target;
                      setValues(
                        produce((draft) => {
                          draft.emails[i].address = value;
                        })
                      );
                    }}
                    disabled={isSavePending}
                    maxLength="100"
                  />
                  <button
                    type="button"
                    className="pseudolink self-center whitespace-no-wrap ml-3"
                    onClick={() => {
                      setValues(
                        produce((draft) => {
                          draft.emails = draft.emails.map((e, j) => {
                            e.isPrimary = j === i;
                            return e;
                          });
                        })
                      );
                    }}
                    disabled={email.isPrimary}
                  >
                    {email.isPrimary ? 'Primary' : 'Make primary'}
                  </button>
                  <button
                    type="button"
                    className="pseudolink self-center whitespace-no-wrap ml-3"
                    onClick={() => {
                      setValues(
                        produce((draft) => {
                          draft.emails[i].isVerified = !draft.emails[i].isVerified;
                        })
                      );
                    }}
                  >
                    Mark {email.isVerified ? 'unverified' : 'verified'}
                  </button>
                  {values.emails.length > 1 && (
                    <button
                      type="button"
                      className="pseudolink self-center whitespace-no-wrap ml-3"
                      onClick={() => {
                        setValues(
                          produce((draft) => {
                            const shouldRecalculatePrimary = draft.emails[i].isPrimary;
                            draft.emails.splice(i, 1);
                            if (shouldRecalculatePrimary) {
                              draft.emails[0].isPrimary = true;
                            }
                          })
                        );
                      }}
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
            onClick={() => {
              setValues(
                produce((draft) => {
                  draft.emails.push({
                    address: '',
                    isPrimary: false,
                    isVerified: false,
                  });
                })
              );
            }}
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
