import React, { useState } from "react";
import { EuiFieldText } from "@elastic/eui";
import { useSelector, useDispatch } from "react-redux";
import { setVal } from "../../../store/slices/reportingSlice";

const SetReportName = () => {
  const dispatch = useDispatch();
  const reportingState = useSelector((state) => state.reportingState);

  const onChange = (e) => {
    const s = { ...reportingState };
    s['report_name'] = e.target.value;
    dispatch(setVal(s));
  };

  return (
    <div>
      <EuiFieldText
        placeholder="Report Name"
        value={reportingState.report_name}
        onChange={(e) => onChange(e)}
        aria-label="Use aria labels when no actual label is in use"
      />
    </div>
  );
};

export default {
  title: "Choose a name for the report. (default - System Report)",
  children: <SetReportName />,
  status: "true",
};
