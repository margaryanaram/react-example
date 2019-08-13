import ActionTypes from '../actions/types'

const defaultState = {
  waitingToLoad: 0,
  loadedDatasources: [],
  isLoading: false,
  errors: []
}

export default (state = defaultState, action) => {

  if (action.type === ActionTypes.DATA_REQUEST_PENDING) {
    return {
      ...state,
      waitingToLoad: state.waitingToLoad + 1,
      isLoading: true
    }
  } else if (
    action.type === ActionTypes.DATA_REQUEST_SUCCESS ||
    action.type === ActionTypes.DATA_REQUEST_FAILURE
  ) {
    const waitingToLoad = state.waitingToLoad - 1

    return {
      ...state,
      loadedDatasources: loadedDatasources(state.loadedDatasources, action),
      waitingToLoad,
      isLoading: waitingToLoad !== 0,
      errors: errors(state.error, action)
    }
  }

  return state;
}

function errors(state = [], action) {
  const { type, error } = action

  if (type === ActionTypes.DATA_REQUEST_FAILURE && error) {
    return [].concat(state, error)
  }

  return state
}

function loadedDatasources(state = [], action) {
  const { type, datasource} = action

  if (type === ActionTypes.DATA_REQUEST_SUCCESS) {
    return [].concat(state, datasource.id)
  }

  return state;

}

