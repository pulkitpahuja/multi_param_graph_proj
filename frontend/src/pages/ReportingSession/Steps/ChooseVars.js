import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { EuiComboBox } from "@elastic/eui";
import { setVal } from "../../../store/slices/reportingSlice";

const ChooseVars = (props) => {
  const deviceMeta = useSelector((state) => state.deviceMeta.data);
  const reportingState = useSelector((state) => state.reportingState);

  const selectedParams = reportingState.parameters.map((e) => {
    return { label: e };
  });

  const dispatch = useDispatch();

  const [vars, setVars] = useState([]);

  useEffect(() => {
    if (!deviceMeta.length || !reportingState.device_name) return;

    const val = deviceMeta.find(
      (ele) => ele.name === reportingState.device_name
    );
    const x = val.parameters.map((e) => {
      return { label: e.name };
    });

    setVars([...x]);
  }, [reportingState.device_name]);

  const onChange = (selectedOptions) => {
    const x = selectedOptions.map((e) => e.label);
    const s = { ...reportingState };
    s["parameters"] = [...x];
    dispatch(setVal(s));
  };

  return (
    <div>
      <EuiComboBox
        aria-label="Accessible screen reader label"
        placeholder={
          !vars.length
            ? "Please select a device"
            : "Select the variables from the dropdown"
        }
        options={vars}
        selectedOptions={selectedParams}
        onChange={onChange}
        isClearable={true}
        isInvalid={!selectedParams.length}
        isDisabled={!vars.length}
        data-test-subj="demoComboBox"
        autoFocus
      />
    </div>
  );
};

ChooseVars.propTypes = {};

export default {
  title: "Choose the variables that need to be exported",
  children: <ChooseVars />,
  status: "true",
};
