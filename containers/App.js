import React, { Component } from 'react'
import { Layout } from 'antd'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { themr } from 'react-css-themr';

import * as Actions from '../actions/actions'
import {
  Route,
  withRouter
} from 'react-router-dom'

/* Components */
import MenuSidebar from '../components/Menu/MenuSidebar'
import HeaderContent from '../components/HeaderContent/HeaderContent'
import TimeIntervalBlock from '../components/TimeInterval/TimeIntervalBlock'

/* Containers */
import Dashboard from './Dashboard/Dashboard';
import Traces from './Traces/Traces';

const { Header, Content } = Layout;

const mapStateToProps = (state) => ({ ui: state.ui })
const mapDispatchToProps = (dispatch) => ({ actions: bindActionCreators(Actions, dispatch) })

class App extends Component {
  /* Base fetch should go here */
  componentWillMount() {
    this.props.actions.loadProfile();
  }

  render() {

    const { theme } = this.props
    return (
      <Layout style={{ height: '100vh' }} className="ant-layout-has-sider">
        <MenuSidebar />
        <Layout className={theme.container}>
          <Header style={{padding:0}}><HeaderContent pathName={this.props.location.pathname} /></Header>
          {/* Global placeholders */}
          <Content className={theme.widgets}>
            <TimeIntervalBlock />
          </Content>
          <Content style={{padding: 15}}>
            {/*<Breadcrumb>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item><a href="">Application Center</a></Breadcrumb.Item>
              <Breadcrumb.Item><a href="">Application List</a></Breadcrumb.Item>
              <Breadcrumb.Item>An Application</Breadcrumb.Item>
            </Breadcrumb>*/}
            {/* Main route – Dashboard */}
            <Route path="/" component={Dashboard} />
            <Route path="/traces" component={Traces} />
          </Content>
        </Layout>
      </Layout>
    )
  }
}

export default



withRouter(connect(mapStateToProps, mapDispatchToProps)(themr('AppContainer')(App)))
