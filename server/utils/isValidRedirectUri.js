import isRegExp from 'lodash/isRegExp';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import typeOf from 'typeof';

export default function isValidRedirectUri(callbackUrl, allowedList = []) {
  if (!isString(callbackUrl)) {
    throw new TypeError(
      `Invalid callbackUrl param; expected string, received ${typeOf(callbackUrl)}`
    );
  }

  if (!isArray(allowedList)) {
    throw new Error(`Invalid allowedList param; expected array, received ${typeOf(allowedList)}`);
  }

  return allowedList.some((e) => {
    if (isString(e)) {
      return callbackUrl.startsWith(e);
    }

    if (isRegExp(e)) {
      return e.test(callbackUrl);
    }

    if (isFunction(e)) {
      return e(callbackUrl);
    }

    return false;
  });
}
