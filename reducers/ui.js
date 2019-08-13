import ActionTypes from '../actions/types'
import moment from 'moment'

const query = new URLSearchParams(window.location.search);
const startTime = moment.utc(query.get('start-time'))
const endTime = moment.utc(query.get('end-time'))

export default function(state = {
  sidebarCollapsed: false,
  range: [
    startTime.isValid() ? startTime.format() : moment.utc().startOf('day').format(),
    endTime.isValid() ? endTime.format(): moment.utc().endOf('day').format()
  ],
  autoRefreshRate: false,
  theme: 'light'
}, action) {
  const { type } = action

  if (type === ActionTypes.SIDEBAR_TOGGLE) {
    return {
      ...state,
      sidebarCollapsed: !state.sidebarCollapsed
    }
  }

  if (type === ActionTypes.CHANGE_THEME) {
    return {
      ...state,
      theme: action.themeName
    }
  }

  if (type === ActionTypes.CHANGE_RANGE) {
    return {
      ...state,
      range: action.range
    }
  }

  if (type === ActionTypes.CHANGE_REFRESH_RATE) {
    return {
      ...state,
      autoRefreshRate: action.autoRefreshRate
    }
  }

  return state
}
