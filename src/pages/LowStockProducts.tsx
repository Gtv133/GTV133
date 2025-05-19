import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Alert,
} from '@mui/material';
import { Package } from 'lucide-react';
import { useProductStore } from '../stores/productStore';

function LowStockProducts() {
  const { getLowStockProducts } = useProductStore();
  const lowStockProducts = getLowStockProducts();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Productos con Stock Bajo
      </Typography>

      {lowStockProducts.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imagen</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Stock Actual</TableCell>
                <TableCell>Stock Mínimo</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <Avatar 
                        variant="rounded"
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          bgcolor: 'grey.200',
                          color: 'text.secondary'
                        }}
                      >
                        <Package />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.barcode || product.internalCode}</TableCell>
                  <TableCell>{product.currentStock}</TableCell>
                  <TableCell>{product.minStock}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: '16px',
                        fontSize: '0.875rem',
                        bgcolor: product.currentStock === 0 ? '#ffebee' : '#fff3e0',
                        color: product.currentStock === 0 ? '#c62828' : '#e65100',
                      }}
                    >
                      {product.currentStock === 0 ? 'Sin Stock' : 'Stock Bajo'}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="success">
          No hay productos con stock bajo en este momento.
        </Alert>
      )}
    </Box>
  );
}

export default LowStockProducts;