import { createHanlder } from '../services/helpers'
import ActionTypes from '../actions/types'

export default createHanlder(
  ActionTypes.DATASOURCES_REQUEST_PENDING,
  ActionTypes.DATASOURCES_REQUEST_SUCCESS,
  ActionTypes.DATASOURCES_REQUEST_FAILURE,
)
