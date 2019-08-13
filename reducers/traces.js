import { createHanlder } from '../services/helpers'
import ActionTypes from '../actions/types'

export default createHanlder(
  ActionTypes.TRACES_REQUEST_PENDING,
  ActionTypes.TRACES_REQUEST_SUCCESS,
  ActionTypes.TRACES_REQUEST_FAILURE,
)
