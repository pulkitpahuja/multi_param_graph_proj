import React, { useState, Fragment, useMemo, useEffect } from "react";
import { EuiTabs, EuiTab, EuiSpacer, EuiText } from "@elastic/eui";
import { useSelector, useDispatch } from "react-redux";
import TabPage from "./TabPage";
import AllPage from "./AllPage";

const Tabs = () => {
  const deviceMeta = useSelector((state) => state.deviceMeta.data);
  const [tabs, setTabs] = useState([
    {
      id: "all--id",
      name: "All",
      content: <AllPage />,
    },
  ]);
  useEffect(() => {
    if (deviceMeta.length) {
      let tabs_copy = [
        {
          id: "all--id",
          name: "All",
          content: <AllPage />,
        },
      ];
      deviceMeta.forEach((device) => {
        const x = {
          id: `${device.name}-${Math.random()}-${device.id}-id`,
          name: device.name,
          content: (
            <TabPage key={`${device.name}-${device.id}-id`} meta={device} />
          ),
        };
        tabs_copy.push(x);
      });
      setTabs([...tabs_copy]);
    }
  }, [deviceMeta]);

  const [selectedTabId, setSelectedTabId] = useState("all--id");
  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId,deviceMeta]);

  const onSelectedTabChanged = (id) => {
    setSelectedTabId(id);
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        key={tab.id}
        href={tab.href}
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
        disabled={tab.disabled}
        prepend={tab.prepend}
        append={tab.append}
      >
        {tab.name}
      </EuiTab>
    ));
  };

  return (
    <>
      <EuiTabs>{renderTabs()}</EuiTabs>
      {selectedTabContent}
    </>
  );
};

export default Tabs;
