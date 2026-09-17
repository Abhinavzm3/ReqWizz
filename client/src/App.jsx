import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Land from './components/Land'
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import LoginSuccess from './components/LoginSuccess'
import Documntation from './components/Documntation'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Land />} />
          <Route path="/main" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/doct" element={<Documntation />} />
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" />
    </>
  )
}

export default App
