import {i18n} from 'hub-dashboard-addons/dist/localization';

function getDefaultResponseErrorMessage() {
  return i18n('Something went wrong =(');
}

function responseErrorMessage(responseError, defaultErrorMessage) {
  const responseErrorData = (responseError && responseError.data) || {};
  const message = responseErrorData.error_description ||
    responseErrorData.error_developer_message;
  return message || defaultErrorMessage || getDefaultResponseErrorMessage();
}

export {
  getDefaultResponseErrorMessage,
  responseErrorMessage
};
