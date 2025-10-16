import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ProductDetail from './components/ProductDetail';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="app__main">
          <ProductDetail />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
