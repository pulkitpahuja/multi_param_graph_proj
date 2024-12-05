import React, { useState } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiFieldNumber,
  EuiDatePicker,
  htmlIdGenerator,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setVal } from "../../../store/slices/deviceMetaSlice";

import axios from "axios";
import moment from "moment";
import { DEVICEMETA_LINK,UPDATE_TEMP_ANNOS_LINK } from "../../../Constants";
const AddAnnoModal = (props) => {
  const { meta, dataValues, setDataValues } = props;
  const [startDate, setStartDate] = useState(moment());
  const [name, setName] = useState("");
  const [qty, setQTY] = useState(0);
  const dispatch = useDispatch();

  const handleChange = (date) => {
    setStartDate(date);
  };
  const [isModalVisible, setIsModalVisible] = useState(false);
  const modalFormId = useGeneratedHtmlId({ prefix: "modalForm" });

  const closeModal = () => setIsModalVisible(false);
  const handleSubmit = () => {
    let cop = [...dataValues];
    const val = {
      id: htmlIdGenerator()(),
      dataValue: startDate.unix(),
      details: `Name: ${name} \n\n Qty: ${qty}`,
    };
    cop.push(val);
    axios
      .post(UPDATE_TEMP_ANNOS_LINK, { devID: meta.id, annos: cop })
      .then(function (response) {
        // handle success
        const d = response.data;
        if (d) {
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
              console.error(error);
            })
            .then(function () {
              // always executed
            });
        }
      })
      .catch(function (error) {
        // handle error
        console.error(error);
      })
      .then(function () {
        // always executed
      });
    setDataValues([...cop]);
    closeModal();
  };
  const showModal = () => setIsModalVisible(true);
  const formSample = (
    <EuiForm id={modalFormId} component="form">
      <EuiFormRow label="Name">
        <EuiFieldText
          onChange={(e) => setName(e.target.value)}
          name="popfirst"
        />
      </EuiFormRow>
      <EuiFormRow label="Qty.">
        <EuiFieldNumber
          onChange={(e) => setQTY(e.target.value)}
          name="popfirst"
        />
      </EuiFormRow>
      <EuiFormRow label="Closest Time">
        <EuiDatePicker
          showTimeSelect
          showTimeSelectOnly
          selected={startDate}
          onChange={handleChange}
          dateFormat="HH:mm:ss"
          timeFormat="HH:mm:ss"
        />
      </EuiFormRow>
    </EuiForm>
  );
  let modal;
  if (isModalVisible) {
    modal = (
      <EuiModal onClose={closeModal} initialFocus="[name=popswitch]">
        <EuiModalHeader>
          <EuiModalHeaderTitle>Add data to graph</EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>{formSample}</EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>
          <EuiButton
            type="submit"
            form={modalFormId}
            onClick={handleSubmit}
            fill
          >
            Save
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    );
  }
  return (
    <div>
      <EuiButton onClick={showModal}>Add data to table</EuiButton>
      {modal}
    </div>
  );
};

export default AddAnnoModal;
