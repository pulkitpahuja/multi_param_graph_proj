import React from "react";
import PropTypes from "prop-types";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiHealth,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";

const MeterMeta = (props) => {
  const { meta, deviceData } = props;

  return (
    <EuiFlexGroup direction="row">
      <EuiFlexItem>
        <EuiFlexGroup direction="row" alignItems="center">
          <EuiFlexItem>
            <EuiText>Communication Status: </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={0}>
            <EuiHealth color={deviceData["comm_status"] ? "success" : "danger"}>
              {deviceData["comm_status"]}
            </EuiHealth>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup direction="row" alignItems="center">
          <EuiFlexItem>
            <EuiText>Running Status: </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={0}>
            <EuiHealth
              color={deviceData["running_status"] ? "success" : "danger"}
            >
              {deviceData["running_status"]}
            </EuiHealth>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

MeterMeta.propTypes = {};

export default MeterMeta;
