import React from "react";
import TankStatus from "./TankStatus/TankStatus";
import { EuiFlexItem, EuiFlexGrid, EuiSpacer, EuiFlexGroup } from "@elastic/eui";
import TankForm from "./TankForm/TankForm";
import TankOnOff from "./TankOnOff/TankOnOff";
import MeterMeta from "./MeterMeta/MeterMeta";

const TankControls = (props) => {
  const { meta, controlData } = props;
  return (
    <div>
      {/* <TankSession meta={meta}/> */}
      <EuiFlexGroup justifyContent="spaceAround" alignItems="center">
        {/* <EuiFlexItem grow={1}>
          <TankOnOff meta={meta} deviceData={controlData} />
        </EuiFlexItem> */}
        <EuiFlexItem>
          <MeterMeta meta={meta} deviceData={controlData} />
        </EuiFlexItem> 
        {/* <EuiFlexItem grow={2}>
          <TankStatus deviceData={controlData} meta={meta} />
        </EuiFlexItem>
        <EuiFlexItem grow={3}>
          <TankForm meta={meta} deviceData={controlData} />
        </EuiFlexItem> */}
      </EuiFlexGroup>
    </div>
  );
};

TankControls.propTypes = {};

export default TankControls;
