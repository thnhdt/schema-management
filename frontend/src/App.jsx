import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { message } from 'antd';
import { useEffect, useState } from 'react';
import Main from './modules/user/Main'
import AppLayout from './Layout';
import Node from './modules/node/Node';
import Database from './modules/database/Database';
import Schema from './modules/schema/Schema';
// import SchemaFlow from './components/garbage/SchemaFlow';
// import ReactFlowTest from './components/garbage/ReactFlowTest';
// import SQLToERD from './components/garbage/SQLToERD';
import Register from './modules/user/Register';
import CompareComponent from './components/Compare/Compare';
import FunctionCompareComponent from './components/Compare/Function';

import { AlreadyLogined } from './Authentication';
import User from './modules/user/User';
import { useSelector } from 'react-redux';

function App() {
  const userId = useSelector(state => state.user.userId);
  const [isInitializing, setIsInitializing] = useState(true);
  useEffect(() => {
    if (!userId) {
      setIsInitializing(false);
      return;
    }
    (async () => {
      try {
        // Nếu cần fetch thêm thông tin user, có thể dispatch action Redux ở đây
        // hoặc bỏ qua nếu đã có đủ thông tin trong Redux
      } catch (err) {
        console.error(err);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, [userId]);

  if (isInitializing) {
    return <div>Đang tải thông tin người dùng...</div>;
  }
  return (
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
              <Route path='/compare/detail' element={<CompareComponent />} />
              <Route path='/compare/function' element={<FunctionCompareComponent />} />
            </Route>
            {/* </Route> */}
            <Route path="*" element={<h6>Không có đường dẫn...</h6>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
