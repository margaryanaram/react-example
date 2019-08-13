import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import AppThemeProvider from '../themes/applyTheme'

/* Pages */
import App from './App'
import Login from './Login/Login'

export default class Root extends Component {
  render() {
    const { store } = this.props

    return (
      <LocaleProvider locale={enUS}>
        <Provider store={store}>
          <AppThemeProvider>
            <Router>
              <Switch>
                <Login.PrivateRoute path="/" component={App} />
                <Route path="/login" component={Login.Page} />
              </Switch>
            </Router>
          </AppThemeProvider>
        </Provider>
      </LocaleProvider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}
