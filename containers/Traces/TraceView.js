import React, {Component} from 'react'
import {connect} from 'react-redux'
import {themr} from 'react-css-themr';
import {Row, Col, Layout, Table, Form, Input} from 'antd';
import {durationUnit, getPercentageOfDuration} from '../../services/date';

import {getParentSpanService} from '../../selectors/traces';
import {makeMapStateToProps, mapDispatchToProps} from '../../services/helpers';

import StackedProgressBar from '../../components/Spans/StackedProgressBar';
import OpenedSpanTable from '../../components/Spans/OpenedSpanTable';
import ColumnTitleContainer from '../../components/Traces/ColumnTitleContainer';
import FilterDialog from '../../components/Traces/FilterDialog';


class TracesView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      trace: null,
      traceTitle: null,
      reformedSpans: null,
      services: null,
      tags: null,
      errorsCount: null,
      currentFilters: null,
      openedSpan: null,
      currentPage: 1,
      wholeDuration: null,
      sortedInfo: null,
      filterDialog: false,
      initiatorsFound: [],
      tagsFound: [],
      searchedItem: null,
      waterfall: null
    };
    this.setWaterfall = this.setWaterfall.bind(this);
    this.changeWaterfall = this.changeWaterfall.bind(this);
    this.sortHandler = this.sortHandler.bind(this);
  }

  componentDidMount() {
    this.props.actions.loadTraces(this.props.traceID);
    const {trace} = this.props;
    if (trace && trace.traceID) {
      const query = new URLSearchParams(this.props.location.search);
      this.newState(query, trace);
    }
    window.addEventListener('resize', this.setWaterfall);
  }

  componentWillReceiveProps(nextProps) {
    const {trace} = nextProps;
    const query = new URLSearchParams(nextProps.location.search);
    if (trace !== this.props.trace) {
      this.newState(query, trace);
    }
  }

  componentDidUpdate() {
    if(this.refs && (this.state.waterfall && !this.state.waterfall.columns)) {
      this.setWaterfall()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setWaterfall);
  }

  setWaterfall() {
    this.setState(prevState => {
      return {
        waterfall: this.getWaterfallData(prevState.wholeDuration, prevState.waterfall.mode)
      }
    })
  }

  getWtClDuration(duration, columnCount) {
    const columnDur = duration / columnCount;
    let res = {
      length: 0
    };
    for(let i = 0; i <= columnCount; ++i) {
      const start = durationUnit(Math.round(columnDur * i));
      res[i] = {
        start,
        offset: getPercentageOfDuration(start.origin, duration)
      };
      ++ res.length;
    }
    return res;
  }

  getWaterfallData (wholeDuration, waterFallMode) {
    let waterfall = {
      mode: waterFallMode ? waterFallMode : 'absolute'
    };
    if(this.refs && this.refs.waterfall) {
      const waterfallWidth = this.refs.waterfall.clientWidth;
      waterfall.columns = Math.ceil((waterfallWidth - 250) / 40);
      waterfall.columns = waterfall.columns < 3 ? 3 : waterfall.columns;
      waterfall.durations = this.getWtClDuration(wholeDuration, waterfall.columns);
      waterfall.columnsWidth = Math.round(getPercentageOfDuration(Math.round(wholeDuration / waterfall.columns), this.state.wholeDuration)) + '%';
    }
    return waterfall;
  }

  getTagsKeyVal(tags) {
    let res = {};
    for(let i = 0; i < tags.length; ++ i) {
      let tagArr = tags[i].split("_sprtr_");
      if(res[tagArr[0]]) {
        res[tagArr[0]].push(tagArr[1])
      } else {
        res[tagArr[0]] = [tagArr[1]]
      }
    }
    return res;
  }

  setFiltersObj(query) {
    const allTags = query.getAll('tags');
    return (query.getAll('services').length > 0 || query.getAll('initiators').length > 0 || query.getAll('tags').length > 0 || query.get('duration') || query.get('selfTime')) ?
      {
        services: query.getAll('services'),
        initiators: query.getAll('initiators'),
        tags: {
          all: allTags,
          byKeyVal: this.getTagsKeyVal(allTags)
        },
        duration: query.getAll('duration'),
        selfTime: query.getAll('selfTime')
      } : null;
  }

  newState(query, trace) {
    const wholeDuration = durationUnit(this.getProcessDuration(trace.spans));
    const servicesTagsErrors = this.getServicesTagsErrors(trace);
    const currentFilters = this.setFiltersObj(query);
    const reformedSpans = this.reformSpans(trace, wholeDuration, currentFilters, query.get('search'));
    const openedSpan = query.get('openedSpanId') ? reformedSpans.find(span => {
      return span.key === query.get('openedSpanId');
    }) : null;
    const mainSpan = this.getMainSpan(trace);
    const waterFallMode = query.get('mode');
    this.setState({
      trace: trace,
      traceTitle: mainSpan.traceTitle,
      traceStartTime: mainSpan.startTime,
      reformedSpans: reformedSpans,
      services: servicesTagsErrors.services,
      tags: servicesTagsErrors.tags,
      errorsCount: servicesTagsErrors.errCount,
      currentFilters: currentFilters,
      openedSpan: openedSpan,
      currentPage: query.get('page') ? query.get('page') : 1,
      wholeDuration: wholeDuration.origin,
      sortedInfo: query.get('sort') ? {
        order: query.get('sort')[0] === '-' ? 'descend' : 'ascend',
        field: (query.get('sort')[0] === '+' || query.get('sort')[0] === '-') ? query.get('sort').substr(1) : query.get('sort')
      } : null,
      searchedItem: query.get('search'),
      waterfall: this.getWaterfallData(wholeDuration.origin, waterFallMode)
    });
  }

  getMainSpan(trace) {
    const mainSpan = trace.spans.filter(span => span.spanID === this.props.traceID)[0];
    return {
      traceTitle: this.getServiceName(trace.processes, mainSpan.processID) + ' ' + mainSpan.operationName,
      startTime: mainSpan.startTime
    }
  }

  createReformedSpan(trace, span, serviceName, duration, selfDuration, allNestedChild, durationAmount) {
    const refs = span.references[0];
    return {
      key: span.spanID,
      operation: {
        operation: span.operationName,
        className: this.props.theme.tableRowOperation
      },
      service: serviceName,
      duration: duration,
      selfTime: selfDuration,
      initiator: refs && refs.refType === 'CHILD_OF' ? getParentSpanService(refs.spanID, trace) : null,
      waterfall: {
        duration: duration,
        durationAmount: durationAmount,
        childProcesses: durationUnit(this.getProcessDuration(allNestedChild)),
        selfTime: selfDuration,
        startTime: span.startTime
      },
      childSpans: allNestedChild,
      logs: span.logs,
      tags: span.tags
    }
  }

  getServiceName(processes, processID) {
    return processes[processID].serviceName;
  }

  getServicesTagsErrors(trace) {
    let errCount = 0;
    let services = [];
    let tags = [];
    for(let i = 0; i < trace.spans.length; ++i) {
      let span = trace.spans[i];
      const serviceName = this.getServiceName(trace.processes, span.processID);
      if(services.indexOf(serviceName) === -1) {
        services.push(serviceName);
      }
      if(span.tags.length > 0) {
        for(let n = 0; n < span.tags.length; ++n) {
          const tagsKey = span.tags[n].key;
          if(tagsKey === 'error') {
            ++ errCount;
          }
          if(tags.indexOf(tagsKey) === -1) {
            tags.push(tagsKey);
          }
        }
      }
    }
    return {
      services,
      tags,
      errCount
    };
  }

  getProcessDuration(data) {
    let amount = 0;
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        amount += data[i].duration;
      }
    }
    return amount;
  }

  comparisonCases(order, value, duration) {
    switch (order) {
    case 'gt':
      return duration.inMS > value;
    case 'ge':
      return duration.inMS >= value;
    case 'lt':
      return duration.inMS < value;
    case 'le':
      return duration.inMS <= value;
    default:
      return false;
    }
  }

  timeFiltersCases(filter, duration) {
    if (filter.length > 0) {
      const firstComparison = filter[0].split('_');
      if (filter[1]) {
        const secondComparison = filter[1].split('_');
        return this.comparisonCases(firstComparison[0], firstComparison[1], duration) && this.comparisonCases(secondComparison[0], secondComparison[1], duration);
      }
      return this.comparisonCases(firstComparison[0], firstComparison[1], duration);
    }
    return false;
  }

  ifTimeFiltersMatch(filters, duration, selfDuration) {
    let byTimeFilter = null;
    if (filters.duration.length > 0 || filters.selfTime.length > 0) {
      byTimeFilter = {};
      let byDuration = this.timeFiltersCases(filters.duration, duration);
      let bySelfTime = this.timeFiltersCases(filters.selfTime, selfDuration);
      byTimeFilter.filtered = byDuration && bySelfTime;
      if (filters.duration.length > 0 && filters.selfTime.length === 0) {
        byTimeFilter.filtered = byDuration;
      }
      if (filters.duration.length === 0 && filters.selfTime.length > 0) {
        byTimeFilter.filtered = bySelfTime;
      }
    }
    return byTimeFilter;
  }

  initiatorAndTimeCondition(filters, spanID, byTimeFilter, context = null) {
    if (context === 'main') {
      return (filters.initiators.length > 0 ? filters.initiators.indexOf(spanID) > -1 : true) && (byTimeFilter ? byTimeFilter.filtered : true);
    }
    return (filters.initiators.length > 0 && filters.initiators.indexOf(spanID) > -1) || (byTimeFilter && byTimeFilter.filtered)
  }

  ifServiceFiltersExist(filters, serviceName, trace, span, duration, selfDuration, allNestedChild, durationAmount, reformedSpans, searchQuery) {
    for (let i = 0; i < filters.services.length; ++i) {
      if (filters.services[i] === serviceName) {
        if (filters.tags.all.length > 0) {
          for (let n = 0; n < span.tags.length; n++) {
            if (Object.keys(filters.tags.byKeyVal).indexOf(span.tags[n].key) > -1) {
              const valArr = filters.tags.byKeyVal[span.tags[n].key];
              for(let g = 0; g < valArr.length; ++ g) {
                if(valArr[g] === span.tags[n].value) {
                  this.addToReformedSpans(serviceName, trace, span, duration, selfDuration, allNestedChild, durationAmount, reformedSpans, searchQuery);
                }
              }
            }
          }
        } else {
          this.addToReformedSpans(serviceName, trace, span, duration, selfDuration, allNestedChild, durationAmount, reformedSpans, searchQuery);
        }
      }
    }
  }

  searchQueryCondition(span, searchQuery) {
    return ((span.service && span.service.toLowerCase() === searchQuery.toLowerCase())
      || span.operationName.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1
      || this.searcInTags(span.tags, searchQuery)
      || span.spanID.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1)
  }

  addToReformedSpans(serviceName, trace, span, duration, selfDuration, allNestedChild, durationAmount, reformedSpans, searchQuery) {
    if (searchQuery) {
      if (this.searchQueryCondition(span, searchQuery)) {
        reformedSpans.push(this.createReformedSpan(trace, span, serviceName, duration, selfDuration, allNestedChild, durationAmount));
      }
    } else {
      reformedSpans.push(this.createReformedSpan(trace, span, serviceName, duration, selfDuration, allNestedChild, durationAmount));
    }
  }

  searcInTags(tags, query) {
    if (tags && tags.length > 0) {
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].key.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
          return true;
        }
      }
    }
    return false;
  }

  reformSpans(trace, durationAmount, filters, searchQuery) {
    const reformedSpans = [];
    for (let g = 0; g < trace.spans.length; g++) {
      const span = trace.spans[g];
      let serviceName = this.getServiceName(trace.processes, span.processID);
      let allNestedChild = [];
      this.getAllNestedChild(trace.spans, span.spanID, allNestedChild, trace.processes);
      let selfDuration = durationUnit(span.duration);
      let duration = durationUnit(span.duration + this.getProcessDuration(allNestedChild));
      if (filters) {
        let byTimeFilter = this.ifTimeFiltersMatch(filters, duration, selfDuration);
        const serviceFilters = filters.services;
        if (this.initiatorAndTimeCondition(filters, span.spanID, byTimeFilter, 'main')) {
          if (serviceFilters.length > 0) {
            this.ifServiceFiltersExist(filters, serviceName, trace, span, duration, selfDuration, allNestedChild, durationAmount, reformedSpans, searchQuery)
          }
          else if (filters.tags.all.length > 0) {
            for (let n = 0; n < span.tags.length; n++) {
              if (Object.keys(filters.tags.byKeyVal).indexOf(span.tags[n].key) > -1) {
                const valArr = filters.tags.byKeyVal[span.tags[n].key];
                for(let g = 0; g < valArr.length; ++ g) {
                  if(valArr[g] === span.tags[n].value) {
                    this.addToReformedSpans(serviceName, trace, span, duration, selfDuration, allNestedChild, durationAmount, reformedSpans, searchQuery);
                  }
                }
              }
            }
          }
          else if (this.initiatorAndTimeCondition(filters, span.spanID, byTimeFilter)) {
            this.addToReformedSpans(serviceName, trace, span, duration, selfDuration, allNestedChild, durationAmount, reformedSpans, searchQuery);
          }
        }
      }
      else {
        this.addToReformedSpans(serviceName, trace, span, duration, selfDuration, allNestedChild, durationAmount, reformedSpans, searchQuery);
      }
    }
    return reformedSpans;
  }

  handlePageChange(pagination, filters, sorter) {
    const newPage = pagination.current;
    const query = new URLSearchParams(this.props.location.search);
    query.set("page", newPage);
    this.props.history.push(`?${query.toString()}`);
  }

  rowClickHandler(record) {
    const query = new URLSearchParams(this.props.location.search);
    query.set("openedSpanId", record.key);
    this.props.history.push(`?${query.toString()}`);
  };

  closeSpan() {
    const query = new URLSearchParams(this.props.location.search);
    query.delete("openedSpanId");
    this.props.history.push(`?${query.toString()}`);
  }

  getAllNestedChild(spans, spanID, childArr, processes) {
    for (let i = 0; i < spans.length; ++i) {
      if (spans[i].references[0] && spans[i].references[0].spanID === spanID) {
        spans[i]['service'] = this.getServiceName(processes, spans[i].processID);
        childArr.push(spans[i]);
        this.getAllNestedChild(spans, spans[i].spanID, childArr, processes);
      }
    }
  }

  changeWaterfall() {
    const query = new URLSearchParams(this.props.location.search);
    const newMode = this.state.waterfall.mode === 'absolute' ? 'relative' : 'absolute';
    query.set("mode", newMode);
    this.props.history.push(`?${query.toString()}`);
  }

  handleSearchChange(event) {
    let searchedItem = event.target.value;
    if (searchedItem.length === 0) {
      searchedItem = null;
    }
    this.setState({
      searchedItem
    });
  }

  handleSearch(event) {
    if (event.keyCode === 13) {
      const query = new URLSearchParams(this.props.location.search);
      if (this.state.searchedItem) {
        query.set("search", this.state.searchedItem);
        query.delete("openedSpanId");
        query.delete("filter");
      } else {
        query.delete("search");
      }
      this.props.history.replace(`?${query.toString()}`);
    }
  }

  sortHandler(field) {
    const {sortedInfo} = this.state;
    const query = new URLSearchParams(this.props.location.search);
    if (!sortedInfo || sortedInfo.field !== field) {
      query.set("sort", '+'.toString() + field);
    } else {
      if (sortedInfo.order === 'ascend') {
        query.set("sort", '-' + field);
      } else {
        query.delete("sort");
      }
    }
    this.props.history.push(`?${query.toString()}`);
  }

  toggleFilterDialog() {
    this.props.form.resetFields();
    this.setState({
      filterDialog: !this.state.filterDialog
    });
  }

  handleFilterSubmit(e) {
    e.preventDefault();
    const query = new URLSearchParams(this.props.location.search);
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.services) {
          this.setFilterByType(query, values.services, 'services');
        }
        if (values.initiators) {
          this.setFilterByType(query, values.initiators, 'initiators');
        }
        if (values.tagKey && values.tagVal) {
          this.setFilterByType(query, `${values.tagKey}_sprtr_${values.tagVal}`, 'tags');
        }
        if (values.duration) {
          const byDuration = this.state.currentFilters ? this.state.currentFilters.duration : null;
          this.setTimeFilters(query, byDuration, 'duration', values.durationStatus, values.duration);
        }
        if (values.selfTime) {
          const bySelfTime = this.state.currentFilters ? this.state.currentFilters.selfTime : null;
          this.setTimeFilters(query, bySelfTime, 'selfTime', values.selfTimeStatus, values.selfTime);
        }
        this.toggleFilterDialog();
        this.props.history.replace(`?${query.toString()}`);
      }
    });
  }

  setTimeFilters(query, filter, filterName, status, value) {
    if (filter && filter.length > 0) {
      if (filter[1]) {
        query.delete(filterName);
        for (let n = 0; n < 2; ++n) {
          if (filter[0].split('_')[0][0] === status[0]) {
            query.append(filterName, status + '_' + value);
          } else {
            query.append(filterName, filter[n]);
          }
        }
      } else {
        if (filter[0].split('_')[0][0] === status[0]) {
          query.set(filterName, status + '_' + value);
        } else {
          query.append(filterName, status + '_' + value);
        }
      }
    } else {
      query.set(filterName, status + '_' + value);
    }
  }

  setFilterByType(query, value, type) {
    let currentFilter = this.state.currentFilters ? this.state.currentFilters[type] : null;
    if (type === 'services') {
      for (let i = 0; i < value.length; ++i) {
        if (!this.state.currentFilters || currentFilter.indexOf(value[i]) === -1) {
          query.append(type, value[i]);
        }
      }
    } else {
      if(type === 'tags' && currentFilter) {
        currentFilter = currentFilter.all
      }
      if (!this.state.currentFilters || currentFilter.indexOf(value) === -1) {
        query.append(type, value);
      }
    }
  }

  handleRemoveFilter(key, filter) {
    const query = new URLSearchParams(this.props.location.search);
    query.delete(key);
    let currentFilters = this.state.currentFilters[key];
    if(key === 'tags') {
      currentFilters = currentFilters.all;
    }
    if (filter) {
      let newFilters = currentFilters.filter((item) => {
        return item !== filter;
      });
      for (let i = 0; i < newFilters.length; ++i) {
        query.append([key], newFilters[i]);
      }
    }
    this.props.history.replace(`?${query.toString()}`);
  }

  handleFilterSearchChange(value, field) {
    let found = [];
    if (value.length > 0) {
      for (let i = 0; i < this.props.trace.spans.length; i++) {
        const span = this.props.trace.spans[i];
        if (field === 'initiatorsFound') {
          if (span.spanID.toLowerCase().indexOf(value.toLowerCase()) > -1) {
            found.push(span.spanID);
          }
        }
        if (field === 'tagsFound') {
          const tagsKey = this.props.form.getFieldValue('tagKey');
          for (let n = 0; n < span.tags.length; n++) {
            const tag = span.tags[n];
            if (found.indexOf(tag.value) === -1) {
              if ((tag.value + '').toLowerCase().indexOf(value.toLowerCase()) > -1) {
                if(tagsKey && tagsKey.length > 0) {
                  if(tag.key === tagsKey) {
                    found.push(tag.value);
                  }
                }
              }
            }
          }
        }
      }
    }
    this.setState({
      [field]: found
    });
  }

  handleTagKeyChange() {
    this.setState({
      tagsFound: []
    });
    this.props.form.setFieldsValue({
      tagVal: '',
    });
  }

  render() {
    const {theme} = this.props;
    const {getFieldDecorator} = this.props.form;
    let {sortedInfo, currentFilters, services, tags, waterfall} = this.state;
    sortedInfo = sortedInfo || {};

    const columns = [
      {
        title: <ColumnTitleContainer
          theme={theme}
          isActive={sortedInfo.field === 'operation'}
          sorter={this.sortHandler}
          changeWaterfall={this.changeWaterfall}
          order={sortedInfo.order}
          field={'Operation'}
          activeClass={theme.activeOrder}
          inactiveClass={theme.orderBtn}
        />,
        dataIndex: 'operation',
        render: (value, row, index) => {
          let spanStatusStyle = theme.spanStatus;
          for(let i = 0; i < row.tags.length; ++ i) {
            if(row.tags[i].key === 'error') {
              spanStatusStyle += ' ' + theme.spanStatusErr;
              break;
            }
          }
          const obj = {
            children: <p className={theme.tableRowOperation}>
              <span className={spanStatusStyle}></span>
              {value.operation}
            </p>,
            props: {},
          };
          return obj;
        },
        sorter: (a, b) => {
          const textA = a.operation.operation.toUpperCase();
          const textB = b.operation.operation.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        },
        sortOrder: sortedInfo.field === 'operation' && sortedInfo.order,
        width: '18%'
      },
      {
        title: <ColumnTitleContainer
          theme={theme}
          isActive={sortedInfo.field === 'service'}
          sorter={this.sortHandler}
          order={sortedInfo.order}
          field={'Service'}
          activeClass={theme.activeOrder}
          inactiveClass={theme.orderBtn}
        />,
        dataIndex: 'service',
        width: '13%',
        render: (value, row, index) => {
          const obj = {
            children: <span className={theme.titleValue}>{value}</span>,
            props: {},
          };
          return obj;
        },
        sorter: (a, b) => {
          const textA = a.service.toUpperCase();
          const textB = b.service.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        },
        sortOrder: sortedInfo.field === 'service' && sortedInfo.order,
      },
      {
        title: <ColumnTitleContainer
          theme={theme}
          isActive={sortedInfo.field === 'duration'}
          sorter={this.sortHandler}
          order={sortedInfo.order}
          field={'Duration'}
          activeClass={theme.activeOrder}
          inactiveClass={theme.orderBtn}
        />,
        dataIndex: 'duration',
        width: '13%',
        render: (value, row, index) => {
          const obj = {
            children: <span className={theme.titleValue}>{value.value + value.unit}</span>,
            props: {},
          };
          return obj;
        },
        sorter: (a, b) => a.duration.origin - b.duration.origin,
        sortOrder: sortedInfo.field === 'duration' && sortedInfo.order,
      },
      {
        title: <ColumnTitleContainer
          theme={theme}
          isActive={sortedInfo.field === 'selfTime'}
          sorter={this.sortHandler}
          order={sortedInfo.order}
          field={'Self time'}
          activeClass={theme.activeOrder}
          inactiveClass={theme.orderBtn}
        />,
        dataIndex: 'selfTime',
        width: '13%',
        render: (value, row, index) => {
          const obj = {
            children: <span className={theme.titleValue}>{value.value + value.unit}</span>,
            props: {},
          };
          return obj;
        },
        sorter: (a, b) => a.selfTime.origin - b.selfTime.origin,
        sortOrder: sortedInfo.field === 'selfTime' && sortedInfo.order,
      },
      {
        title: <ColumnTitleContainer
          theme={theme}
          isActive={sortedInfo.field === 'initiator'}
          sorter={this.sortHandler}
          order={sortedInfo.order}
          field={'Initiator'}
          activeClass={theme.activeOrder}
          inactiveClass={theme.orderBtn}
        />,
        dataIndex: 'initiator',
        width: '13%',
        render: (value, row, index) => {
          const obj = {
            children: <span className={theme.titleValue}>{value}</span>,
            props: {},
          };
          return obj;
        },
        sorter: (a, b) => {
          if (a.initiator && b.initiator) {
            const textA = a.initiator.toUpperCase();
            const textB = b.initiator.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
          }
        },
        sortOrder: sortedInfo.field === 'initiator' && sortedInfo.order,
      },
      {
        title: <div ref="waterfall" id="waterfall" className={theme.waterfallTitle}>
          {
            waterfall && waterfall.durations && Array.prototype.map.call(waterfall.durations, (item, index) => {
              if(index === 0) {
                return <span key={index}>Waterfall</span>;
              }
              let offset = {
                left: item.offset + '%'
              };
              if(index === waterfall.durations.length - 1) {
                delete offset.left;
                offset.right = 0;
              }
              return <span style={offset} className={theme.wtrClmn} key={index}>{item.start.value}{item.start.unit}</span>
            })
          }
        </div>,
        dataIndex: 'waterfall',
        render: (value, row, index) => {
          const obj = {
            children: <StackedProgressBar
              traceStartTime={this.state.traceStartTime}
              mode={this.state.waterfall.mode}
              durations={value}
              tags={row.tags}
            />,
            props: {},
          };
          return obj;
        },
        width: '30%'
      },
    ];
    return (
      <Layout className={theme.traceViewLayout}>
        {
          this.state.traceTitle &&
          <Row className={theme.traceViewContainer} type="flex">
            <Col className={theme.traceTitleContainer}>
              <Col className={theme.traceHeaderContainer}>
                <p className={theme.traceTitle}>{this.state.traceTitle}</p>
                <Input
                  placeholder="Type to search"
                  onChange={(e) => this.handleSearchChange(e)}
                  onKeyDown={(e) => this.handleSearch(e)}
                  value={this.state.searchedItem}
                />
              </Col>
              <FilterDialog
                theme = {theme}
                filterDialog = {this.state.filterDialog}
                toggleFilterDialog = {this.toggleFilterDialog.bind(this)}
                handleFilterSubmit = {this.handleFilterSubmit.bind(this)}
                getFieldDecorator = {getFieldDecorator}
                services = {services}
                tags = {tags}
                handleFilterSearchChange = {this.handleFilterSearchChange.bind(this)}
                handleTagKeyChange = {this.handleTagKeyChange.bind(this)}
                tagsFound = {this.state.tagsFound}
                currentFilters = {currentFilters}
                initiatorsFound = {this.state.initiatorsFound}
                handleRemoveFilter = {this.handleRemoveFilter.bind(this)}
              />
            </Col>
            <Col className={theme.tablesContainer}>
              <div className={theme.waterfallBorder + ' ' + theme.waterfallBorderSolid} />
              {
                (waterfall &&  waterfall.durations) && Array.prototype.map.call(waterfall.durations, (item, index) => {
                  let offset = {
                    left: "calc(((70% ) + (((30%) * " + item.offset +")) / 100) - 12px)",
                    color: 'red'
                  };
                  if(index > 0 && index < waterfall.durations.length - 1) {
                    return <div style={offset} key={index} className={theme.waterfallBorder + ' ' + theme.borderDashed} />
                  }
                })
              }
              <Table
                className={theme.traceTable}
                columns={columns}
                dataSource={this.state.reformedSpans}
                onRowClick={(record, index, event) => this.rowClickHandler(record, index, event)}
                onChange={(pagination, filters, sorter) => this.handlePageChange(pagination, filters, sorter)}
                scroll={{y: 'calc(100vh - 350px)'}}
                pagination={
                  {
                    current: parseInt(this.state.currentPage, 10),
                    pageSize: 20
                  }
                }
                size="small"
                footer={() => {
                  return <div className={theme.traceTableFooter}>
                    <p>Total spans:{this.props.trace.spans.length}</p>
                    <p className={theme.errorSpansCount}>Error spans:{this.state.errorsCount}</p>
                  </div>;
                }}
              />
              {
                this.state.openedSpan &&
                <div className={theme.openedSpanBlockParent}>
                  <OpenedSpanTable theme={theme} handleCloseSpan={this.closeSpan.bind(this)} openedSpan={this.state.openedSpan}/>
                </div>
              }
            </Col>
          </Row>
        }
      </Layout>
    )
  }
}

TracesView = Form.create({})(TracesView);

export default connect(
  makeMapStateToProps('traceID', 'trace'),
  mapDispatchToProps)(themr('Traces')(TracesView))