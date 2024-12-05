import React, { useEffect } from "react";
import PropTypes from "prop-types";
import classes from "./Reporting.module.css";
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiButton,
  EuiSpacer,
} from "@elastic/eui";
import Steps from "./Steps/Steps";
import ButtonGroup from "./ButtonGroup/ButtonGroup";
import { reset } from "../../store/slices/reportingSlice";
import { useDispatch } from "react-redux";

const Reporting = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(reset());
  }, []);

  return (
    <EuiPage restrictWidth paddingSize="s">
      <EuiPageBody>
        <EuiSpacer />
        <EuiPageHeader
          pageTitle="Data Reporting"
          iconType="document"
          description="Follow the steps to export data and generate reports in PDF and CSV formats."
          rightSideItems={
            [
              // <EuiButton fill>Add something</EuiButton>,
              // <EuiButton>Do something</EuiButton>,
            ]
          }
        />
        <EuiSpacer />

        <Steps />

        <ButtonGroup />
      </EuiPageBody>
    </EuiPage>
  );
};

Reporting.propTypes = {};

export default Reporting;
