import set from 'lodash/set';

export default function parseYeepValidationErrors(err) {
  if (!(err instanceof Error)) {
    throw new TypeError('Invalid "err" argument; expected instance of Error');
  }

  if (err.code !== 400) {
    throw new TypeError('Invalid "err" argument; expected Yeep validation error');
  }

  const validationErrors = {};

  err.details.forEach((obj) => {
    set(validationErrors, obj.path, obj.message);
  });

  return validationErrors;
}
