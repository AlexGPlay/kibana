/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import PropTypes from 'prop-types';
import React from 'react';

import { EuiIcon, EuiToolTip, useEuiTheme } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';

/*
 * Component for rendering a detector cell in the anomalies table, displaying the
 * description of the detector, and an icon if rules have been configured for the detector.
 */
export function DetectorCell({ detectorDescription, numberOfRules }) {
  const { euiTheme } = useEuiTheme();
  let rulesIcon;
  if (numberOfRules !== undefined && numberOfRules > 0) {
    rulesIcon = (
      <EuiToolTip
        content={
          <FormattedMessage
            id="xpack.ml.anomaliesTable.detectorCell.rulesConfiguredTooltip"
            defaultMessage="rules have been configured for this detector"
          />
        }
      >
        <EuiIcon
          type="controlsHorizontal"
          css={{
            marginLeft: euiTheme.size.xs,
          }}
        />
      </EuiToolTip>
    );
  }
  return (
    <React.Fragment>
      {detectorDescription}
      {rulesIcon}
    </React.Fragment>
  );
}
DetectorCell.propTypes = {
  detectorDescription: PropTypes.string.isRequired,
  numberOfRules: PropTypes.number,
};
