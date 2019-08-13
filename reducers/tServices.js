import { createHanlder } from '../services/helpers'
import ActionTypes from '../actions/types'

export default createHanlder(
  ActionTypes.SERVICES_REQUEST_PENDING,
  ActionTypes.SERVICES_REQUEST_SUCCESS,
  ActionTypes.SERVICES_REQUEST_FAILURE,
  (state, action) => ({
    all:  action.response.result[0]
  })
)
