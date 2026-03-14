import React from "react";

const Tooltip = ({ text }) => (
  <span title={text} style={{ marginLeft: 4, cursor: "help", color: "#aaa", fontSize: 11 }}>ⓘ</span>
);

export default Tooltip;