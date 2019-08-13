import ActionTypes from './types'
import * as schemas from '../schemas'
import { createSearchAction } from 'redux-search'

export const action = (type, payload = {}, meta) => ({ ...payload, type, meta })

/* meta information */
const redirect = (redirect) => ({ redirect })
const schema = (schema) => ({ schema })

/* Request flows */
export const auth = {
  request: (params) => action(ActionTypes.AUTH_REQUEST_PENDING, params),
  success: (params, response) => action(ActionTypes.AUTH_REQUEST_SUCCESS, { ...params, response
  }, schema(schemas.auth)),
  failure: (params, error) => action(ActionTypes.AUTH_REQUEST_FAILURE, { ...params, error }),
}

export const profile = {
  request: () => action(ActionTypes.PROFILE_REQUEST_PENDING),
  success: (params, response) => action(ActionTypes.PROFILE_REQUEST_SUCCESS, {
    ...params,
    response
  }, schema(schemas.profile)),
  failure: (params, error) => action(ActionTypes.PROFILE_REQUEST_FAILURE, { error }),
}

export const dashboards = {
  request: (params) => action(ActionTypes.DASHBOARDS_REQUEST_PENDING, params),
  success: (params, response) => action(ActionTypes.DASHBOARDS_REQUEST_SUCCESS, {
    ...params,
    response
  }, {
    ...schema(params.id || params.payload ? schemas.dashboard : schemas.dashboards),
    ...redirect(params.redirectSuccess)
  }),
  failure: (params, error) => action(ActionTypes.DASHBOARDS_REQUEST_FAILURE, { ...params, error }),
}

export const datasources = {
  request: (params = []) => action(ActionTypes.DATASOURCES_REQUEST_PENDING, params),
  success: (params = [], response) => action(ActionTypes.DATASOURCES_REQUEST_SUCCESS, {
    ...params,
    response
  }, {
    ...schema(schemas.datasources),
  }),
  failure: (params = [], error) => action(ActionTypes.DATASOURCES_REQUEST_FAILURE, { ...params, error }),
}

export const traces = {
  request: (params) => action(ActionTypes.TRACES_REQUEST_PENDING, params),
  success: (params, response) => action(ActionTypes.TRACES_REQUEST_SUCCESS, {
    ...params,
    response
  }, {
    ...schema(params.id || params.payload ? schemas.trace : schemas.traces),
  }),
  failure: (params, error) => action(ActionTypes.TRACES_REQUEST_FAILURE, { error }),
};

export const services = {
  request: () => action(ActionTypes.SERVICES_REQUEST_PENDING),
  success: (params, response) => action(ActionTypes.SERVICES_REQUEST_SUCCESS, {
    ...params,
    response
  }, {
    ...schema(schemas.services),
  }),
  failure: (params, error) => action(ActionTypes.SERVICES_REQUEST_FAILURE, { error }),
};

export const data = {
  request: (params) => action(ActionTypes.DATA_REQUEST_PENDING, { ...params }),
  success: (params, response) => action(ActionTypes.DATA_REQUEST_SUCCESS, { ...params, response }),
  failure: (params, error) => action(ActionTypes.DATA_REQUEST_FAILURE, { ...params, error }),
}

/* Initial requests */
export const loadProfile = () => action(ActionTypes.PROFILE_REQUEST)
export const loadDatasources = () => action(ActionTypes.DATASOURCES_REQUEST)
export const loadTraces = id => action(ActionTypes.TRACES_REQUEST, {id})
export const loadServices = () => action(ActionTypes.SERVICES_REQUEST)
export const loadDashboards = id => action(ActionTypes.DASHBOARDS_REQUEST, { id })

export const createDashboard = (params) => action(ActionTypes.DASHBOARDS_CREATE_REQUEST, { id: null, ...params })
export const updateDashboard = (params) => action(ActionTypes.DASHBOARDS_UPDATE_REQUEST, { id: params.payload.id, ...params })
export const deletelDashboard = (params) => action(ActionTypes.DASHBOARDS_DELETE_REQUEST, { id: params.payload.id, ...params })

export const loadData = dashboardID => action(ActionTypes.DATA_REQUEST, { dashboardID })
export const unloadData = () => action(ActionTypes.DATA_UNLOAD, {})

export const signIn = (payload) => action(ActionTypes.AUTH_REQUEST, { payload })
export const signOut = () => action(ActionTypes.SIGN_OUT)


/**
 * UI actions
 */
export const toggleSidebar = () => action(ActionTypes.SIDEBAR_TOGGLE)

export const link = (params) => {
  navigateTo(params);
  return action(ActionTypes.LINK, params)
}

export const fullscreen = () => {
  requestFullScreen();
  return action(ActionTypes.FULLSCREEN)
}

export const changeTheme = (themeName) => action(ActionTypes.CHANGE_THEME, { themeName})

export const toggleIntervalChange = ( history, toggle ) => action(ActionTypes.TOGGLE_INTERVAL_CHANGE, { history, location: {
  replace: true,
  query: {
    'change-interval': toggle
  }}})

export const setRange = ( history, range ) => action(ActionTypes.CHANGE_RANGE, {
  history,
  range,
  location: {
    replace: true,
    query: {
      'start-time': range[0].utc().format(),
      'end-time': range[1].utc().format(),
    }
  }
})

export const setRefreshRate = (autoRefreshRate) => action(ActionTypes.CHANGE_REFRESH_RATE, { autoRefreshRate })

export const searchDashboards = createSearchAction('dashboards')

/* Toggle full screen */
function requestFullScreen() {
  const element = document.documentElement
  const fullscreenNotActive = (
    !document.fullscreenElement &&
    !document.mozFullScreenElement && !document.webkitFullscreenElement
  )

  if (fullscreenNotActive) {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullscreen()
    } else if (element.mozRequestFullscreen) {
      element.mozRequestFullScreen()
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

/* UI action to navigate a link */
function navigateTo(params) {
  params.newWindow ?
    window.open(params.url, '_blank') :
    (window.location.href = params.url)
}
