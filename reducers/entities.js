import mergeWith from 'lodash/mergeWith'
import isArray from 'lodash/isArray'

/* Overwrite link from server response */
function arrayMerger(dst, src) {
  if (isArray(dst)) {
    return src;
  }
}
export const defaultEntities = {
  auth: {},
  menus: {},
  profiles: {},
  errors: {},
  data: {},
  dashboards: {},
  datasources: {},
  components: {},
  traces: {},
}

export default (state = defaultEntities, action) => {
  const { response } = action;

  if (response && response.result && response.entities) {
    return mergeWith({}, state, response.entities, arrayMerger)
  }

  return state
}
