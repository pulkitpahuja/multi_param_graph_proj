import React from "react";
import PropTypes from "prop-types";
import { EuiSpacer, EuiFlexItem, EuiPanel } from "@elastic/eui";
import Stat from "../Stat/Stat";
import Graph from "../Graph/Graph";

const DataCard = (props) => {
  const { meta, color, param, variableVal } = props;

  if (param.display) {
    return (
      <EuiFlexItem grow={false}>
        <EuiPanel hasBorder color={color || "primary"}>
          <Stat
            color={color}
            unit={param.unit}
            variableName={param.name}
            variableVal={variableVal}
          />
        </EuiPanel>
      </EuiFlexItem>
    );
  }
  return null;
};

DataCard.propTypes = {};

export default DataCard;
