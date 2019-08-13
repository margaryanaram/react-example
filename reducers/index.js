import { combineReducers } from 'redux'

import { reducer as search } from 'redux-search'

import auth from './auth'
import entities from './entities'
import errors from './errors'
import data from './data'
import datasources from './datasources'
import * as dashboards from './dashboards'
import profile from './profile'
import ui from './ui'
import traces from './traces'
import services from './tServices'

import ActionTypes from '../actions/types'

const appReducer = combineReducers({
  auth,
  entities,
  errors,
  data,
  datasources,
  ...dashboards,
  profile,
  search,
  ui,
  traces,
  services
})

export default  (state, action) => {
  if (action.type === ActionTypes.SIGN_OUT) {
    // ToDo: No way to reset search index
    state = { search: state.search};
  }

  return appReducer(state, action)
}