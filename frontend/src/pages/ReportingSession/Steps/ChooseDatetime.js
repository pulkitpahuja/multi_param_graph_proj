import React, { useState } from "react";
import PropTypes from "prop-types";
import { EuiDatePicker, EuiDatePickerRange } from "@elastic/eui";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { setVal } from "../../../store/slices/reportingSlice";

const ChooseDatetime = (props) => {
  const dispatch = useDispatch();

  const reportingState = useSelector((state) => state.reportingState);

  const onChangeStartDate = (date) => {
    if (!date) return;
    console.log(date);
    const s = { ...reportingState };
    s["day_start"] = date;
    dispatch(setVal(s));
  };

  const onChangEndDate = (date) => {
    if (!date) return;
    const s = { ...reportingState };
    s["day_end"] = date;
    dispatch(setVal(s));
  };

  return (
    <div>
      <EuiDatePickerRange
        startDateControl={
          <EuiDatePicker
            selected={reportingState.day_start}
            onChange={onChangeStartDate}
            startDate={reportingState.day_start}
            endDate={reportingState.day_end}
            aria-label="Start date"
          />
        }
        endDateControl={
          <EuiDatePicker
            selected={reportingState.day_end}
            onChange={onChangEndDate}
            startDate={reportingState.day_start}
            endDate={reportingState.day_end}
            aria-label="End date"
          />
        }
      />
    </div>
  );
};

ChooseDatetime.propTypes = {};

export default {
  title: "Choose a Date or Time for the report",
  children: <ChooseDatetime />,
  status: "true",
};
