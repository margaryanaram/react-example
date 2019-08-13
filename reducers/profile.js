import { createHanlder } from '../services/helpers'
import ActionTypes from '../actions/types'

export default createHanlder(
  ActionTypes.PROFILE_REQUEST_PENDING,
  ActionTypes.PROFILE_REQUEST_SUCCESS,
  ActionTypes.PROFILE_REQUEST_FAILURE,
  (state, action) => ({ id:  action.response.result })
)
