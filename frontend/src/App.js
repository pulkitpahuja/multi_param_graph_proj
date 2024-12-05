import "./App.css";
import React, { useEffect } from "react";
import { EuiProvider } from "@elastic/eui";
import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage";
import MainScreen from "./pages/MainScreen/MainScreen";
import axios from "axios";
import { useDispatch } from "react-redux";
import { DEVICEMETA_LINK } from "./Constants";
import { setVal } from "./store/slices/deviceMetaSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "@elastic/eui/dist/eui_theme_light.css";
import "@elastic/charts/dist/theme_only_light.css";

// import Reporting from "./pages/Reporting/Reporting";
import ReportingSession from "./pages/ReportingSession/ReportingSession";
import { setSessionData } from "./store/slices/sessionDataSlice";
import Graphing from "./pages/MainPage/Graphing/Graphing";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(DEVICEMETA_LINK)
      .then(function (response) {
        // handle success
        const d = response.data;
        if (d) {
          dispatch(setVal(d));
          const x = d.map((ele) => {
            return {
              device_id: ele["id"],
              session_name: "",
              start_unix_time: 0,
              end_unix_time: 0,
              event_stream: null,
            };
          });
          dispatch(setSessionData([...x]));
        }
      })
      .catch(function (error) {
        // handle error
        console.error(error);
      })
      .then(function () {
        // always executed
      });
  }, []);

  return (
    <EuiProvider colorMode="light">
      <div className="App">
        <ToastContainer />
        <MainScreen />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/graph" element={<Graphing />} />
          <Route path="reporting" element={<ReportingSession />} />
        </Routes>
      </div>
    </EuiProvider>
  );
}

export default App;
