import React from "react";
import { useSelector } from "react-redux";
import DeviceCard from "../../components/DeviceCard/DeviceCard";
import { EuiFlexGrid } from "@elastic/eui";

const AllPage = (props) => {
  const deviceMeta = useSelector((state) => state.deviceMeta.data);
  const deviceData = useSelector((state) => state.deviceData);

  const createData = (meta) => {
    const d_to_use =
      Object.keys(deviceData.data).length && meta && deviceData.data[meta.id]? deviceData.data[meta.id] : {};

    let x = {};

    if (Object.keys(d_to_use).length) {
      meta.parameters.forEach((param) => {
        x[param.name] =
          d_to_use[param.name] == null ? "-" : d_to_use[param.name];
      });
    }
    x['timestamp'] = d_to_use['timestamp']
    x['running_status'] = d_to_use['running_status']

    return x;
  };
  return (
    <EuiFlexGrid columns={2}>
      {deviceMeta.map((device) => (
        <DeviceCard meta={device} deviceData={createData(device)}/>
      ))}
    </EuiFlexGrid>
  );
};

export default AllPage;
