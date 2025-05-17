import React, { useState } from "react";
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiConfirmModal,
} from "@elastic/eui";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { reset } from "../../../store/slices/reportingSlice";
import { toast } from "react-toastify";
import moment from "moment";

const ButtonGroup = (props) => {
  const dispatch = useDispatch();

  const reportingState = useSelector((state) => state.reportingState);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState("pdf");

  const openModal = (type) => {
    setReportType(type);
    setIsModalVisible(true);
  };

  const closeModal = () => setIsModalVisible(false);

  const cancelModal = () => {
    closeModal();
  };

  const raiseValidation = () => {
    if (!reportingState.device_name) {
      // toast.error("Please choose a device name");
      return false;
    }

    if (!reportingState.parameters.length) {
      // toast.error("Please choose parameters");
      return false;
    }

    return true;
  };

  const confirmModal = () => {
    setIsLoading(true);
    const report = {
      ...reportingState,
      ...{
        day_start: reportingState.day_start.format("YYYY-MM-DD h:mm:ss"),
        day_end: reportingState.day_end.format("YYYY-MM-DD h:mm:ss"),
      },
      reportType: reportType,
    };
    let url = "http://127.0.0.1:5000/generate_report";
    if (reportType === "csv") {
      url = "http://127.0.0.1:5000/csv";
    }
    axios
      .post(url, report)
      .then(function (response) {
        // handle success
        const d = response.data;
        if (d) {
          toast.success(
            `Your file has been successfully saved with the name : ${d}`
          );
        } else {
          toast.error("There was an error generating the file");
        }
      })
      .catch(function (error) {
        toast.error(error.message);
      })
      .then(function () {
        // always executed
        setIsLoading(false);
      });
    closeModal();
  };

  const resetData = () => {
    dispatch(reset());
    toast.success("Successfully reset the data !");
  };

  return (
    <EuiFlexGroup responsive={false} wrap gutterSize="s" alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiButton
          isLoading={isLoading}
          disabled={props.disabled || !raiseValidation()}
          fill
          color="success"
          onClick={openModal}
          iconType="document"
        >
          Generate PDF
        </EuiButton>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiButton
          isLoading={isLoading}
          disabled={props.disabled || !raiseValidation()}
          fill
          color="success"
          onClick={() => {
            openModal("csv");
          }}
          iconType="number"
        >
          Generate CSV
        </EuiButton>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiButton
          isLoading={isLoading}
          disabled={props.disabled || !raiseValidation()}
          fill
          color="danger"
          onClick={resetData}
          iconType="cross"
        >
          Reset
        </EuiButton>
      </EuiFlexItem>

      {isModalVisible && (
        <EuiConfirmModal
          style={{ width: 600 }}
          isLoading={isLoading}
          title="Are you sure you want to generate the report ?"
          onCancel={cancelModal}
          onConfirm={confirmModal}
          cancelButtonText="Cancel"
          confirmButtonText="Confirm"
          defaultFocusedButton="confirm"
        ></EuiConfirmModal>
      )}
    </EuiFlexGroup>
  );
};

export default ButtonGroup;
