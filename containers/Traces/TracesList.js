import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Col, Layout, Select } from 'antd';
import { themr } from 'react-css-themr';

import * as Actions from '../../actions/actions'
import { formatMillisecondTime } from '../../services/date'

import ServiceTabButton from '../../components/Traces/ServiceTabButton';
import SpanProgress from '../../components/Spans/SpanProgress';
import ChildSpanProcesses from '../../components/Spans/ChildSpanProcesses';

import { getAllMainSpans } from  '../../selectors/traces'
import { getAllServices } from  '../../selectors/tServices'

const Option = Select.Option;

const mapStateToProps = (state) => ({
  services: getAllServices(state),
  mainSpans: getAllMainSpans(state),
});

const mapDispatchToProps = (dispatch) => ({ actions: bindActionCreators(Actions, dispatch) });

class TracesList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sortBy: "date",
      mainSpans: [],
      activeFilter: props.match.params
    };
  }

  componentDidMount() {
    this.props.actions.loadTraces();
    this.props.actions.loadServices();
  }

  componentWillReceiveProps(nextProps) {
    const { mainSpans } = nextProps;
    if(mainSpans.length > 0) {
      const serviceName = nextProps.match.params.service;
      this.setState({
        mainSpans: this.filteredArray(mainSpans, serviceName),
        activeFilter: nextProps.match.params
      });
    }
  }

  handleSortClick(value) {
    this.setState({
      sortBy: value
    });
  }

  handleFilter(serviceName) {
    const { history } = this.props;
    history.push(`/traces/filter/${serviceName}`);
  }

  handleTraceRedirect(tracesId) {
    const { history } = this.props;
    history.push(`/traces/${tracesId}`);
  }

  filteredArray(data, serviceName) {
    let spans = data;
    if(serviceName && serviceName !== 'all') {
      spans = data.filter(span => span.serviceName === serviceName)
    }
    return spans;
  }

  render() {
    const { theme } = this.props;
    let servicesKey = 0;
    return (
      <Layout className={theme.traceListContainer}>
        {
          this.props.services &&
                <Row className={theme.traceListFilterBlock} type="flex">
                  <p>Traces</p>
                  <Col type="flex">
                    <ServiceTabButton activeFilter={this.state.activeFilter} filterBy={this.handleFilter.bind(this)} key={servicesKey} service={'all'} />
                    {
                      this.props.services.map( service => {
                        servicesKey ++;
                        return <ServiceTabButton activeFilter={this.state.activeFilter} filterBy={this.handleFilter.bind(this)} key={servicesKey} service={service} />;
                      })
                    }
                  </Col>
                </Row>
        }
        {
          this.state.mainSpans &&
                <Row>
                  <Row className={theme.tracesSortBlock} type="flex">
                    <Col className={theme.alignCenter}>
                      { this.state.mainSpans.length } Traces found
                    </Col>
                    <Col className={theme.alignCenter}>
                            Sort by: <Select className={theme.tracesSortSelect} defaultValue={this.state.sortBy} onChange={(value) => this.handleSortClick(value)}>
                        <Option value="data">date</Option>
                      </Select>
                    </Col>
                  </Row>
                  <Row className={theme.sepBorder} />
                  <Row>
                    <Col>
                      {
                        this.state.mainSpans.map(span => {
                          const spanIndex = span.content.traceID + '/' + span.content.processID  + '/' + span.content.spanID;
                          return <Row onClick={() => this.handleTraceRedirect(span.content.traceID)} className={theme.traceRowContainer} type="flex" key={spanIndex}>
                            <Col className={theme.traceRowTitle}>
                              <span>{span.serviceName + ': ' + span.content.operationName}</span>
                            </Col>
                            <Col className={theme.traceRowBody}>
                              <SpanProgress theme={theme} start={span.content.startTime} duration={formatMillisecondTime(span.content.duration)} service={span.serviceName} />
                              <ChildSpanProcesses theme={theme} processes={span.childProcesses} />
                            </Col>
                          </Row>
                        })
                      }
                    </Col>
                  </Row>
                </Row>
        }
      </Layout>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(themr('Traces')(TracesList))

