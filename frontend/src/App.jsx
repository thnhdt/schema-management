import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { message } from 'antd';
import { createContext, useContext, useEffect, useState } from 'react';
import Main from './modules/user/Main'
import AppLayout from './Layout';
import Node from './modules/node/Node';
import Database from './modules/database/Database';
import Schema from './modules/schema/Schema';
// import SchemaFlow from './components/garbage/SchemaFlow';
// import ReactFlowTest from './components/garbage/ReactFlowTest';
// import SQLToERD from './components/garbage/SQLToERD';
import Register from './modules/user/Register';

import { AlreadyLogined } from './Authentication';
import User from './modules/user/User';
import AxiosInterceptor from './Authentication';
import { getState } from './api';
import { useSelector } from 'react-redux';

const GlobalContext = createContext();
export const useGlobalUser = () => useContext(GlobalContext);

function App() {
  const [user, setUser] = useState(null);
  const userId = useSelector(state => state.user.userId);
  const [isInitializing, setIsInitializing] = useState(true);
  useEffect(() => {
    if (!userId) {
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
        setIsInitializing(false);
      }
    })();
  }, [userId]);

  const value = { user, setUser };
  if (isInitializing) {
    return <div>Đang tải thông tin người dùng...</div>;
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
                <Route path='/node' element={<Node />} />
                <Route path='/database' element={<Database />} />
                {/* <Route path='/database/:id' element={<Database />} /> */}
                <Route path='/schema' element={<Schema />} />
                <Route path='/schema/:id' element={<Schema />} />
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
