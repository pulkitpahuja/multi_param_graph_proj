import React, { useEffect, useState } from "react";
import {
  EuiButton,
  EuiFlexGrid,
  EuiFlexItem,
  EuiSelect,
  useGeneratedHtmlId,
  EuiFormControlLayoutDelimited,
  EuiFormLabel,
} from "@elastic/eui";
import { useSelector, useDispatch } from "react-redux";
import { setVal } from "../../../store/slices/deviceMetaSlice";

import axios from "axios";
import { toast } from "react-toastify";

import { DEVICEMETA_LINK, TANKCONTROL_LINK } from "../../../Constants";

const TankForm = (props) => {
  const { meta, deviceData } = props;
  console.log(deviceData);
  const dispatch = useDispatch();

  const options_time = [
    { value: 900, text: "15 mins" },
    { value: 1800, text: "30 mins" },
    { value: 2700, text: "45 mins" },
  ];
  const options_type = [
    { value: "auto", text: "Auto" },
    { value: "manual", text: "Manual" },
  ];
  const [value_time, setTimeValue] = useState(meta.def_time);
  const [value_type, setTypeValue] = useState(meta.def_type);

  const [minTemp, setMinTemp] = useState(meta.min_temp);
  const [maxTemp, setMaxTemp] = useState(meta.max_temp);

  const basicSelectId = useGeneratedHtmlId({ prefix: "basicSelect" });
  const onChangeTime = (e) => {
    setTimeValue(e.target.value);
  };
  const onChangeType = (e) => {
    setTypeValue(e.target.value);
  };

  const onChangeMinTemp = (e) => {
    setMinTemp(e.target.value);
  };

  const onChangeMaxTemp = (e) => {
    setMaxTemp(e.target.value);
  };

  useEffect(() => {
    if (Object.keys(deviceData).length && (deviceData['switching_type'] !== meta.def_type)) {
      setTypeValue(deviceData['switching_type'])
    }
  }, [meta,deviceData]);

  const postValues = () => {
    const data = {
      devID: parseInt(meta.id),
      value_time: parseInt(value_time),
      value_type : value_type,
      minTemp,
      maxTemp,
    };
    if (parseInt(data.minTemp) + parseInt(data.maxTemp) > 200) {
      return toast.error("Error in temp range !");
    }

    axios
      .post(TANKCONTROL_LINK, { ...data })
      .then(function (response) {
        // handle success
        const d = response.data;
        if (d === "success") {
          axios
            .get(DEVICEMETA_LINK)
            .then(function (response) {
              // handle success
              const d = response.data;
              if (d) {
                dispatch(setVal(d));
                return toast.success("Successfully values set !");
              }
            })
            .catch(function (error) {
              // handle error
              return toast.error(error);
            })
            .then(function () {
              // always executed
            });
        }
      })
      .catch(function (error) {
        // handle error
        console.error(error);
        return toast.error(error);
      })
      .then(function () {
        // always executed
      });
  };

  return (
    <EuiFlexGrid alignItems="center" columns={2}>
      <EuiFlexItem grow={2}>
        <EuiFormControlLayoutDelimited
        style={{width:"350px"}}
          append={<EuiFormLabel>° C</EuiFormLabel>}
          fullWidth={true}
          startControl={
            <input
              type="number"
              placeholder="90"
              value={minTemp}
              fullWidth
              onChange={onChangeMinTemp}
              className="euiFieldNumber"
              aria-label="Use aria labels when no actual label is in use"
            />
          }
          endControl={
            <input
              type="number"
              value={maxTemp}
              onChange={onChangeMaxTemp}
              placeholder="100"
              className="euiFieldNumber"
              aria-label="Use aria labels when no actual label is in use"
            />
          }
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiSelect
          title="Time Range"
          id={basicSelectId}
          options={options_time}
          compressed
          disabled={value_type === "manual"}
          value={value_time}
          onChange={onChangeTime}
          aria-label="Use aria labels when no actual label is in use"
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiSelect
          title="Types select"
          id={Math.random()}
          options={options_type}
          compressed
          value={value_type}
          onChange={onChangeType}
          aria-label="Use aria labels when no actual label is in use"
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiButton
          onClick={postValues}
          fullWidth={false}
          size="s"
        >
          Set
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGrid>
  );
};

export default TankForm;
