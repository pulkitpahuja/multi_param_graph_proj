import { createSlice } from "@reduxjs/toolkit";
export const kwhDataSlice = createSlice({
  name: "kwhDataSlice",
  initialState: {
    data: {},
  },
  reducers: {
    setKWHVal: (state, action) => {
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
export const { setKWHVal } = kwhDataSlice.actions;

export default kwhDataSlice.reducer;
