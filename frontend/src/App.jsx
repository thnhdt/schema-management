import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { createContext, useContext, useEffect, useState } from 'react';
import Main from './components/Main'
import AppLayout from './Layout';
import Node from './components/Node';
import Database from './components/Database/Database';
import SchemaComponent from './components/Schema/Schema';
import SchemaFlow from './components/Schema/SchemaFlow';
import ReactFlowTest from './components/Schema/ReactFlowTest';
import SQLToERD from './components/Schema/SQLToERD';
import Register from './components/Register';

import { AlreadyLogined } from './Authentication';
import User from './components/User';
import AxiosInterceptor from './Authentication';
import { getState } from './api';

const GlobalContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalUser = () => useContext(GlobalContext);

function App() {
  const [user, setUser] = useState(null);
  // const userId = sessionStorage.getItem('userId');
  const [isInitializing, setIsInitializing] = useState(true);
  useEffect(() => {
    const userId = sessionStorage.getItem('userId');

    // 👉 Nếu chưa đăng nhập, dừng loader ngay:
    if (!userId && !user) {
      setIsInitializing(false);
      return;
    }
    (async () => {
      try {
        const res = await getState(userId);
        setUser(res.metaData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsInitializing(false); // luôn chạy
      }
    })();
  }, []);

  const value = { user, setUser };
  if (isInitializing) {
    return <div>Đang tải thông tin người dùng...</div>; // hoặc spinner
  }
  return (
    <GlobalContext.Provider value={value}>
      <BrowserRouter>
        <div className="App">
          <main>
            <Routes>
              <Route path="/" element={
                <AlreadyLogined>
                  <Main />
                </AlreadyLogined>} />
              <Route path="/register" element={
                <AlreadyLogined>
                  < Register />
                </AlreadyLogined>} />
              <Route element={
                <AppLayout />
              }>
                <Route path='/sheet' element={<Node />} />
                <Route path='/database' element={<Database />} />
                <Route path='/database/:id' element={<Database />} />
                <Route path='/schema' element={<SchemaComponent />} />
                <Route path='/schema/:id' element={<SchemaComponent />} />
                <Route path='/schema/table' element={<SchemaComponent />} />
                <Route path='/schema/flow' element={<SchemaFlow />} />
                <Route path='/schema/test' element={<ReactFlowTest />} />
                <Route path='/schema/sql-to-erd' element={<SQLToERD />} />
                <Route path='/user' element={<User />} />
              </Route>
              {/* </Route> */}
              <Route path="*" element={<h6>Không có đường dẫn...</h6>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </GlobalContext.Provider >
  )
}

export default App
