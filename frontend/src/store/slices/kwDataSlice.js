import { createSlice } from "@reduxjs/toolkit";
export const kwDataSlice = createSlice({
  name: "kwDataSlice",
  initialState: {
    data: {},
  },
  reducers: {
    setKWVal: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.data = { ...state.data, ...action.payload };
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setKWVal } = kwDataSlice.actions;

export default kwDataSlice.reducer;
