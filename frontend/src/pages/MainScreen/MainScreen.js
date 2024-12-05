import React, { useState } from "react";
import {
  EuiCollapsibleNav,
  EuiButton,
  EuiTitle,
  EuiSpacer,
  EuiText,
  EuiImage,
} from "@elastic/eui";
import Sidebar from "./Sidebar";
import logo from "../../assets/images/logo.png";

const MainScreen = () => {
  const [navIsOpen, setNavIsOpen] = useState(
    JSON.parse(
      String(localStorage.getItem("euiCollapsibleNavExample--isDocked"))
    ) || false
  );

  return (
    <>
      <EuiCollapsibleNav
        isOpen={navIsOpen}
        isDocked={true}
        size={240}
        button={
          <EuiButton onClick={() => setNavIsOpen((isOpen) => !isOpen)}>
            Toggle nav
          </EuiButton>
        }
        onClose={() => setNavIsOpen(false)}
      >
        <div style={{ padding: 16 }}>
          <EuiTitle>
            <EuiImage
              size="m"
              alt="Many small white-spotted pink jellyfish floating in a dark aquarium"
              src={logo}
            />
          </EuiTitle>
          <EuiSpacer />
          <EuiText size="s" color="subdued">
            <Sidebar />
          </EuiText>
          <EuiSpacer />
        </div>
      </EuiCollapsibleNav>
    </>
  );
};

export default MainScreen;