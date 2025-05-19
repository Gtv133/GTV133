import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { esES } from '@mui/material/locale';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Purchases from './pages/Purchases';
import Customers from './pages/Customers';
import LowStockProducts from './pages/LowStockProducts';
import { useThemeStore } from './stores/themeStore';

function App() {
  const { darkMode } = useThemeStore();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2563eb',
      },
      secondary: {
        main: '#475569',
      },
    },
  }, esES);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <Layout />
              </AuthGuard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={<Sales />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="customers" element={<Customers />} />
            <Route path="low-stock" element={<LowStockProducts />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;