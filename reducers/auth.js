import { createHanlder } from '../services/helpers'
import ActionTypes from '../actions/types'

export default createHanlder(
  ActionTypes.AUTH_REQUEST_PENDING,
  ActionTypes.AUTH_REQUEST_SUCCESS,
  ActionTypes.AUTH_REQUEST_FAILURE,
  (state, action) => ({ id:  action.response.result })
)
