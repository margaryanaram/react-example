import { fork, take, call, select } from 'redux-saga/effects'

import ActionTypes from '../actions/types'
import * as api from '../services/api'
import { traces } from '../actions/actions'
import { fetchEntity } from '../services/helpers'

/* Selectors */
import { isLoaded } from '../selectors/traces'

export const fetchTraces = fetchEntity.bind(null, traces, api.fetchTraces)

/* Dispatch action */
function* loadTraces(params) {
  const { id } = params;
  const dataExist = yield select(isLoaded, { id });
  if (!dataExist) {
    yield call(
      fetchTraces,
      params,
    )
  }
}

/* Action listners */
function* watchLoadTraces() {
  while (true) {
    const params  = yield take(ActionTypes.TRACES_REQUEST);
    yield fork(loadTraces, params)
  }
}

export default function* root() {
  yield [
    fork(watchLoadTraces),
  ]
}
