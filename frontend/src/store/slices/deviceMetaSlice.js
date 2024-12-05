import { createSlice } from "@reduxjs/toolkit";
export const deviceMetaSlice = createSlice({
  name: "deviceMeta",
  initialState: {
    data: [],
  },
  reducers: {
    setVal: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      let l = [...action.payload];
      state.data = [...l];
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setVal } = deviceMetaSlice.actions;

export default deviceMetaSlice.reducer;
