import React, { useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiFieldText,
} from "@elastic/eui";
import { useSelector, useDispatch } from "react-redux";
import { setSessionData } from "../../../store/slices/sessionDataSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { TEMP_DATA_LINK } from "../../../Constants";
import { setTempVal } from "../../../store/slices/kwhDataSlice";

const TankSession = (props) => {
  const { meta } = props;
  const [eventStream, setEventStream] = useState(null);
  const dispatch = useDispatch();
  const sessionDatum = useSelector((state) => state.sessionDataSlice.data);

  console.log(sessionDatum);

  const data_to_use = sessionDatum.find(
    (e) => parseInt(e.device_id) === meta.id
  );

  const onChange = (e) => {
    let cop = [...sessionDatum];
    let d = cop.findIndex((ele) => ele.device_id === meta.id);
    let x = { ...cop[d] };
    x["session_name"] = e.target.value;
    cop[d] = { ...x };
    dispatch(setSessionData([...cop]));
  };

  const startSession = () => {
    if (!data_to_use.session_name) {
      return;
    }
    axios
      .post("http://127.0.0.1:5000/start_session", {
        devID: meta.id,
        session_name: data_to_use.session_name,
      })
      .then(function (response) {
        // handle success
        const data = response.data;
        if (data) {
          let cop = [...sessionDatum];
          let d = cop.findIndex((ele) => ele.device_id === meta.id);
          let x = { ...cop[d] };
          x["start_unix_time"] = data.start_unix_time;
          x["event_stream"] = new EventSource(
            `${TEMP_DATA_LINK}?start=${data.start_unix_time}&devices=${meta.id}`
          );
          x["event_stream"].onmessage = function (e) {
            const data = JSON.parse(e.data);
            dispatch(setTempVal({ ...data }));
          };
          cop[d] = { ...x };
          dispatch(setSessionData([...cop]));
        }
      })
      .catch(function (error) {
        // handle error
        console.error(error);
        let cop = [...sessionDatum];
        let d = cop.findIndex((ele) => ele.device_id === meta.id);
        let x = { ...cop[d] };
        x["event_stream"].close();
        cop[d] = { ...x };
        dispatch(setSessionData([...cop]));
      })
      .then(function () {
        // always executed
      });
  };

  const stopSession = () => {
    if (!data_to_use.session_name || !data_to_use.start_unix_time) {
      return;
    }
    axios
      .post("http://127.0.0.1:5000/stop_session", { devID: meta.id })
      .then(function (response) {
        // handle success
        if (response.status === 200) {
          let cop = [...sessionDatum];
          let d = cop.findIndex((ele) => ele.device_id === meta.id);
          let x = { ...cop[d] };
          x["session_name"] = "";
          x["start_unix_time"] = 0;
          x["end_unix_time"] = 0;
          x["event_stream"].close();
          x["event_stream"] = null;
          cop[d] = { ...x };
          dispatch(setSessionData([...cop]));
          toast.warn(`Process for ${meta.name} stopped`);
          return toast.warn(`Session for ${meta.name} stopped`);
        }
      })
      .catch(function (error) {
        // handle error/
        console.error(error);
        return toast.error(`There was an error closing the session`);
      })
      .then(function () {
        // always executed
      });
  };

  return (
    <EuiFlexGroup wrap={false}>
      <EuiFlexItem>
        <EuiFieldText
          placeholder="Session Name"
          value={data_to_use.session_name}
          onChange={(e) => onChange(e)}
          aria-label="Use aria labels when no actual label is in use"
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiButton
          color="success"
          disabled={!data_to_use.session_name || data_to_use.start_unix_time}
          onClick={startSession}
          iconType="check"
        >
          Start Session
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiButton
          color="danger"
          disabled={!data_to_use.session_name}
          onClick={stopSession}
          iconType="cross"
        >
          Stop Session
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

TankSession.propTypes = {};

export default TankSession;
