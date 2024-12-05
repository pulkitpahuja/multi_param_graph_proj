import React from "react";
import PropTypes from "prop-types";
import DeviceCard from "../../components/DeviceCard/DeviceCard";
import { useSelector, useDispatch } from "react-redux";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import CombinedGraph from "./TabPageGraphs/CombinedGraph";
import TankControls from "../../components/TankControls/TankControls";

const TabPage = (props) => {
  const { meta } = props;
  const deviceData = useSelector((state) => state.deviceData);
  const kwData = useSelector((state) => state.kwDataSlice);
  const kwhData = useSelector((state) => state.kwhDataSlice);

  const data_to_use =
    Object.keys(deviceData.data).length && meta && deviceData.data[meta.id]
      ? deviceData.data[meta.id]
      : {}; //// has all the other parameters like time,timestamp,running_status

  const kwData_data_to_use ={}

  const kwhData_data_to_use ={}

  const graphData = {
    "Active Power": kwData_data_to_use,
    "Active Energy": kwhData_data_to_use,
  };

  const createData = () => {
    /* only uses parameters mentioned in the config file. used for showing data on the screen */
    let x = {};
    const d_to_use =
      Object.keys(deviceData.data).length && meta && deviceData.data[meta.id]
        ? deviceData.data[meta.id]
        : {};
    if (d_to_use && Object.keys(d_to_use).length) {
      meta.parameters.forEach((param) => {
        x[param.name] =
          d_to_use[param.name] == null ? "-" : d_to_use[param.name];
      });
    }

    x["timestamp"] = d_to_use["timestamp"];
    x["running_status"] = d_to_use["running_status"];
    return x;
  };

  const device_d = createData();

  return (
    <div>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="center" alignItems="center">
        <EuiFlexItem style={{ maxWidth: "50%" }}>
          <EuiPanel>
            <EuiText color="subdued" textAlign="center">
              <h4>Controls and Status</h4>
            </EuiText>
            <EuiSpacer />
            <TankControls
              deviceData={device_d}
              controlData={data_to_use}
              meta={meta}
            />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />

      <DeviceCard
        meta={meta}
        deviceData={device_d}
        running_status={data_to_use["running_status"]}
      />
      <EuiSpacer />
      {/* <EuiText>
        <h3>Graphing</h3>
      </EuiText>
      <EuiSpacer />
      <CombinedGraph meta={meta} deviceData={graphData} /> */}
    </div>
  );
};

TabPage.propTypes = {};

export default TabPage;
