import React, { useState } from "react";
import PropTypes from "prop-types";
import { EuiSelect, useGeneratedHtmlId } from "@elastic/eui";
import { useSelector, useDispatch } from "react-redux";
import { setVal } from "../../../store/slices/reportingSlice";

const ChooseFunction = (props) => {
  const dispatch = useDispatch();
  const reportingState = useSelector((state) => state.reportingState);

  const options = [
    { value: "ALL", text: "Timewise" },
    { value: "AVG", text: "Avg." },
    { value: "MAX", text: "Max." },
    { value: "MIN", text: "Min." },
  ];
  const basicSelectId = useGeneratedHtmlId({ prefix: "basicSelect" });

  const onChange = (e) => {
    const s = { ...reportingState };
    s["func"] = e.target.value;
    dispatch(setVal(s));
  };
  return (
    <div>
      <EuiSelect
        id={basicSelectId}
        options={options}
        value={reportingState.func}
        onChange={onChange}
        aria-label="Use aria labels when no actual label is in use"
      />
    </div>
  );
};

ChooseFunction.propTypes = {};

export default {
  title: "Choose a function for the evaluation of the data",
  children: <ChooseFunction />,
  status: "true",
};
