import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Main from './components/Main'
import AppLayout from './Layout';
import Node from './components/Node';
import Database from './components/Database/Database';
import SchemaComponent from './components/Schema/Schema';
import SchemaFlow from './components/Schema/SchemaFlow';
import ReactFlowTest from './components/Schema/ReactFlowTest';
import SQLToERD from './components/Schema/SQLToERD';
// import { AlreadyLogined } from './Authentication';
import User from './components/User';
import AxiosInterceptor from './Authentication';
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <main>
          <AxiosInterceptor>
            <Routes>
              {/* Authen admin */}
              {/* <Route path="/" element={
              <AlreadyLogined>
                <Main />
              </AlreadyLogined>} /> */}
              <Route path="/" element={<Main />} />
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
  )
}

export default App
