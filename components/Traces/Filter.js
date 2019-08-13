import React from 'react'
import { Button } from 'antd';
import { themr } from 'react-css-themr';

const Filter = props => {

  const { theme, filterName, filter, value, handleRemoveFilter } = props;

  return <div className={theme.activeFilter}>
    <Button onClick={() => handleRemoveFilter(filterName, filter)} type="primary" shape="circle" />
    <p>{filterName}{value}</p>
  </div>
};

export default themr('Traces')(Filter);


