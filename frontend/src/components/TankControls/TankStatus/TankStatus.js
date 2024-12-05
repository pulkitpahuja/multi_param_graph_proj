import React, { useState, Fragment, useEffect } from "react";
import { EuiSwitch, EuiFormRow, useGeneratedHtmlId } from "@elastic/eui";
const TankStatus = (props) => {
  const { meta, deviceData } = props;
  const [checked1, setChecked1] = useState(
    deviceData && deviceData["running_status"] ? !!+deviceData["Motor1 Status"] : false
  );
  const [checked2, setChecked2] = useState(
    deviceData && deviceData["running_status"] ? !!+deviceData["Motor2 Status"] : false
  );
  const [valveStat, setValveStat] = useState(
    deviceData && deviceData["running_status"] ? !!+deviceData["Valve Status"] : false
  );
  const toggleTextSwitchId = useGeneratedHtmlId({ prefix: "toggleTextSwitch" });

  const onChange1 = (e) => {
    setChecked1(e.target.checked);
  };
  const onChange2 = (e) => {
    setChecked2(e.target.checked);
  };
  const onChange3 = (e) => {
    setValveStat(e.target.checked);
  };
  const clickHandler = (e) => {
    e.stopPropagation();
  };
  useEffect(() => {
    setChecked1(
      deviceData && deviceData["running_status"] ? !!+deviceData["Motor1 Status"] : false
    );
    setChecked2(
      deviceData && deviceData["running_status"] ? !!+deviceData["Motor2 Status"] : false
    );
    setValveStat(
      deviceData && deviceData["running_status"] ? !!+deviceData["Valve Status"] : false
    );
  }, [deviceData]);

  return (
    <>
      <EuiFormRow display="columnCompressedSwitch" label="Motor 1">
        <EuiSwitch
          label={checked1 ? "on" : "off"}
          checked={checked1}
          onChange={onChange1}
          onClick={clickHandler}
        />
      </EuiFormRow>
      <EuiFormRow
        display="columnCompressedSwitch"
        label={<span id={toggleTextSwitchId}>Motor 2</span>}
      >
        <EuiSwitch
          label={checked2 ? "on" : "off"}
          checked={checked2}
          onChange={onChange2}
          onClick={clickHandler}
          aria-describedby={toggleTextSwitchId}
        />
      </EuiFormRow>
      <EuiFormRow
        display="columnCompressedSwitch"
        label={<span id={toggleTextSwitchId}>Valve Status</span>}
      >
        <EuiSwitch
          label={valveStat ? "on" : "off"}
          checked={valveStat}
          onChange={onChange3}
          onClick={clickHandler}
          aria-describedby={toggleTextSwitchId}
        />
      </EuiFormRow>
    </>
  );
};

export default TankStatus;
