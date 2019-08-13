import { compose, applyMiddleware, createStore } from 'redux'

import middlewares, { sagaMiddleware, searchMiddleware } from '../middlewares'
import reducers from '../reducers'
import rootSaga from '../sagas'

export const runSaga = () => sagaMiddleware.run(rootSaga);

export const initStore = intialState => {
  const store = createStore(
    reducers,
    intialState,
    compose(
      applyMiddleware(...middlewares),
      searchMiddleware
    )
  )

  return store
}

