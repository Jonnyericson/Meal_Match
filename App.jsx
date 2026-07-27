import React from 'react';
import Navbar from './Navbar';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <h1>Welcome to MealMatch</h1>
        <p>Plan your meals, manage your inventory, and never waste food again!</p>
      </main>
    </div>
  );
}

export default App;
