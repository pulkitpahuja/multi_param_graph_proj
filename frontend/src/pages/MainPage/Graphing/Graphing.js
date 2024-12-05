import React, { useState, useEffect } from "react";
import { EuiPage, EuiPageBody, EuiPageHeader, EuiSpacer } from "@elastic/eui";
import GraphControls from "./GraphControls/GraphControls";
import Graph from "./Graph/Graph";
import axios from "axios";
import { ALL_VARS_LINK, CUSTOM_GRAPH_DATA } from "../../../Constants";
const Graphing = (props) => {
  const [vars, setVars] = useState([]);
  const [stream, setStream] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [firstTick, setfirstTick] = useState(null);
  const [secondTick, setsecondTick] = useState(null);

  const setDataStream = () => {
    if (stream) {
      stream.close();
      setStream(null);
    }
    const firstTickSplit = firstTick.split("_");
    const secondTickSplit = secondTick.split("_");
    const first_tick = {
      table_name: firstTickSplit[0],
      var_name: firstTickSplit[1],
    };

    const second_tick = {
      table_name: secondTickSplit[0],
      var_name: secondTickSplit[1],
    };

    const eSource = new EventSource(
      `${CUSTOM_GRAPH_DATA}?first_tick_table_name=${first_tick.table_name}&first_tick_var_name=${first_tick.var_name}&second_tick_table_name=${second_tick.table_name}&second_tick_var_name=${second_tick.var_name}`
    );
    setStream(eSource);
    eSource.onmessage = function (e) {
      const data = JSON.parse(e.data);
      setGraphData([...data]);
    };
  };

  useEffect(() => {
    axios
      .get(ALL_VARS_LINK)
      .then(function (response) {
        // handle success
        const d = response.data;
        if (d) {
          setVars([...d]);
        }
      })
      .catch(function (error) {
        // handle error
        console.error(error);
      })
      .then(function () {
        // always executed
      });

    return () => {
      if (stream) {
        stream.close();
      }
    };
  }, []);

  return (
    <EuiPage paddingSize="l">
      <EuiPageBody>
        <EuiSpacer />
        <EuiPageHeader
          pageTitle="Data Graphing"
          iconType="visLine"
          description="Please select any 2 parameters from the dropdown to view the graph."
          rightSideItems={
            [
              // <EuiButton fill>Add something</EuiButton>,
              // <EuiButton>Do something</EuiButton>,
            ]
          }
        />
        <EuiSpacer />

        <GraphControls
          vars={vars}
          firstTick={firstTick}
          setfirstTick={setfirstTick}
          secondTick={secondTick}
          setsecondTick={setsecondTick}
          setDataStream={setDataStream}
          stream={stream}
          setStream={setStream}
        />
        <EuiSpacer />

        <Graph
          graphData={graphData}
          firstTick={firstTick}
          secondTick={secondTick}
        />
      </EuiPageBody>
    </EuiPage>
  );
};

Graphing.propTypes = {};

export default Graphing;
