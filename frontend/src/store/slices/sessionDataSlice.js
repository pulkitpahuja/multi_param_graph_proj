import { createSlice } from "@reduxjs/toolkit";
export const sessionDataSlice = createSlice({
  name: "sessionData",
  initialState: {
    data: [
      
    ],
  },
  reducers: {
    setSessionData: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.data = [ ...action.payload ];
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSessionData } = sessionDataSlice.actions;

export default sessionDataSlice.reducer;
