import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import DataCard from "../DataCard/DataCard";
import classes from "./DeviceCard.module.css";
import { EuiFlexGrid, EuiFlexItem, EuiSpacer, EuiText } from "@elastic/eui";

const DeviceCard = (props) => {
  const { meta, deviceData } = props;
  return (
    <EuiFlexItem
      className={classes.root}
      grow={Object.keys(meta.parameters).length < 5 ? false : 1}
    >
      {meta.name && (
        <EuiText textAlign="center">
          <h3>{meta.name}</h3>
          <span>(Last Updated : {deviceData["timestamp"]} )</span>
        </EuiText>
      )}
      {!meta.name && (
        <EuiText>
          <h3>Live Data: </h3>
        </EuiText>
      )}
      <EuiSpacer />
      <div className={classes.statClass}>
        {meta.parameters.map((dataPoint, idx) => {
          let color = deviceData["running_status"] ? "success" : "danger";
          return (
            <DataCard
              key={Math.random()}
              color={color}
              param={dataPoint}
              variableVal={deviceData[dataPoint.name]}
              meta={meta}
            />
          );
        })}
      </div>
      <EuiFlexGrid columns={4}></EuiFlexGrid>
    </EuiFlexItem>
  );
};

DeviceCard.propTypes = {};

export default DeviceCard;
