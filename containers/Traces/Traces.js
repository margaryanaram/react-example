import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { themr } from 'react-css-themr';
import { bindActionCreators } from 'redux';

/* Sub-Containers */
import TracesList from './TracesList'
import TraceView from './TraceView'

import * as Actions from '../../actions/actions'

const mapDispatchToProps = (dispatch) => ({ actions: bindActionCreators(Actions, dispatch) });

class Traces extends Component {

  componentDidMount() {
    this.props.actions.loadServices();
  }

  render() {
    return (
      <Switch>
        <Route path="/traces" exact component={TracesList} />
        <Route exact strict path="/traces/filter/:service" component={TracesList}/>
        <Route exact strict path="/traces/:traceID([0-9a-z]+)" component={TraceView}/>
      </Switch>
    )
  }
}

export default connect(null, mapDispatchToProps)(themr('Traces')(Traces));
