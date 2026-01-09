import { useState } from "react";
import { TestHotkeyView } from "./TestHotkeyView";
import { TestWrapperLogView } from "./TestWrapperLogView";
import { TestGlobalLocaleView } from "./TestGlobalLocaleView";

export function AppWorkspaceView() {
  const [activeMenu, setActiveMenu] = useState<string>("log");

  const menuItems = [
    { key: "log", label: "log测试", component: <TestWrapperLogView /> },
    { key: "hotkey", label: "hotKey测试", component: <TestHotkeyView /> },
    { key: "locale", label: "GlobalLocale测试", component: <TestGlobalLocaleView /> },
  ];

  const activeMenuItem =
    menuItems.find((item) => item.key === activeMenu) || menuItems[0];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* 左侧菜单 */}
      <div
        style={{
          width: "200px",
          backgroundColor: "#f0f2f5",
          borderRight: "1px solid #e8e8e8",
          padding: "20px 0",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            padding: "0 20px",
            margin: "0 0 20px 0",
            fontSize: "16px",
            color: "#333",
          }}
        >
          测试工具
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => setActiveMenu(item.key)}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  textAlign: "left",
                  border: "none",
                  backgroundColor:
                    activeMenu === item.key ? "#1890ff" : "transparent",
                  color: activeMenu === item.key ? "white" : "#333",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e: any) => {
                  if (activeMenu !== item.key) {
                    e.target.style.backgroundColor = "#e6f7ff";
                  }
                }}
                onMouseLeave={(e: any) => {
                  if (activeMenu !== item.key) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 右侧内容 */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
        }}
      >
        {activeMenuItem.component}
      </div>
    </div>
  );
}