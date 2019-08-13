import React from 'react';
import { Icon } from 'antd';
import SorterButton from '../../components/General/SorterButton';

const ColumnTitleContainer = props => {
  const {
    isActive,
    order,
    theme,
    field,
    activeClass,
    inactiveClass,
    sorter,
    changeWaterfall
  } = props;

  return (
    <div className={theme.columnTitleContainer + (isActive ? (' ' + theme.activeSorting) : '')}>
      <p className={theme.columnTitle + (isActive ? (' ' + theme.activeColumnTitle) : '')}>
        <span>
          {
            field === 'Operation' ?
              <span>
                <Icon onClick={() => changeWaterfall()} type="setting" className={theme.waterfallMode}/>
                <span>{field}</span>
              </span>
              :
              <span>{field}</span>
          }
        </span>
        <SorterButton
          sorter={sorter}
          isActive={isActive}
          order={order}
          field={field === 'Self time' ? 'selfTime' : field.toLowerCase()}
          activeClass={activeClass}
          inactiveClass={inactiveClass}
        />
      </p>
    </div>
  )
};

export default ColumnTitleContainer;
