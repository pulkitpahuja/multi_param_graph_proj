import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { EuiBasicTable, EuiSpacer } from "@elastic/eui";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import ButtonGroup from "../ButtonGroup/ButtonGroup";
const ChooseSession = (props) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [session_data, setSessionData] = useState([]);
  const reportingState = useSelector((state) => state.reportingState);
  
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/get_sessions")
      .then(function (response) {
        // handle success
        if (!reportingState.device_id) {
          return;
        }
        const data = response.data;
        if (data) {
          let d = [];
          data.forEach((element) => {
            if (parseInt(element.device) === reportingState.device_id) {
              d.push(element);
            }
          });
          if (d.length) {
            setSessionData([...d]);
          } else {
            setSessionData([]);
          }
        }
      })
      .catch(function (error) {
        // handle error/
        console.error(error);
      })
      .then(function () {
        // always executed
      });
  }, [reportingState]);

  const columns = [
    {
      field: "session_name",
      name: "Session Name",
      truncateText: true,
    },
    {
      field: "start_unix_time",
      name: "Start Time",
      truncateText: true,
      render: (start_unix_time) =>
        moment.unix(start_unix_time).format("DD/MM/YYYY HH:mm:ss"),
      sortable: true,
    },
    {
      field: "end_unix_time",
      name: "End Time",
      render: (end_unix_time) =>
        moment.unix(end_unix_time).format("DD/MM/YYYY HH:mm:ss"),
      truncateText: true,
    },
  ];

  const onSelectionChange = (selections) => {
    setSelectedItems(selections);
  };
  const selection = {
    selectable: () => true,
    selectableMessage: (selectable) =>
      !selectable ? "User is currently offline" : "",
    onSelectionChange,
    initialSelected: "",
  };
  return (
    <div>
      <EuiBasicTable
        tableCaption="Demo for EuiBasicTable with selection"
        items={session_data}
        itemId="id"
        columns={columns}
        isSelectable={true}
        selection={selection}
        rowHeader="session_name"
      />
      <EuiSpacer size="m" />
      <ButtonGroup disabled={!selectedItems.length} selectedItems={selectedItems}/>
    </div>
  );
};

ChooseSession.propTypes = {};

export default {
  title: "Select the session for the exported data",
  children: <ChooseSession />,
  status: "true",
};
