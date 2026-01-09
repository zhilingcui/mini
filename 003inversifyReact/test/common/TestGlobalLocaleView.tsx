import { useState, useEffect } from "react";
import { useOptionalInjection } from "inversify-react";
import { NIGlobalLocale, type IGlobalLocale, type II18nData } from "@/types";

export function TestGlobalLocaleView(props?: any): React.ReactNode {
  const globalLocale: IGlobalLocale | undefined = useOptionalInjection(
    NIGlobalLocale.kind
  );
  
  // 状态管理
  const [currentLocale, setCurrentLocale] = useState<string>("");
  const [selectedLocale, setSelectedLocale] = useState<string>("zh-CN");
  const [i18nKey, setI18nKey] = useState<string>("test.key");
  const [i18nValues, setI18nValues] = useState<string>("{\"name\":\"测试\"}");
  const [i18nMessages, setI18nMessages] = useState<string>(`{
  \"zh-CN\": {
    \"test.key\": \"你好, {name}!\"
  },
  \"en-US\": {
    \"test.key\": \"Hello, {name}!\"
  }
}`);
  const [intlData, setIntlData] = useState<string>(`{
  \"type\": \"i18n\",
  \"zh-CN\": \"你好, {name}!\",
  \"en-US\": \"Hello, {name}!\"
}`);
  const [intlParams, setIntlParams] = useState<string>("{\"name\":\"测试\"}");
  const [injectVarsMsg, setInjectVarsMsg] = useState<string>("你好, {name}!");
  const [injectVarsParams, setInjectVarsParams] = useState<string>("{\"name\":\"测试\"}");
  
  // 测试结果
  const [getI18nResult, setGetI18nResult] = useState<string>("");
  const [intlResult, setIntlResult] = useState<string | ReactNode>("");
  const [injectVarsResult, setInjectVarsResult] = useState<string>("");
  const [localeHistory, setLocaleHistory] = useState<Array<{locale: string, timestamp: Date}>>([]);

  // 初始化和监听语言变化
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

  // 添加语言变更历史
  const addLocaleHistory = (locale: string) => {
    const newHistory = { locale, timestamp: new Date() };
    setLocaleHistory(prev => [...prev, newHistory].slice(-20)); // 只保留最近20条记录
  };

  // 切换语言
  const handleChangeLocale = () => {
    if (globalLocale && selectedLocale) {
      globalLocale.setLocale(selectedLocale);
    }
  };

  // 测试getI18n方法
  const testGetI18n = () => {
    if (globalLocale) {
      try {
        const values = JSON.parse(i18nValues);
        const messages = JSON.parse(i18nMessages);
        const result = globalLocale.getI18n(i18nKey, values, currentLocale, messages);
        setGetI18nResult(result);
      } catch (e) {
        setGetI18nResult(`解析错误: ${(e as Error).message}`);
      }
    }
  };

  // 测试intl方法
  const testIntl = () => {
    if (globalLocale) {
      try {
        const data = JSON.parse(intlData) as II18nData | string;
        const params = JSON.parse(intlParams);
        const result = globalLocale.intl(data, params);
        setIntlResult(result);
      } catch (e) {
        setIntlResult(`解析错误: ${(e as Error).message}`);
      }
    }
  };

  // 测试injectVars方法
  const testInjectVars = () => {
    if (globalLocale) {
      try {
        const params = JSON.parse(injectVarsParams);
        const result = globalLocale.injectVars(injectVarsMsg, params, currentLocale);
        setInjectVarsResult(result);
      } catch (e) {
        setInjectVarsResult(`解析错误: ${(e as Error).message}`);
      }
    }
  };

  // 清除所有测试结果
  const clearResults = () => {
    setGetI18nResult("");
    setIntlResult("");
    setInjectVarsResult("");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box'
    }}>
      <h1>GlobalLocale 测试工具</h1>
      
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
          
          {/* getI18n 测试区域 */}
          <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
            <h3>getI18n 方法测试</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ minWidth: '80px' }}>Key:</label>
                <input
                  type="text"
                  value={i18nKey}
                  onChange={(e) => setI18nKey(e.target.value)}
                  style={{ padding: '5px', flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-start', marginBottom: '10px' }}>
                <label style={{ minWidth: '80px' }}>Values:</label>
                <textarea
                  value={i18nValues}
                  onChange={(e) => setI18nValues(e.target.value)}
                  rows={2}
                  style={{ padding: '5px', flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-start', marginBottom: '10px' }}>
                <label style={{ minWidth: '80px' }}>Messages:</label>
                <textarea
                  value={i18nMessages}
                  onChange={(e) => setI18nMessages(e.target.value)}
                  rows={6}
                  style={{ padding: '5px', flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
              <button 
                onClick={testGetI18n} 
                style={{ padding: '5px 10px', width: '100%' }}
                disabled={!globalLocale}
              >
                测试 getI18n
              </button>
            </div>
          </div>
          
          {/* intl 方法测试区域 */}
          <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
            <h3>intl 方法测试</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-start', marginBottom: '10px' }}>
                <label style={{ minWidth: '80px' }}>Data:</label>
                <textarea
                  value={intlData}
                  onChange={(e) => setIntlData(e.target.value)}
                  rows={4}
                  style={{ padding: '5px', flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-start', marginBottom: '10px' }}>
                <label style={{ minWidth: '80px' }}>Params:</label>
                <textarea
                  value={intlParams}
                  onChange={(e) => setIntlParams(e.target.value)}
                  rows={2}
                  style={{ padding: '5px', flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
              <button 
                onClick={testIntl} 
                style={{ padding: '5px 10px', width: '100%' }}
                disabled={!globalLocale}
              >
                测试 intl
              </button>
            </div>
          </div>
          
          {/* injectVars 方法测试区域 */}
          <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
            <h3>injectVars 方法测试</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-start', marginBottom: '10px' }}>
                <label style={{ minWidth: '80px' }}>Message:</label>
                <input
                  type="text"
                  value={injectVarsMsg}
                  onChange={(e) => setInjectVarsMsg(e.target.value)}
                  style={{ padding: '5px', flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-start', marginBottom: '10px' }}>
                <label style={{ minWidth: '80px' }}>Params:</label>
                <textarea
                  value={injectVarsParams}
                  onChange={(e) => setInjectVarsParams(e.target.value)}
                  rows={2}
                  style={{ padding: '5px', flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
              <button 
                onClick={testInjectVars} 
                style={{ padding: '5px 10px', width: '100%' }}
                disabled={!globalLocale}
              >
                测试 injectVars
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
          {/* getI18n 结果 */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
              <h3>getI18n 测试结果</h3>
            </div>
            <div style={{ 
              padding: '10px',
              backgroundColor: '#fafafa',
              fontFamily: 'monospace',
              fontSize: '14px',
              minHeight: '100px'
            }}>
              {getI18nResult || "点击上方按钮进行测试"}
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
              minHeight: '100px'
            }}>
              {intlResult || "点击上方按钮进行测试"}
            </div>
          </div>
          
          {/* injectVars 结果 */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
              <h3>injectVars 测试结果</h3>
            </div>
            <div style={{ 
              padding: '10px',
              backgroundColor: '#fafafa',
              fontFamily: 'monospace',
              fontSize: '14px',
              minHeight: '100px'
            }}>
              {injectVarsResult || "点击上方按钮进行测试"}
            </div>
          </div>
          
          {/* 语言变更历史 */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>语言变更历史 (共 {localeHistory.length} 条)</h3>
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
              {localeHistory.length === 0 ? (
                <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>暂无历史记录</div>
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
        </div>
      </div>
    </div>
  );
}