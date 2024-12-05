import { createSlice } from "@reduxjs/toolkit";
export const errorDataSlice = createSlice({
  name: "errorDataSlice",
  initialState: {
    data: [],
  },
  reducers: {
    setErrorVal: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      let l = Object.values(action.payload);
      state.data = [ ...l ]
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setErrorVal } = errorDataSlice.actions;

export default errorDataSlice.reducer;
