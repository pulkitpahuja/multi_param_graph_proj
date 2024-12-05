import React, { useState, Fragment } from "react";
import PropTypes from "prop-types";
import { EuiSpacer, EuiSteps, EuiButton } from "@elastic/eui";
import DeviceStep from "./DeviceStep/DeviceStep";
import SetReportName from "./SetReportName";
import ChooseDatetime from "./ChooseDatetime";
import ChooseFunction from "./ChooseFunction";
import ChooseInterval from "./ChooseInterval";
import ChooseVars from "./ChooseVars";

const Steps = () => {
  const firstSetOfSteps = [
    DeviceStep,
    SetReportName,
    ChooseVars,
    ChooseDatetime,
    ChooseFunction,
    ChooseInterval
  ];

  return (
    <div>
      <EuiSteps steps={firstSetOfSteps} />
    </div>
  );
};

Steps.propTypes = {};

export default Steps;
