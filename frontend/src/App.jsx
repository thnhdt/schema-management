import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Main from './components/Main'
import AppLayout from './Layout';
import SheetComponent from './components/Sheet/Sheet';
import Node from './components/Node';
<<<<<<< HEAD
import Database from './components/Database/Database';
import SchemaComponent from './components/Schema/Schema';
import SchemaFlow from './components/Schema/SchemaFlow';
import ReactFlowTest from './components/Schema/ReactFlowTest';
import SQLToERD from './components/Schema/SQLToERD';
=======
import SchemaComponent from './components/Schema/Schema';
>>>>>>> d345abb (init frontend)
// import { RequireUsername, AlreadyLogined } from './Authentication';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <main>
          <Routes>
            {/* Authen admin */}
            {/* <Route path="/" element={
              <AlreadyLogined>
                <Main/>
              </AlreadyLogined>} /> */}
              <Route path="/" element={<Main />}/>
            {/* <Route element={<RequireUsername />}> */}
              <Route element={<AppLayout />}>
                <Route path='/sheet' element={<Node />} />
<<<<<<< HEAD
                <Route path='/database' element={<Database />} />
                <Route path='/database/:id' element={<Database />} />
                <Route path='/schema' element={<SchemaComponent />} />
                <Route path='/schema/:id' element={<SchemaComponent />} />
                <Route path='/schema/table' element={<SchemaComponent />} />
                <Route path='/schema/flow' element={<SchemaFlow />} />
                <Route path='/schema/test' element={<ReactFlowTest />} />
                <Route path='/schema/sql-to-erd' element={<SQLToERD />} />
=======
                <Route path='/database' element={<SheetComponent />} />
                <Route path='/schema' element={<SchemaComponent />} />
                <Route path='/schema/table' element={<SchemaComponent />} />
>>>>>>> d345abb (init frontend)
                <Route path='/user' element={<SheetComponent />} />
              </Route>
            {/* </Route> */}
            <Route path="*" element={<h6>Không có đường dẫn...</h6>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

<<<<<<< HEAD
=======

>>>>>>> d345abb (init frontend)
export default App
