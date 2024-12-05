import React, { useState } from "react";
import PropTypes from "prop-types";
import { EuiSelect, useGeneratedHtmlId } from "@elastic/eui";
import { useSelector, useDispatch } from "react-redux";
import { setVal } from "../../../store/slices/reportingSlice";

const ChooseInterval = (props) => {
  const dispatch = useDispatch();
  const reportingState = useSelector((state) => state.reportingState);

  const options = [
    { value: 1, text: "1 minute" },
    { value: 5, text: "5 minutes" },
    { value: 60, text: "1 hr" },
  ];
  const basicSelectId = useGeneratedHtmlId({ prefix: "basicSelect" });

  const onChange = (e) => {
    const s = { ...reportingState };
    s["interval"] = parseInt(e.target.value);
    dispatch(setVal(s));
  };


  return (
    <div>
      <EuiSelect
        id={basicSelectId}
        options={options}
        value={reportingState.interval}
        onChange={onChange}
        aria-label="Use aria labels when no actual label is in use"
      />
    </div>
  );
};

ChooseInterval.propTypes = {};

export default {
  title: "Choose a data interval",
  children: <ChooseInterval />,
  status: "true",
};
