import React, { useState, useEffect } from "react";
import { Button, Tooltip } from "antd";
import { DownOutlined } from "@ant-design/icons";

const ScrollToBottomButton = () => {
  const [isVisible, setIsVisible] = useState(true);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;

    console.log("windowHeight:", windowHeight);
    console.log("scrollHeight:", scrollHeight);
    console.log("scrollTop:", scrollTop);

    if (scrollHeight - scrollTop > windowHeight / 4) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  if (!isVisible) {
    return <div></div>;
  }

  return (
    <div style={{ position: "fixed", bottom: "7px", right: "24px" }}>
      {isVisible && (
        <Tooltip title="跳到底部" placement="right" color="#7464FA">
          <Button
            type="primary"
            shape="circle"
            icon={<DownOutlined />}
            onClick={scrollToBottom}
            size="large"
            style={{ borderRadius: "50%" }}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default ScrollToBottomButton;
