import React from "react";
import TankStatus from "./TankStatus/TankStatus";
import { EuiFlexItem, EuiFlexGrid, EuiSpacer } from "@elastic/eui";
import TankForm from "./TankForm/TankForm";
import TankOnOff from "./TankOnOff/TankOnOff";
import MeterMeta from "./MeterMeta/MeterMeta";

const TankControls = (props) => {
  const { meta, controlData } = props;
  return (
    <div>
      {/* <TankSession meta={meta}/> */}
      <EuiSpacer />
      <EuiFlexGrid columns={2} alignItems="center">
        <EuiFlexItem grow={1}>
          <TankOnOff meta={meta} deviceData={controlData} />
        </EuiFlexItem>
        <EuiFlexItem>
          <MeterMeta meta={meta} deviceData={controlData} />
        </EuiFlexItem>
        {/* <EuiFlexItem grow={2}>
          <TankStatus deviceData={controlData} meta={meta} />
        </EuiFlexItem>
        <EuiFlexItem grow={3}>
          <TankForm meta={meta} deviceData={controlData} />
        </EuiFlexItem> */}
      </EuiFlexGrid>
    </div>
  );
};

TankControls.propTypes = {};

export default TankControls;
