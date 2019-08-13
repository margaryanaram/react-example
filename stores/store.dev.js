import { applyMiddleware, compose, createStore } from 'redux'
import { createLogger } from 'redux-logger'

import middlewares, { sagaMiddleware, searchMiddleware } from '../middlewares'
import reducers from '../reducers'
import rootSaga from '../sagas'

export const runSaga = () => sagaMiddleware.run(rootSaga);

export const initStore = intialState => {
  const store = createStore(
    reducers,
    intialState,
    compose(
      applyMiddleware(createLogger(), ...middlewares),
      searchMiddleware
    )
  )

  return store
}
