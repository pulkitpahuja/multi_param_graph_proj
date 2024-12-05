import React from "react";
import {
  EuiSelect,
  EuiButton,
  EuiFormRow,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui";

const GraphControls = (props) => {
  const {
    firstTick,
    setfirstTick,
    secondTick,
    setsecondTick,
    vars,
    setDataStream,
    setStream,
    stream,
  } = props;

  const handleReset = () => {
    if (stream) {
      stream.close();
      setStream(null);
    }

    setfirstTick(null);
    setsecondTick(null);
  };

  return (
    <EuiFlexGroup
      style={{ maxWidth: 900 }}
      alignItems="center"
      justifyContent="spaceBetween"
    >
      <EuiFlexItem>
        <EuiFormRow label="X Axis">
          <EuiSelect
            hasNoInitialSelection
            onChange={(e) => {
              setfirstTick(e.target.value);
            }}
            value={firstTick}
            options={vars}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow label="Y Axis">
          <EuiSelect
            hasNoInitialSelection
            onChange={(e) => {
              setsecondTick(e.target.value);
            }}
            value={secondTick}
            options={vars}
          />
        </EuiFormRow>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiFormRow hasEmptyLabelSpace>
          <EuiButton
            isLoading={false}
            fill
            color="success"
            onClick={setDataStream}
            iconType="visualizeApp"
          >
            Plot
          </EuiButton>
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFormRow hasEmptyLabelSpace>
          <EuiButton
            isLoading={false}
            fill
            color="danger"
            onClick={handleReset}
            iconType="cross"
          >
            Reset
          </EuiButton>
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

GraphControls.propTypes = {};

export default GraphControls;
