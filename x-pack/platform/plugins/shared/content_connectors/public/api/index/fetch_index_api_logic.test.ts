/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { httpServiceMock } from '@kbn/core/public/mocks';
import { nextTick } from '@kbn/test-jest-helpers';

import { fetchIndex } from './fetch_index_api_logic';

describe('FetchIndexApiLogic', () => {
  const http = httpServiceMock.createSetupContract();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('fetchIndex', () => {
    it('calls correct api', async () => {
      const promise = Promise.resolve('result');
      http.get.mockReturnValue(promise);
      const result = fetchIndex({ http, indexName: 'indexName' });
      await nextTick();
      expect(http.get).toHaveBeenCalledWith('/internal/content_connectors/indices/indexName');
      await expect(result).resolves.toEqual('result');
    });
  });
});
