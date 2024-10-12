import { configureStore } from "@reduxjs/toolkit";
import teamReducer from "./slices/teamSlice";
import riderReducer from "./slices/riderSlice";
import stageReducer from "./slices/stageSlice";
import leagueReducer from "./slices/leagueSlice";

export const store = configureStore({
  reducer: {
    teams: teamReducer,
    riders: riderReducer,
    stages: stageReducer,
    leagues: leagueReducer,
  },
});
