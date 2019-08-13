import React from 'react'
import { themr } from 'react-css-themr';


export function setColor(color) {
  let borderLeft;
  switch(color) {
  case "redis":
    borderLeft = "#ffce3d";
    break;
  case "frontend":
    borderLeft = "#7265e6";
    break;
  case "mysql":
    borderLeft = "#00a854";
    break;
  case "route":
    borderLeft = "#108EE9";
    break;
  case "customer":
    borderLeft = "#f78e3d";
    break;
  case "driver":
    borderLeft = "#f5317f";
    break;
  default:
    borderLeft = '';
  }
  return borderLeft;
}

const ServiceTabButton = props => {
  const {
    activeFilter,
    service,
    filterBy,
    theme
  } = props;

  let className = theme.container + " " + theme[service];

  if(activeFilter.service && activeFilter.service === service) {
    className += " " + theme.active
  }

  return (
    <button className={className} onClick={() => filterBy(service)}>{service}</button>
  )
};

export default themr('ServiceTabButton')(ServiceTabButton)
