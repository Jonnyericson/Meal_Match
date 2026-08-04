import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MealPlans from './pages/MealPlans';
import Recipes from './pages/Recipes';
import Inventory from './pages/Inventory';
import ShoppingList from './pages/ShoppingList';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meal-plans" element={<MealPlans />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
