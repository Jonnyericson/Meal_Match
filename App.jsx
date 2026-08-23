import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './pages/Home';
import MealPlans from './pages/MealPlans';
import Recipes from './pages/Recipes';
import Inventory from './pages/Inventory';
import ShoppingList from './pages/ShoppingList';
import MealMatch from './pages/MealMatch';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import Login from './pages/Login';
import Register from './pages/Register';
import RequireAuth from './RequireAuth';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/meal-plans"
            element={
              <RequireAuth>
                <MealPlans />
              </RequireAuth>
            }
          />
          <Route
            path="/recipes"
            element={
              <RequireAuth>
                <Recipes />
              </RequireAuth>
            }
          />
          <Route
            path="/inventory"
            element={
              <RequireAuth>
                <Inventory />
              </RequireAuth>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <RequireAuth>
                <ShoppingList />
              </RequireAuth>
            }
          />
          <Route
            path="/meal-match"
            element={
              <RequireAuth>
                <MealMatch />
              </RequireAuth>
            }
          />
          <Route
            path="/favorites"
            element={
              <RequireAuth>
                <Favorites />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/logout"
            element={
              <RequireAuth>
                <Logout />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
