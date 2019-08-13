/**
 * @return {object} Object of actions like { key1: key1, key2: key2 } in order to use it as consts
 */
export default {
  /* UI basic actions */
  ...actionType('SIDEBAR_TOGGLE'),
  ...actionType('LINK'),
  ...actionType('FULLSCREEN'),
  ...actionType('CHANGE_THEME'),
  ...actionType('TOGGLE_INTERVAL_CHANGE'),
  ...actionType('CHANGE_RANGE'),
  ...actionType('CHANGE_REFRESH_RATE'),

  ...actionType('SIGN_OUT'),
  ...actionType('RESET_ERROR_MESSAGES'),

  /* Remote actions */
  ...asyncActionType('AUTH_REQUEST'),
  ...asyncActionType('DASHBOARDS_REQUEST'),
  ...asyncActionType('DASHBOARDS_UPDATE_REQUEST'),
  ...asyncActionType('DASHBOARDS_CREATE_REQUEST'),
  ...asyncActionType('DASHBOARDS_DELETE_REQUEST'),

  ...asyncActionType('DATASOURCES_REQUEST'),

  ...asyncActionType('DATA_ENTITIES_REQUEST'),
  ...asyncActionType('DATA_REQUEST'),
  ...actionType('DATA_UNLOAD'),

  ...asyncActionType('PROFILE_REQUEST'),

  ...asyncActionType('TRACES_REQUEST'),
  ...asyncActionType('SERVICES_REQUEST'),
}

/**
 * @param {string} name A name of action type
 * @return {object} A { name: name } object should be created
 */
export function actionType(name) {
  let type = {}
  type[name] = name
  return type
}

/**
 * @param {string} name A name of action type
 * @return {object} An async action flow action types
 */
export function asyncActionType(name) {
  const PENDING_POSTFIX = '_PENDING'
  const SUCCESS_POSTFIX = '_SUCCESS'
  const ERROR_POSTFIX = '_FAILURE'

  return {
    ...actionType(name),
    ...actionType(`${name}${PENDING_POSTFIX}`),
    ...actionType(`${name}${SUCCESS_POSTFIX}`),
    ...actionType(`${name}${ERROR_POSTFIX}`),
  }
}
