import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { EuiSelect, useGeneratedHtmlId } from "@elastic/eui";
import { useSelector, useDispatch } from "react-redux";
import { setVal } from "../../../../store/slices/reportingSlice";

const DeviceStep = (props) => {
  const deviceMeta = useSelector((state) => state.deviceMeta.data);
  const reportingState = useSelector((state) => state.reportingState);
  const dispatch = useDispatch();

  const options = deviceMeta.map((e) => {
    return {
      value: e.name,
      text: e.name,
    };
  });

  const basicSelectId = useGeneratedHtmlId({ prefix: "basicSelect" });

  const onChange = (e) => {
    const s = { ...reportingState };
    const val = deviceMeta.find((ele) => ele.name === e.target.value);
    s["device_name"] = e.target.value;
    s["device_id"] = val.id;
    dispatch(setVal(s));
  };

  return (
    /* DisplayToggles wrapper for Docs only */
    <EuiSelect
      id={basicSelectId}
      options={options}
      value={reportingState.device_name}
      onChange={(e) => onChange(e)}
      isInvalid={!reportingState.device_name}
      hasNoInitialSelection
      aria-label="Use aria labels when no actual label is in use"
    />
  );
};

DeviceStep.propTypes = {};

export default {
  title: "Choose a Device Name the exported session",
  children: <DeviceStep />,
  status: "true",
};
