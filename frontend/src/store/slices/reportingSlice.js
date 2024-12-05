import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";
export const reportingSlice = createSlice({
  name: "reportingState",
  initialState: {
    parameters: [],
    day_start: moment(),
    day_end: moment().add(11, "d"),
    interval: 1,
    func: "avg",
    device_id: 0,
    device_name: undefined,
    report_name: "System Report",
  },
  reducers: {
    setVal: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state = { ...state, ...action.payload };
      return state;
    },
    reset: (state) => {
      state = {
        ...state,
        ...{
          parameters: [],
          day_start: moment(),
          day_end: moment().add(11, "d"),
          interval: 1,
          func: "avg",
          device_id: 0,
          device_name: undefined,
          report_name: "System Report",
        },
      };
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setVal, reset } = reportingSlice.actions;

export default reportingSlice.reducer;
