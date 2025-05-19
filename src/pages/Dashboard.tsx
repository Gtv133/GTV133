import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, PieChart, TrendingUp, DollarSign, Package, Users, ShoppingCart, FileText } from 'lucide-react';
import { useSaleStore } from '../stores/saleStore';
import { useProductStore } from '../stores/productStore';
import { useCustomerStore } from '../stores/customerStore';

function Dashboard() {
  const { getDailySales, getWeeklySales, getMonthlySales, sales } = useSaleStore();
  const { products, getLowStockProducts } = useProductStore();
  const { customers } = useCustomerStore();

  const lowStockProducts = getLowStockProducts();
  const dailySales = getDailySales();
  const weeklySales = getWeeklySales();
  const monthlySales = getMonthlySales();

  const statsCards = [
    {
      title: 'Ventas del Día',
      value: `$${dailySales.toFixed(2)}`,
      icon: <DollarSign size={40} />,
      color: '#2196f3'
    },
    {
      title: 'Ventas de la Semana',
      value: `$${weeklySales.toFixed(2)}`,
      icon: <TrendingUp size={40} />,
      color: '#4caf50'
    },
    {
      title: 'Ventas del Mes',
      value: `$${monthlySales.toFixed(2)}`,
      icon: <BarChart size={40} />,
      color: '#ff9800'
    },
    {
      title: 'Total de Productos',
      value: products.length,
      icon: <Package size={40} />,
      color: '#f44336'
    },
    {
      title: 'Productos con Stock Bajo',
      value: lowStockProducts.length,
      icon: <PieChart size={40} />,
      color: '#e91e63'
    },
    {
      title: 'Total de Clientes',
      value: customers.length,
      icon: <Users size={40} />,
      color: '#9c27b0'
    },
    {
      title: 'Ventas Totales',
      value: sales.length,
      icon: <ShoppingCart size={40} />,
      color: '#673ab7'
    },
    {
      title: 'Reportes Disponibles',
      value: '4',
      icon: <FileText size={40} />,
      color: '#3f51b5'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Control
      </Typography>

      <Grid container spacing={3}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2 
                }}>
                  <Box sx={{ 
                    backgroundColor: `${card.color}15`,
                    borderRadius: '50%',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color
                  }}>
                    {card.icon}
                  </Box>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" component="div">
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Productos con Stock Bajo
              </Typography>
              {lowStockProducts.map((product) => (
                <Box key={product.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: '1px solid #eee'
                }}>
                  <Typography>{product.name}</Typography>
                  <Typography color="error">
                    Stock: {product.currentStock} / {product.minStock}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Últimas Ventas
              </Typography>
              {sales.slice(-5).reverse().map((sale) => (
                <Box key={sale.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: '1px solid #eee'
                }}>
                  <Typography>
                    {new Date(sale.createdAt).toLocaleDateString('es-MX')}
                  </Typography>
                  <Typography color="primary">
                    ${sale.total.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;