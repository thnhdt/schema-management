import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
  console.log('App function render');
  useEffect(() => {
    async function fetchInitial() {
      try {
        const userId = sessionStorage.getItem('userId');

        if (userId) {
          console.log(userId);
          const res = await getState(userId);
          setUser(res.metaData);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchInitial();
  }, []);

  const value = { user, setUser };
  return (
    <GlobalContext.Provider value={value}>
      <BrowserRouter>
        <div className="App">
          <main>
            <AxiosInterceptor>
              <Routes>
                {/* Authen admin */}
                <Route path="/" element={
                  <AlreadyLogined>
                    <Main />
                  </AlreadyLogined>} />
                <Route path='/register' element={<Register />} />
                {/* <Route path="/" element={<Main />} /> */}
                {/* <Route element={<RequireUsername />}> */}
                <Route element={<AppLayout />}>
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
            </AxiosInterceptor>
          </main>
        </div>
      </BrowserRouter>
    </GlobalContext.Provider>
  )
}

export default App
