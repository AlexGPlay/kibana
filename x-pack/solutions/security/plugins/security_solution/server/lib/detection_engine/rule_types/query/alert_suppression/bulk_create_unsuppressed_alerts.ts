/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

import type {
  SecuritySharedParams,
  SearchAfterAndBulkCreateReturnType,
  SecurityRuleServices,
} from '../../types';
import type { UnifiedQueryRuleParams } from '../../../rule_schema';

import type { BuildReasonMessage } from '../../utils/reason_formatters';
import { searchAfterAndBulkCreate } from '../../utils/search_after_bulk_create';
import type { ITelemetryEventsSender } from '../../../../telemetry/sender';

type BulkCreateUnsuppressedAlerts = (params: {
  sharedParams: SecuritySharedParams<UnifiedQueryRuleParams>;
  size: number;
  groupByFields: string[];
  buildReasonMessage: BuildReasonMessage;
  services: SecurityRuleServices;
  filter: QueryDslQueryContainer;
  eventsTelemetry: ITelemetryEventsSender | undefined;
}) => Promise<SearchAfterAndBulkCreateReturnType>;

/**
 * searches and bulk creates unsuppressed alerts if any exists
 * @param param0
 * @returns
 */
export const bulkCreateUnsuppressedAlerts: BulkCreateUnsuppressedAlerts = async ({
  size,
  groupByFields,
  buildReasonMessage,
  sharedParams,
  filter,
  services,
  eventsTelemetry,
}) => {
  const bulkCreatedResult = await searchAfterAndBulkCreate({
    sharedParams,
    services,
    eventsTelemetry,
    filter,
    buildReasonMessage,
    additionalFilters: buildMissingFieldsFilter(groupByFields),
    maxSignalsOverride: size,
  });

  return bulkCreatedResult;
};

/**
 * builds filter that returns only docs with at least one missing field from a list of groupByFields fields
 * @param groupByFields
 * @returns - Array<{@link QueryDslQueryContainer}>
 */
const buildMissingFieldsFilter = (groupByFields: string[]): QueryDslQueryContainer[] => {
  if (groupByFields.length === 0) {
    return [];
  }

  return [
    {
      bool: {
        should: groupByFields.map((field) => ({
          bool: {
            must_not: [
              {
                exists: {
                  field,
                },
              },
            ],
          },
        })),
      },
    },
  ];
};
