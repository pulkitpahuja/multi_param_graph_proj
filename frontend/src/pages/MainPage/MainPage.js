import React, { useEffect, useState } from "react";
import {
  EuiPage,
  EuiEmptyPrompt,
  EuiLoadingLogo,
  EuiPageBody,
  EuiPageHeader,
  EuiTitle,
  EuiCallOut,
  EuiSpacer,
} from "@elastic/eui";
import { ERROR_DATA_LINK, DATA_LINK, VAR_DATA_LINK } from "../../Constants";
import Tabs from "./Tabs";
import { setVal } from "../../store/slices/dataSlice";
import { setErrorVal } from "../../store/slices/errorDataSlice";
import { setEventSource } from "../../store/slices/eventSourceSlice";
import { useSelector, useDispatch } from "react-redux";
import { setKWHVal } from "../../store/slices/kwhDataSlice";
import { setKWVal } from "../../store/slices/kwDataSlice";

import ErrorFlyout from "../../components/ErrorFlyout/ErrorFlyout";

const MainPage = () => {
  const eventSource = useSelector((state) => state.eventSource.eventSource);

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    startStream();
  }, []);

  const loadingPrompt = (
    <EuiEmptyPrompt
      icon={<EuiLoadingLogo logo="logoKibana" size="xl" />}
      title={<h2>Connecting to device...</h2>}
    />
  );

  const startStream = () => {
    dispatch(setEventSource(1));
    if (!eventSource) {
      const eSource = new EventSource(DATA_LINK);
      setIsLoading(true);
      eSource.onmessage = function (e) {
        const data = JSON.parse(e.data);
        dispatch(setVal({ ...data }));
        setIsLoading(false);
      };

      // const kwDataSource = new EventSource(`${VAR_DATA_LINK}?var=Active Power`);
      // setIsLoading(true);
      // kwDataSource.onmessage = function (e) {
      //   const data = JSON.parse(e.data);
      //   dispatch(setKWVal({ ...data }));
      //   setIsLoading(false);
      // };

      // const kwhDataSource = new EventSource(`${VAR_DATA_LINK}?var=Active Energy`);
      // setIsLoading(true);
      // kwhDataSource.onmessage = function (e) {
      //   const data = JSON.parse(e.data);
      //   dispatch(setKWHVal({ ...data }));
      //   setIsLoading(false);
      // };

      const errorSource = new EventSource(ERROR_DATA_LINK);
      setIsLoading(true);
      errorSource.onmessage = function (e) {
        const data = JSON.parse(e.data);
        dispatch(setErrorVal({ ...data }));
      };
    }
  };

  return (
    <EuiPage paddingSize="s">
      <EuiPageBody>
        <EuiPageHeader
          pageTitle="Data Monitoring"
          description={<ErrorFlyout />}
          paddingSize="l"
        />

        {eventSource === 1 ? (
          <div>
            <Tabs />
          </div>
        ) : isLoading ? (
          loadingPrompt
        ) : (
          <EuiTitle style={{ textAlign: "center" }} size="l">
            <h1>
              Please press the start button to start the data transfer. <br />
            </h1>
          </EuiTitle>
        )}
      </EuiPageBody>
    </EuiPage>
  );
};

MainPage.propTypes = {};

export default MainPage;
