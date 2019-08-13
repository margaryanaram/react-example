import { createHanlder } from '../services/helpers'
import ActionTypes from '../actions/types'

export const dashboards = createHanlder(
  ActionTypes.DASHBOARDS_REQUEST_PENDING,
  ActionTypes.DASHBOARDS_REQUEST_SUCCESS,
  ActionTypes.DASHBOARDS_REQUEST_FAILURE,
)

export const dashboardsRecentViewed = function (state = [], action) {
  const { type, id } = action

  if (type === ActionTypes.DASHBOARDS_REQUEST && id && state.indexOf(id) === -1) {
    return [action.id, ...state].slice(0, 20);
  }

  return state
}
