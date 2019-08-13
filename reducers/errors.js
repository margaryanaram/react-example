import ActionTypes from '../actions/types'

export default function(state = [], action) {
  const { type, error } = action

  if (type === ActionTypes.RESET_ERROR_MESSAGES) {
    return []
  } else if (error) {
    return [...state, error]
  }

  return state
}