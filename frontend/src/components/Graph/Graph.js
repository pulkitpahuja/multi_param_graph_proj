import React from "react";
import PropTypes from "prop-types";
import {
  Chart,
  Settings,
  LineSeries,
  AreaSeries,
  ScaleType,
} from "@elastic/charts";
import { euiPaletteForLightBackground } from "@elastic/eui";
import { useSelector } from "react-redux";

const Graph = (props) => {
  const { meta, variableName } = props;
  const deviceData = useSelector((state) => state.deviceData);
  const data_to_use = deviceData.data && meta ? deviceData.data[meta.id] : [];
  return (
    <Chart size={{ height: 40 }}>
      <Settings showLegend={false} tooltip="none" />
      <LineSeries
        name="new_chart"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        id="dev"
        xAccessor={"unix_time"}
        yAccessors={[variableName]}
        data={data_to_use.slice(1).slice(-5)}
      />
    </Chart>
  );
};

Graph.propTypes = {};

export default Graph;
