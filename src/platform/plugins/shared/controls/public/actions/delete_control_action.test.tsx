/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { BehaviorSubject } from 'rxjs';

import { ViewMode } from '@kbn/presentation-publishing';
import { getOptionsListControlFactory } from '../controls/data_controls/options_list_control/get_options_list_control_factory';
import { OptionsListControlApi } from '../controls/data_controls/options_list_control/types';
import { getMockedControlGroupApi, getMockedFinalizeApi } from '../controls/mocks/control_mocks';
import { coreServices } from '../services/kibana_services';
import { DeleteControlAction } from './delete_control_action';

const dashboardApi = {
  viewMode$: new BehaviorSubject<ViewMode>('view'),
};
const controlGroupApi = getMockedControlGroupApi(dashboardApi, {
  removePanel: jest.fn(),
  replacePanel: jest.fn(),
  addNewPanel: jest.fn(),
  children$: new BehaviorSubject({}),
});

let controlApi: OptionsListControlApi;
beforeAll(async () => {
  const controlFactory = getOptionsListControlFactory();

  const uuid = 'testControl';
  const control = await controlFactory.buildControl({
    initialState: {
      dataViewId: 'test-data-view',
      title: 'test',
      fieldName: 'test-field',
      width: 'medium',
      grow: false,
    },
    finalizeApi: getMockedFinalizeApi(uuid, controlFactory, controlGroupApi),
    uuid,
    controlGroupApi,
  });

  controlApi = control.api;
});

test('Execute throws an error when called with an embeddable not in a parent', async () => {
  const deleteControlAction = new DeleteControlAction();
  const { parentApi, ...rest } = controlApi;
  await expect(async () => {
    await deleteControlAction.execute({ embeddable: rest });
  }).rejects.toThrow(Error);
});

describe('Execute should open a confirm modal', () => {
  test('Canceling modal will keep control', async () => {
    const spyOn = jest.fn().mockResolvedValue(false);
    coreServices.overlays.openConfirm = spyOn;

    const deleteControlAction = new DeleteControlAction();
    await deleteControlAction.execute({ embeddable: controlApi });
    expect(spyOn).toHaveBeenCalled();

    expect(controlGroupApi.removePanel).not.toHaveBeenCalled();
  });

  test('Confirming modal will delete control', async () => {
    const spyOn = jest.fn().mockResolvedValue(true);
    coreServices.overlays.openConfirm = spyOn;

    const deleteControlAction = new DeleteControlAction();
    await deleteControlAction.execute({ embeddable: controlApi });
    expect(spyOn).toHaveBeenCalled();

    expect(controlGroupApi.removePanel).toHaveBeenCalledTimes(1);
  });
});
