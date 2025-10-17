import { useOptionalInjection } from "inversify-react";
import { useState, useEffect } from "react";
import { NIHotkey, type IHotkey } from "@/types";
export function TestHotkeyView(props?: any): React.ReactNode {
  const hotkey: IHotkey | undefined = useOptionalInjection(NIHotkey.kind);

  const [hotkeyCombo, setHotkeyCombo] = useState<string>("ctrl+k");
  const [hotkeyDescription, setHotkeyDescription] =
    useState<string>("测试快捷键");
  const [hotkeyLog, setHotkeyLog] = useState<
    Array<{ message: string; timestamp: Date }>
  >([]);
  const [isActive, setIsActive] = useState<boolean>(true);

  // 记录热键操作日志
  const addLog = (message: string) => {
    const newLog = { message, timestamp: new Date() };
    setHotkeyLog((prev) => [...prev, newLog].slice(-50)); // 只保留最近50条日志
  };

  // 清除日志
  const clearLogs = () => {
    setHotkeyLog([]);
  };

  // 绑定测试快捷键
  const bindHotkey = () => {
    if (hotkey && hotkeyCombo) {
      try {
        // 先解绑所有可能存在的相同组合键，避免重复绑定
        // 注意：实际代码中可能需要更复杂的解绑逻辑

        // 绑定新的快捷键
        hotkey.bind(hotkeyCombo, (e, combo) => {
          e.preventDefault();
          e.stopPropagation();
          const logMessage = `${combo || hotkeyCombo} 被触发${
            hotkeyDescription ? `: ${hotkeyDescription}` : ""
          }`;
          addLog(logMessage);
          console.log(logMessage);
        });
        addLog(
          `已绑定快捷键: ${hotkeyCombo}${
            hotkeyDescription ? ` - ${hotkeyDescription}` : ""
          }`
        );
      } catch (error) {
        addLog(
          `绑定快捷键失败: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  };

  // 切换热键激活状态
  const toggleActive = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    if (hotkey) {
      hotkey.activate(newActiveState);
    }
    addLog(`热键系统已${newActiveState ? "激活" : "禁用"}`);
  };

  // 测试预设的常用快捷键
  const testCommonHotkeys = () => {
    if (hotkey) {
      // 测试一些常用的快捷键组合
      const commonCombos = [
        { combo: "ctrl+s", desc: "保存" },
        { combo: "ctrl+c", desc: "复制" },
        { combo: "ctrl+v", desc: "粘贴" },
        { combo: "ctrl+z", desc: "撤销" },
        { combo: "ctrl+shift+z", desc: "重做" },
      ];

      commonCombos.forEach(({ combo, desc }) => {
        hotkey.bind(combo, (e, c) => {
          e.preventDefault();
          e.stopPropagation();
          addLog(`${c || combo} 被触发: ${desc}`);
        });
      });
      addLog(
        `已绑定常用快捷键: ${commonCombos.map((item) => item.combo).join(", ")}`
      );
    }
  };

  // 测试序列快捷键
  const testSequenceHotkeys = () => {
    if (hotkey) {
      // 测试序列快捷键，如先按 g 再按 h
      const sequenceCombo = "g h";
      hotkey.bind(sequenceCombo, (e, combo) => {
        e.preventDefault();
        e.stopPropagation();
        addLog(`序列快捷键 ${combo || sequenceCombo} 被触发`);
      });
      addLog(`已绑定序列快捷键: ${sequenceCombo}`);
    }
  };

  // 组件挂载时的初始化
  useEffect(() => {
    if (hotkey) {
      addLog("Hotkey 测试组件已加载");
      addLog("当前热键系统状态: 已激活");

      // 清理函数
      return () => {
        // 注意：这里可能需要添加清理代码，具体取决于hotkey的实现
        addLog("Hotkey 测试组件已卸载");
      };
    }
  }, [hotkey]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h1>Hotkey 测试工具</h1>

      {/* 主容器 - 左右布局 */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          gap: "20px",
          height: "0",
          marginTop: "20px",
        }}
      >
        {/* 左边：热键配置区域 - 占据30% */}
        <div
          style={{
            width: "30%",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* 热键配置区域 */}
          <div
            style={{
              padding: "15px",
              border: "1px solid #e8e8e8",
              borderRadius: "4px",
            }}
          >
            <h3>热键配置</h3>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "10px",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  width: "100%",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <label style={{ minWidth: "80px" }}>快捷键组合:</label>
                <input
                  type="text"
                  value={hotkeyCombo}
                  onChange={(e) => setHotkeyCombo(e.target.value)}
                  placeholder="如: ctrl+k"
                  style={{ padding: "5px", flex: 1 }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  width: "100%",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <label style={{ minWidth: "80px" }}>描述:</label>
                <input
                  type="text"
                  value={hotkeyDescription}
                  onChange={(e) => setHotkeyDescription(e.target.value)}
                  placeholder="快捷键描述"
                  style={{ padding: "5px", flex: 1 }}
                />
              </div>
              <button
                onClick={bindHotkey}
                style={{
                  padding: "5px 10px",
                  width: "100%",
                  marginBottom: "10px",
                }}
                disabled={!hotkey}
              >
                绑定快捷键
              </button>
              <button
                onClick={toggleActive}
                style={{
                  padding: "5px 10px",
                  width: "100%",
                  backgroundColor: isActive ? "#1890ff" : "#d9d9d9",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
                disabled={!hotkey}
              >
                {isActive ? "禁用热键系统" : "启用热键系统"}
              </button>
            </div>
          </div>

          {/* 预设测试区域 */}
          <div
            style={{
              padding: "15px",
              border: "1px solid #e8e8e8",
              borderRadius: "4px",
            }}
          >
            <h3>预设测试</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                onClick={testCommonHotkeys}
                style={{ padding: "5px 10px", width: "100%" }}
                disabled={!hotkey}
              >
                测试常用快捷键
              </button>
              <button
                onClick={testSequenceHotkeys}
                style={{ padding: "5px 10px", width: "100%" }}
                disabled={!hotkey}
              >
                测试序列快捷键
              </button>
              <button
                onClick={clearLogs}
                style={{
                  padding: "5px 10px",
                  width: "100%",
                  backgroundColor: "#ff6b6b",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                清除日志
              </button>
            </div>
          </div>

          {/* 使用说明 */}
          <div
            style={{
              padding: "15px",
              border: "1px solid #e8e8e8",
              borderRadius: "4px",
            }}
          >
            <h3>使用说明</h3>
            <ul
              style={{ fontSize: "12px", color: "#666", paddingLeft: "20px" }}
            >
              <li>在输入框中输入快捷键组合，如: ctrl+k</li>
              <li>点击"绑定快捷键"按钮进行绑定</li>
              <li>按下绑定的快捷键组合测试效果</li>
              <li>可使用预设测试快速绑定常用快捷键</li>
              <li>序列快捷键格式: g h (先按g再按h)</li>
              <li>支持的修饰键: ctrl, shift, alt, meta</li>
            </ul>
          </div>
        </div>

        {/* 右边：热键日志输出区域 - 占据70% */}
        <div style={{ width: "70%", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              border: "1px solid #e8e8e8",
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div
              style={{
                padding: "10px",
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid #e8e8e8",
              }}
            >
              <h3>热键日志 (共 {hotkeyLog.length} 条)</h3>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                backgroundColor: "#fafafa",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
            >
              {hotkeyLog.length === 0 ? (
                <div
                  style={{
                    color: "#999",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  暂无日志
                </div>
              ) : (
                hotkeyLog.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "8px",
                      padding: "5px",
                      backgroundColor: "#fff",
                      borderLeft: `4px solid #1890ff`,
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ color: "#999", fontSize: "11px" }}>
                      [{log.timestamp.toLocaleTimeString()}]
                    </div>
                    <div style={{ marginTop: "2px" }}>{log.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
