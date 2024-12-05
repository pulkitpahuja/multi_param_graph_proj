import React from "react";
import { EuiStat, EuiIcon, EuiText } from "@elastic/eui";

const Stat = (props) => {
  const { color,variableName, variableVal, children,unit } = props;
  return (
    <EuiStat
      titleColor={color}
      title={`${variableVal === undefined ? "-" : variableVal} ${unit}`}
      description={
        <EuiText size="s" grow={false}>
          <h4>{variableName}</h4>
        </EuiText>
      }
      titleSize="xs"
    >
      <EuiIcon type="empty" />
      {children}
    </EuiStat>
  );
};

export default Stat;
