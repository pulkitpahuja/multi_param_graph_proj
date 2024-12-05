import React, { useState, useEffect } from "react";
import { EuiPanel } from "@elastic/eui";
import { EUI_CHARTS_THEME_LIGHT } from "@elastic/eui/dist/eui_charts_theme";
import { Axis, Chart, Settings, LineSeries, ScaleType } from "@elastic/charts";
import moment from "moment";

const CombinedGraph = (props) => {
  const { meta, deviceData } = props;

  console.log(deviceData);

  const formatXAxis = (tickFormat) => {
    return moment.unix(tickFormat).format("hh:mm:ss");
  };
  return (
    <EuiPanel paddingSize="m">
      {meta.parameters.map((param) =>
        param.graph ? (
          <Chart size={{ height: 300 }}>
            <Settings
              theme={EUI_CHARTS_THEME_LIGHT.theme}
              showLegend={true}
              legendPosition="top"
            />
            <LineSeries
              id={`${meta.id}-${param.name}`}
              name={param.name}
              data={deviceData[param.name]}
              xScaleType={ScaleType.Time}
              xAccessor="unix_time"
              yAccessors={[param.name]}
            />
            <Axis
              title="Datetime"
              id="bottom-axis"
              position="bottom"
              tickFormat={(tick) => formatXAxis(tick)}
              showGridLines={false}
            />
            <Axis
              title={param.name}
              id="left-axis"
              position="left"
              showGridLines={false}
              tickFormat={(d) => Number(d).toFixed(2)}
            />
          </Chart>
        ) : null
      )}
    </EuiPanel>
  );
};

CombinedGraph.propTypes = {};

export default CombinedGraph;
