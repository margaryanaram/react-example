import { fork } from 'redux-saga/effects'

import dashboardSagas from './dashboards'
import datasourcesSagas from './datasources'

import dataSagas from './data'
import profileSagas from './profile'
import tracesSagas from './traces'
import servicesSagas from './tServices'

export default function* root() {
  yield [
    fork(dashboardSagas),
    fork(datasourcesSagas),
    fork(dataSagas),
    fork(profileSagas),
    fork(tracesSagas),
    fork(servicesSagas),
  ]
}
