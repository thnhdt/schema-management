import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './modules/user/Main'
import AppLayout from './Layout';
import Node from './modules/node/Node';
import Database from './modules/database/Database';
import Schema from './modules/schema/Schema';
import Register from './modules/user/Register';
import CompareComponent from './modules/Compare/Compare';
import FunctionCompareComponent from './modules/Compare/Function';

import { AlreadyLogined, RequireUsername } from './Authentication';
import User from './modules/user/User';
import TableCompareComponent from './components/Compare/Table';
import ResetPassword from './modules/user/ResetPassword';
import Project from './modules/project/Project';
function App() {
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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<RequireUsername />}>
              <Route element={<AppLayout />}>
                <Route path='/node' element={<Node />} />
                <Route path='/project' element={<Project />} />
                <Route path='/database' element={<Database />} />
                <Route path='/schema' element={<Schema />} />
                <Route path='/schema/:id' element={<Schema />} />
                <Route path='/user' element={<User />} />

                {/* <Route path='/compare/function' element={<FunctionCompareComponent />} /> */}
                <Route path='/compare' element={<TableCompareComponent />} />
                {/* <Route path='/compare/detail' element={<CompareComponent />} /> */}
              </Route>
            </Route>
            <Route path="*" element={<h6>Không có đường dẫn...</h6>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
