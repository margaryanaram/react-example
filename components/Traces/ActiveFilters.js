import React, { Component } from 'react'
import Filter from './Filter';

class ActiveFilters extends Component {

  getComparisonSign(status, className) {
    switch (status) {
    case 'gt':
      return <span className={className} key={0}>&gt;</span>;
    case 'ge':
      return <span className={className} key={0}>&ge;</span>;
    case 'lt':
      return <span className={className} key={0}>&lt;</span>;
    case 'le':
      return <span className={className} key={0}>&le;</span>;
    default:
    }
  }

  render() {
    const { theme, currentFilters, handleRemoveFilter } = this.props;
    return (
      <div className={theme.allFilters}>
        {
          Object.keys(currentFilters).map((key) => {
            let separator = "_";
            let currFilters = currentFilters[key];
            if(currFilters.all) {
              currFilters = currFilters.all;
              separator = "_sprtr_";
            }
            if(currFilters.length > 0) {
              return currFilters.map((filter) => {
                const filterSegments = filter.split(separator);
                const filterVal = (key === 'duration' || key === 'selfTime') ?
                  [this.getComparisonSign(filterSegments[0], theme.filterValItem), <span className={theme.filterValItem} key={1}>{filterSegments[1]}ms</span>]
                  :
                  (key === 'tags' ? [
                    <span className={theme.filterValItem} key={0}>{filterSegments[0]}</span>,
                    <span className={theme.filterValItem} key={1}>&#61;</span>,
                    <span className={theme.filterValItem} key={2}>{filterSegments[1]}</span>,
                  ] : [<span className={theme.filterValItem} key={0}>{filter}</span>]);
                return <Filter
                  key={filter}
                  filterName={key}
                  filter={filter}
                  handleRemoveFilter={handleRemoveFilter.bind(this)}
                  value={filterVal}
                />
              })
            }
          })
        }
      </div>
    )
  }
}

export default ActiveFilters;