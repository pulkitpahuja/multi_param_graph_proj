import { configureStore } from "@reduxjs/toolkit";
import deviceDataSlice from "./slices/dataSlice";
import deviceMetaSlice from "./slices/deviceMetaSlice";
import eventSourceSlice from "./slices/eventSourceSlice";
import reportingSlice from "./slices/reportingSlice";
import resetReportingSlice from "./slices/resetReportingSlice";
import errorDataSlice from "./slices/errorDataSlice";
import sessionDataSlice from "./slices/sessionDataSlice";
import kwDataSlice from "./slices/kwDataSlice";
import kwhDataSlice from "./slices/kwhDataSlice";
export default configureStore({
  reducer: {
    reportingState: reportingSlice,
    deviceMeta: deviceMetaSlice,
    deviceData: deviceDataSlice,
    kwDataSlice: kwDataSlice,
    kwhDataSlice: kwhDataSlice,
    eventSource: eventSourceSlice,
    resetReportingState: resetReportingSlice,
    errorDataSlice: errorDataSlice,
    sessionDataSlice: sessionDataSlice,
  },
});
