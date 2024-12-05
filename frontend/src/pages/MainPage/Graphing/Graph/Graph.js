import React from "react";
import PropTypes from "prop-types";
import moment from "moment";

import { EUI_CHARTS_THEME_LIGHT } from "@elastic/eui/dist/eui_charts_theme";
import { Axis, Chart, Settings, LineSeries, ScaleType } from "@elastic/charts";
import { useGeneratedHtmlId } from "@elastic/eui";
const Graph = (props) => {
  const { graphData,firstTick, secondTick } = props;
  const formatAxis = (tick) => {
    return Number(tick).toFixed(2);
  };

  const graphID = useGeneratedHtmlId();
  return (
    <Chart title={`${firstTick?.split("_")[1]} vs ${secondTick?.split("_")[1]}`} size={{ height: 300 }}>
      <Settings
        theme={EUI_CHARTS_THEME_LIGHT.theme}
        showLegend={true}
        legendPosition="top"
      />
      <LineSeries
        id={graphID}
        name={`${firstTick?.split("_")[1]} vs ${secondTick?.split("_")[1]}`}
        data={graphData}
        xScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
      />
      <Axis
        title={firstTick?.split("_")[1]}
        id="bottom-axis"
        position="bottom"
        tickFormat={(tick) => formatAxis(tick)}
        showGridLines={false}
      />
      <Axis
        title={secondTick?.split("_")[1]}
        id="left-axis"
        position="left"
        showGridLines={false}
        tickFormat={(d) => formatAxis(d)}
      />
    </Chart>
  );
};

Graph.propTypes = {};

export default Graph;
