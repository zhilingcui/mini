import { useState, useEffect, type ReactNode } from "react";
import { useOptionalInjection } from "inversify-react";
import { NIIntlMessageManager, NIGlobalLocale, type IIntlMessageManager, type IIntlMessage, type IGlobalLocale } from "@/types";

export function TestIntlMessageManagerView(): ReactNode {
  const intlMessageManager: IIntlMessageManager | undefined = useOptionalInjection(
    NIIntlMessageManager.kind
  );
  
  const globalLocale: IGlobalLocale | undefined = useOptionalInjection(
    NIGlobalLocale.kind
  );
  
  // 状态管理
  const [testMessage, setTestMessage] = useState<string>(`{
  "zh-CN": {
    "welcome": "【addIntl】欢迎使用测试系统",
    "hello": "【addIntl】您好, {name}! 欢迎测试",
    "button.submit": "提交",
    "button.reset": "重置",
    "page.title": "测试页面",
    "page.description": "这是一个用于测试addIntl功能的页面",
    "common.info": "信息提示",
    "user.profile": "{name}的个人资料"
  },
  "en-US": {
    "welcome": "[addIntl] Welcome to test system",
    "hello": "[addIntl] Hello, {name}! Welcome to test",
    "button.submit": "Submit",
    "button.reset": "Reset",
    "page.title": "Test Page",
    "page.description": "This is a page for testing addIntl functionality",
    "common.info": "Information",
    "user.profile": "{name}'s Profile"
  }
}`);
  const [coverMode, setCoverMode] = useState<boolean>(false);
  const [intlKey, setIntlKey] = useState<string>("welcome");
  const [intlParams, setIntlParams] = useState<string>("{}");
  
  // 语言相关状态
  const [currentLocale, setCurrentLocale] = useState<string>("");
  const [selectedLocale, setSelectedLocale] = useState<string>("zh-CN");
  const [localeHistory, setLocaleHistory] = useState<Array<{locale: string, timestamp: Date}>>([]);
  
  // 测试结果
  const [addIntlResult, setAddIntlResult] = useState<string>("");
  const [intlResult, setIntlResult] = useState<string>("");
  const [intlNodeResult, setIntlNodeResult] = useState<React.ReactNode>("");
  const [testHistory, setTestHistory] = useState<Array<{action: string, result: string, timestamp: Date}>>([]);

  // 添加测试历史
  const addTestHistory = (action: string, result: string) => {
    const newHistory = { action, result, timestamp: new Date() };
    setTestHistory(prev => [...prev, newHistory].slice(-20)); // 只保留最近20条记录
  };

  // 添加语言变更历史
  const addLocaleHistory = (locale: string) => {
    const newHistory = { locale, timestamp: new Date() };
    setLocaleHistory(prev => [...prev, newHistory].slice(-20)); // 只保留最近20条记录
  };

  // 监听语言变化
  useEffect(() => {
    if (globalLocale) {
      // 设置初始语言
      const initialLocale = globalLocale.getLocale();
      setCurrentLocale(initialLocale);
      setSelectedLocale(initialLocale);
      addLocaleHistory(initialLocale);
      
      // 监听语言变化
      const unsubscribe = globalLocale.onChangeLocale((locale) => {
        setCurrentLocale(locale);
        addLocaleHistory(locale);
      });
      
      return () => unsubscribe();
    }
  }, [globalLocale]);

  // 切换语言
  const handleChangeLocale = () => {
    if (globalLocale && selectedLocale) {
      globalLocale.setLocale(selectedLocale);
    }
  };

  // 当语言变更时自动更新测试结果
  useEffect(() => {
    if (intlMessageManager && intlKey) {
      try {
        const params = JSON.parse(intlParams);
        // 更新intl结果
        const result = intlMessageManager.intl(intlKey, params);
        setIntlResult(result);
        // 更新intlNode结果
        const nodeResult = intlMessageManager.intlNode(intlKey, params);
        setIntlNodeResult(nodeResult);
      } catch (e) {
        // 解析错误时不更新结果
      }
    }
  }, [currentLocale, intlKey, intlParams, intlMessageManager]);

  // 测试addIntl方法
  const testAddIntl = () => {
    if (intlMessageManager) {
      try {
        const message: IIntlMessage = JSON.parse(testMessage);
        intlMessageManager.addIntl(message, coverMode);
        const result = `添加成功${coverMode ? "(覆盖模式)" : "(非覆盖模式)"}`;
        setAddIntlResult(result);
        addTestHistory("addIntl", result);
      } catch (e) {
        const error = `解析错误: ${(e as Error).message}`;
        setAddIntlResult(error);
        addTestHistory("addIntl", error);
      }
    }
  };

  // 测试intl方法
  const testIntl = () => {
    if (intlMessageManager) {
      try {
        const params = JSON.parse(intlParams);
        const result = intlMessageManager.intl(intlKey, params);
        setIntlResult(result);
        addTestHistory("intl", result);
      } catch (e) {
        const error = `解析错误: ${(e as Error).message}`;
        setIntlResult(error);
        addTestHistory("intl", error);
      }
    }
  };

  // 测试intlNode方法
  const testIntlNode = () => {
    if (intlMessageManager) {
      try {
        const params = JSON.parse(intlParams);
        const result = intlMessageManager.intlNode(intlKey, params);
        setIntlNodeResult(result);
        addTestHistory("intlNode", JSON.stringify(result));
      } catch (e) {
        const error = `解析错误: ${(e as Error).message}`;
        setIntlNodeResult(error);
        addTestHistory("intlNode", error);
      }
    }
  };

  // 清除所有测试结果
  const clearResults = () => {
    setAddIntlResult("");
    setIntlResult("");
    setIntlNodeResult("");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box'
    }}>
      <h1>IntlMessageManager 测试工具</h1>
      
      {/* 主容器 - 左右布局 */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginTop: '20px' 
      }}>
        {/* 左边：测试配置和操作区域 - 占据40% */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          {/* 语言配置区域 */}
          <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
            <h3>语言配置</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ minWidth: '120px' }}>当前语言:</label>
                <input
                  type="text"
                  value={currentLocale}
                  readOnly
                  style={{ padding: '5px', flex: 1, backgroundColor: '#f5f5f5' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ minWidth: '120px' }}>选择语言:</label>
                <select
                  value={selectedLocale}
                  onChange={(e) => setSelectedLocale(e.target.value)}
                  style={{ padding: '5px', flex: 1 }}
                >
                  <option value="zh-CN">简体中文 (zh-CN)</option>
                  <option value="en-US">英文 (en-US)</option>
                  <option value="zh-TW">繁体中文 (zh-TW)</option>
                </select>
              </div>
              <button 
                onClick={handleChangeLocale} 
                style={{ padding: '5px 10px', width: '100%', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px' }}
                disabled={!globalLocale}
              >
                切换语言
              </button>
            </div>
          </div>

          {/* 添加国际化消息区域 */}
          <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
            <h3>添加国际化消息</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ minWidth: '120px' }}>覆盖模式:</label>
                <input
                  type="checkbox"
                  checked={coverMode}
                  onChange={(e) => setCoverMode(e.target.checked)}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-start', marginBottom: '10px' }}>
                <label style={{ minWidth: '120px' }}>消息内容:</label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={10}
                  style={{ padding: '5px', flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
              <button 
                onClick={testAddIntl} 
                style={{ padding: '5px 10px', width: '100%', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px' }}
                disabled={!intlMessageManager}
              >
                测试 addIntl
              </button>
            </div>
          </div>
          
          {/* intl 方法测试区域 */}
          <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
            <h3>intl 方法测试</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ minWidth: '120px' }}>Key:</label>
                <input
                  type="text"
                  value={intlKey}
                  onChange={(e) => setIntlKey(e.target.value)}
                  style={{ padding: '5px', flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-start', marginBottom: '10px' }}>
                <label style={{ minWidth: '120px' }}>Params:</label>
                <textarea
                  value={intlParams}
                  onChange={(e) => setIntlParams(e.target.value)}
                  rows={2}
                  style={{ padding: '5px', flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
              <button 
                onClick={testIntl} 
                style={{ padding: '5px 10px', width: '100%', marginBottom: '10px' }}
                disabled={!intlMessageManager}
              >
                测试 intl
              </button>
              <button 
                onClick={testIntlNode} 
                style={{ padding: '5px 10px', width: '100%' }}
                disabled={!intlMessageManager}
              >
                测试 intlNode
              </button>
            </div>
          </div>
          
          {/* 清除结果按钮 */}
          <button 
            onClick={clearResults} 
            style={{ padding: '5px 10px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            清除所有测试结果
          </button>
        </div>
        
        {/* 右边：测试结果区域 - 占据60% */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          {/* addIntl 结果 */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
              <h3>addIntl 测试结果</h3>
            </div>
            <div style={{ 
              padding: '10px',
              backgroundColor: '#fafafa',
              fontFamily: 'monospace',
              fontSize: '14px',
              minHeight: '80px'
            }}>
              {addIntlResult || "点击上方按钮进行测试"}
            </div>
          </div>
          
          {/* intl 结果 */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
              <h3>intl 测试结果</h3>
            </div>
            <div style={{ 
              padding: '10px',
              backgroundColor: '#fafafa',
              fontFamily: 'monospace',
              fontSize: '14px',
              minHeight: '80px'
            }}>
              {intlResult || "点击上方按钮进行测试"}
            </div>
          </div>
          
          {/* intlNode 结果 */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
              <h3>intlNode 测试结果</h3>
            </div>
            <div style={{ 
              padding: '10px',
              backgroundColor: '#fafafa',
              fontFamily: 'monospace',
              fontSize: '14px',
              minHeight: '80px'
            }}>
              {intlNodeResult || "点击上方按钮进行测试"}
            </div>
          </div>
          
          {/* 语言变更历史 */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>语言变更历史 (共 {localeHistory.length} 条)</h3>
            </div>
            <div style={{ 
              padding: '10px',
              backgroundColor: '#fafafa',
              fontFamily: 'monospace',
              fontSize: '12px',
              minHeight: '100px',
              overflowY: 'auto'
            }}>
              {localeHistory.length === 0 ? (
                <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>暂无语言变更历史</div>
              ) : (
                localeHistory.map((history, index) => (
                  <div 
                    key={index} 
                    style={{
                      marginBottom: '8px',
                      padding: '5px',
                      backgroundColor: '#fff',
                      borderLeft: `4px solid #1890ff`,
                      borderRadius: '2px'
                    }}
                  >
                    <div style={{ color: '#999', fontSize: '11px' }}>
                      [{history.timestamp.toLocaleTimeString()}]
                    </div>
                    <div style={{ marginTop: '2px' }}>语言变更为: {history.locale}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 测试历史 */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>测试历史 (共 {testHistory.length} 条)</h3>
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
              {testHistory.length === 0 ? (
                <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>暂无测试历史</div>
              ) : (
                testHistory.map((history, index) => (
                  <div 
                    key={index} 
                    style={{
                      marginBottom: '8px',
                      padding: '5px',
                      backgroundColor: '#fff',
                      borderLeft: `4px solid #52c41a`,
                      borderRadius: '2px'
                    }}
                  >
                    <div style={{ color: '#999', fontSize: '11px' }}>
                      [{history.timestamp.toLocaleTimeString()}] {history.action}
                    </div>
                    <div style={{ marginTop: '2px' }}>{history.result}</div>
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