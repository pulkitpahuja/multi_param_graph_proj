import React, { useState } from "react";
import PropTypes from "prop-types";
import { EuiFlexGroup, EuiFlexItem, EuiButton } from "@elastic/eui";
import axios from "axios";
import { toast } from "react-toastify";
import { VAR_DATA_LINK } from "../../../Constants";

const TankOnOff = (props) => {
  const { meta, deviceData } = props;
  const devId = meta.id;

  const startMOTOR = (type, devID) => {
    axios
      .post("http://127.0.0.1:5000/start_motors", { type, devID })
      .then(function (response) {
        // handle success
        const d = response.data;
        if (parseInt(d) === 1) {
          return toast.success(`Process for ${meta.name} started`);
        } else {
          return toast.warn(`Process for ${meta.name} stopped`);
        }
      })
      .catch(function (error) {
        // handle error
        console.error(error);
        return toast.error(`There was an error processing the request`);
      })
      .then(function () {
        // always executed
      });
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiButton
          size="s"
          disabled={deviceData ? deviceData["running_status"] : true}
          color="success"
          onClick={() => {
            startMOTOR(1, devId);
          }}
        >
          On
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiButton
          size="s"
          color="danger"
          disabled={deviceData ? !deviceData["running_status"] : true}
          onClick={() => {
            startMOTOR(0, devId);
          }}
        >
          Off
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
TankOnOff.propTypes = {};

export default TankOnOff;
