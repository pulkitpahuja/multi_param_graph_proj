import React, { useState, useRef, useEffect } from "react";
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiButton,
  EuiCallOut,
  EuiTitle,
  EuiSpacer,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useSelector } from "react-redux";

const ErrorFlyout = () => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const errorData = useSelector((state) => state.errorDataSlice.data);

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [errorData]);

  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: "simpleFlyoutTitle",
  });
  let flyout;
  if (isFlyoutVisible) {
    flyout = (
      <EuiFlyout
        ownFocus
        onClose={() => setIsFlyoutVisible(false)}
        aria-labelledby={simpleFlyoutTitleId}
      >
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id={simpleFlyoutTitleId}>Logs</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          {errorData.map((error) => (
            <>
              <EuiCallOut
                style={{ border: "1px solid black" }}
                heading="h2"
                title={error.title}
                color={error.error_type ? error.error_type : undefined}
                iconType={error.icon}
              >
                <p>
                  {error.description} at <b>{error.timestamp}</b>
                </p>
              </EuiCallOut>
              <EuiSpacer size="m" />
            </>
          ))}
          <div ref={messagesEndRef} />
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
  return (
    <div>
      <EuiButton onClick={() => setIsFlyoutVisible(true)}>Show logs</EuiButton>
      {flyout}
    </div>
  );
};
export default ErrorFlyout;
