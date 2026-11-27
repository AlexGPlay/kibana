/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { omit } from 'lodash';
import type { DataViewSpec } from '@kbn/data-views-plugin/common';

const MAX_TITLE_LENGTH = 4096; // the index pattern, it can have many comma separated patterns

/**
 * Validates the spec of an ad hoc data view, which is created in memory and searched with the privileges of the
 * user who requested the report. The spec is the one that Discover creates, but the locator params of a report
 * job are not validated beyond being a record, so only what is needed to use it safely is checked: that it is an
 * object with an index pattern, and that it is not too big. The `fields` are removed, to always get them from
 * Elasticsearch.
 */
export const validateDataViewSpec = (dataViewSpec: unknown): Omit<DataViewSpec, 'fields'> => {
  const invalid = (reason: string) =>
    new Error(`Invalid DiscoverAppLocatorParams: "dataViewSpec" ${reason}`);

  if (typeof dataViewSpec !== 'object' || dataViewSpec === null || Array.isArray(dataViewSpec)) {
    throw invalid('must be an object');
  }

  const spec: Omit<DataViewSpec, 'fields'> = omit(dataViewSpec, 'fields');
  const { title, timeFieldName, type } = spec;

  if (typeof title !== 'string' || title.length === 0 || title.length > MAX_TITLE_LENGTH) {
    throw invalid(`must have a "title" (the index pattern), up to ${MAX_TITLE_LENGTH} characters`);
  }

  if (timeFieldName !== undefined && typeof timeFieldName !== 'string') {
    throw invalid('"timeFieldName" must be a string');
  }

  // `esql` data views are for ES|QL searches, which are not exported with the data view
  if (type !== undefined && type !== 'default' && type !== 'rollup') {
    throw invalid('"type" is not supported');
  }

  return spec;
};
