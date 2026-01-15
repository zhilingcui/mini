import { type IWrapperLog, NIWrapperLog, type ILogLevel } from "@/types";
import { useOptionalInjection } from "inversify-react";
import { useState, useEffect, type ReactNode } from "react";

export function TestWrapperLogView(): ReactNode {
  const wrapperLog: IWrapperLog | undefined = useOptionalInjection(
    NIWrapperLog.kind
  );
  const [logMessage, setLogMessage] = useState<string>("测试日志消息");
  const [logLevel, setLogLevel] = useState<ILogLevel>("debug");
  const [logHistory, setLogHistory] = useState<Array<{level: ILogLevel, message: string, timestamp: Date}>>([]);
  const [bizName, setBizName] = useState<string>("appWorkspace");
  const [logLevelFilter, setLogLevelFilter] = useState<ILogLevel>("debug");

  useEffect(() => {
    if (wrapperLog) {
      wrapperLog.setOptions({
        level: "log",
        bizName: "appWorkspace",
      });
      addLog("debug", "AppWorkspace component rendered");
    }
    return () => {
      if (wrapperLog) {
        addLog("debug", "AppWorkspace component unmounted");
      }
    };
  }, [wrapperLog]);

  const addLog = (level: ILogLevel, ...messages: any[]) => {
    // 构建要在界面上显示的消息，将多个参数合并为一个字符串
    const displayMessage = messages.length === 1 ? 
      (typeof messages[0] === 'string' ? messages[0] : JSON.stringify(messages[0])) : 
      messages.map(msg => typeof msg === 'string' ? msg : JSON.stringify(msg)).join(' ');
    
    const newLog = { level, message: displayMessage, timestamp: new Date() };
    setLogHistory(prev => [...prev, newLog].slice(-50)); // 只保留最近50条日志
    
    // 调用wrapperLog的对应方法，传递所有原始参数
    if (wrapperLog) {
      const logMethod = wrapperLog[level];
      if (typeof logMethod === 'function') {
        logMethod.apply(wrapperLog, messages);
      }
    }
  };

  // 清除所有日志
  const clearLogs = () => {
    setLogHistory([]);
  };

  const handleSendLog = () => {
    addLog(logLevel, logMessage);
  };

  const handleSetOptions = () => {
    if (wrapperLog) {
      wrapperLog.setOptions({ level: logLevelFilter, bizName });
      addLog("info", `设置日志选项: level=${logLevelFilter}, bizName=${bizName}`);
    }
  };

  const handleExceptionTest = () => {
    try {
      // 测试错误对象
      const error = new Error("测试异常信息");
      addLog("error", `异常测试: ${error.message}`);
      
      // 测试对象输出
      const testObject = { name: "测试对象", value: 123, nested: { deep: "嵌套属性" } };
      addLog("info", `对象测试: ${JSON.stringify(testObject)}`);
      
      // 测试多个参数
      addLog("log", "多参数测试: 参数1", "参数2", "参数3");
    } catch (err) {
      addLog("error", `捕获到异常: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const filteredLogs = logHistory.filter(log => {
    const levelOrder: Record<ILogLevel, number> = { debug: 0, log: 1, info: 2, warn: 3, error: 4 };
    return levelOrder[log.level] >= levelOrder[logLevelFilter];
  });

  const getLogLevelColor = (level: ILogLevel) => {
    const colors: Record<ILogLevel, string> = {
      debug: "#fadb14",
      log: "#8c8c8c",
      info: "#52c41a",
      warn: "#fa8c16",
      error: "#ff4d4f"
    };
    return colors[level];
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      height: '100vh',
      boxSizing: 'border-box'
    }}>
      <h1>WrapperLog 测试工具</h1>
      
      {/* 主容器 - 左右布局 */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        height: 'calc(100vh - 80px)',
        marginTop: '20px' 
      }}>
        {/* 左边：日志配置和发送区域 - 占据30% */}
        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 日志配置区域 */}
          <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
            <h3>日志配置</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ minWidth: '60px' }}>BizName:</label>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  style={{ padding: '5px', flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ minWidth: '60px' }}>过滤级别:</label>
                <select
                  value={logLevelFilter}
                  onChange={(e) => setLogLevelFilter(e.target.value as ILogLevel)}
                  style={{ padding: '5px', flex: 1 }}
                >
                  <option value="debug">debug</option>
                  <option value="log">log</option>
                  <option value="info">info</option>
                  <option value="warn">warn</option>
                  <option value="error">error</option>
                </select>
              </div>
              <button onClick={handleSetOptions} style={{ padding: '5px 10px', width: '100%' }}>设置选项</button>
            </div>
          </div>
          
          {/* 日志发送区域 */}
          <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
            <h3>发送日志</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ minWidth: '60px' }}>日志级别:</label>
                <select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value as ILogLevel)}
                  style={{ padding: '5px', flex: 1 }}
                >
                  <option value="debug">debug</option>
                  <option value="log">log</option>
                  <option value="info">info</option>
                  <option value="warn">warn</option>
                  <option value="error">error</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ minWidth: '60px' }}>日志内容:</label>
                <input
                  type="text"
                  value={logMessage}
                  onChange={(e) => setLogMessage(e.target.value)}
                  style={{ padding: '5px', flex: 1 }}
                />
              </div>
              <button onClick={handleSendLog} style={{ padding: '5px 10px', width: '100%', marginBottom: '10px' }}>发送日志</button>
              <button onClick={handleExceptionTest} style={{ padding: '5px 10px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', width: '100%' }}>
                异常测试
              </button>
            </div>
          </div>
        </div>
        
        {/* 右边：日志输出区域 - 占据70% */}
        <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>日志输出 (共 {filteredLogs.length} 条)</h3>
              <button
                onClick={clearLogs}
                style={{
                  padding: '5px 15px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ff5252'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff6b6b'}
              >
                清除日志
              </button>
            </div>
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '10px',
              backgroundColor: '#fafafa',
              fontFamily: 'monospace',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {filteredLogs.length === 0 ? (
                <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>暂无日志</div>
              ) : (
                filteredLogs.map((log, index) => (
                  <div 
                    key={index} 
                    style={{
                      marginBottom: '8px',
                      padding: '5px',
                      backgroundColor: '#fff',
                      borderLeft: `4px solid ${getLogLevelColor(log.level)}`,
                      borderRadius: '2px'
                    }}
                  >
                    <div style={{ color: '#999', fontSize: '11px' }}>
                      [{log.timestamp.toLocaleTimeString()}] [{log.level}]
                    </div>
                    <div style={{ marginTop: '2px' }}>{log.message}</div>
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