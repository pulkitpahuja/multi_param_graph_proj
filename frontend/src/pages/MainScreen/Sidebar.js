import React, { useState } from "react";
import { EuiIcon, EuiSideNav, slugify, EuiImage } from "@elastic/eui";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isSideNavOpenOnMobile, setIsSideNavOpenOnMobile] = useState(false);
  const [selectedItemName, setSelectedItem] = useState("/");
  const navigate = useNavigate();

  const toggleOpenOnMobile = () => {
    setIsSideNavOpenOnMobile(!isSideNavOpenOnMobile);
  };

  const selectItem = (name, data) => {
    setSelectedItem(data.path);
    navigate(data.path);
  };

  const createItem = (name, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    return {
      id: slugify(name),
      name,
      isSelected: selectedItemName === data.path,
      onClick: () => selectItem(name, data),
      ...data,
    };
  };

  const sideNav = [
    createItem("Data Monitoring", {
      onClick: undefined,
      icon: <EuiIcon type="logoElasticsearch" />,
      items: [
        createItem("Home", { path: "/" }),
        createItem("Graphing", { path: "/graph" }),
        createItem("Reporting", { path: "/reporting" }),
      ],
    }),
  ];

  return (
    <EuiSideNav
      aria-label="Complex example"
      mobileTitle="Navigate within $APP_NAME"
      toggleOpenOnMobile={toggleOpenOnMobile}
      isOpenOnMobile={isSideNavOpenOnMobile}
      items={sideNav}
      style={{ width: 192 }}
    />
  );
};

export default Sidebar;