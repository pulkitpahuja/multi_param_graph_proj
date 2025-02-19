import { createSlice } from "@reduxjs/toolkit";
export const resetReportingSlice = createSlice({
  name: "resetReportingState",
  initialState: false,
  reducers: {
    setResetReportingState: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state = !state;
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setResetReportingState } = resetReportingSlice.actions;

export default resetReportingSlice.reducer;
