/* eslint-disable no-undef */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable no-useless-escape */

const templateModelContent = `
import {
  getTacitlyState,<% o.pretreatmentList.forEach(function(b){%>
  <%- b %>,<% })%>
  reducerCollection,
  reducerDefaultParameters,
  reducerNameCollection,
} from 'easy-soft-utility';

import {<% o.serviceImportList.forEach(function(b){%>
  <%- b %>,<% })%>
} from '../../services/<%= o.defineName %>';

export const <%= o.defineName %>TypeCollection = {<% o.apis.forEach(function(b){%>
  <%= b.effect %>: "<%= o.defineName %>/<%= b.effect %>",<% })%>
}

export function buildModel() {
  return {
    namespace: '<%= o.defineName %>',

    state: {
      ...getTacitlyState(),
    },

    effects: {<% o.apis.forEach(function(b){%>
      *<%= b.effect %>(
        {
          payload,
          alias,
          pretreatmentSuccessCallback,
          pretreatmentFailCallback,
        },
        { call, put },
      ) {
        const response = yield call(<%= b.service %>, payload);

        const dataAdjust = <%= b.pretreatment %>({
          source: response,
          successCallback: pretreatmentSuccessCallback || null,
          failCallback: pretreatmentFailCallback || null,
        });

        yield put({
          type: reducerNameCollection.reducerRemoteData,
          payload: dataAdjust,
          alias,
          ...reducerDefaultParameters,
        });

        return dataAdjust;
      },<% })%>
    },

    reducers: {
      ...reducerCollection,
    },
  };
}
`;

const templateServiceContent = `
import { request } from 'easy-soft-utility';
<% o.apis.forEach(function(b){%>
export const <%= b.service %>ApiAddress = '<%= b.api %>';

export async function <%= b.service %>(parameters) {
  return request({
    api: <%= b.service %>ApiAddress,
    params: parameters,
  });
}
<% })%>
`;

const templateModelIndexContent = `<% o.importList.forEach(function(b){%>
import { buildModel as <%= b.functionAlias %>, <%= b.model %>TypeCollection } from './<%= b.model %>';
<% })%>

export const modelTypeCollection = {<% o.importList.forEach(function(b){%>
  <%= b.model %>TypeCollection,<% })%>
}

export function listModelBuilder() {
  const list = [];
  <% o.importList.forEach(function(b){%>
  list.push(<%= b.functionAlias %>);
<% })%>
  return list;
}
`;

module.exports = {
  templateModelContent,
  templateServiceContent,
  templateModelIndexContent,
};
