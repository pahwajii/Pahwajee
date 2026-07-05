import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<div className="container-x section-y"><h2>Welcome to PAHWA JEE</h2><p>Since Generations · Meerut</p></div>} />
            <Route path="/products" element={<div className="container-x section-y"><h2>Products</h2><p>Catalogue coming soon</p></div>} />
            <Route path="*" element={<div className="container-x section-y"><h2>Page Not Found</h2></div>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
