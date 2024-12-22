import React, { useState } from "react";
import PropTypes from "prop-types";
import { EuiFlexGroup, EuiFlexItem, EuiButton } from "@elastic/eui";


const TankOnOff = (props) => {
  const { meta, deviceData } = props;
  const devId = meta.id;

  const startMOTOR = (type, devID) => {
   
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiButton
          size="s"
          disabled={deviceData ? deviceData["running_status"] : true}
          color="success"
          onClick={() => {
            startMOTOR(1, devId);
          }}
        >
          On
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiButton
          size="s"
          color="danger"
          disabled={deviceData ? !deviceData["running_status"] : true}
          onClick={() => {
            startMOTOR(0, devId);
          }}
        >
          Off
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
TankOnOff.propTypes = {};

export default TankOnOff;
