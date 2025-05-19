import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { Plus, Search, FileEdit, Trash2, Package } from 'lucide-react';
import { usePurchaseStore } from '../stores/purchaseStore';
import { useProductStore } from '../stores/productStore';

function Purchases() {
  const { purchases, addPurchase, updatePurchase, deletePurchase } = usePurchaseStore();
  const { products } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleNewPurchase = () => {
    setEditingPurchase({
      supplier: '',
      items: [],
      status: 'pending',
      total: 0,
    });
    setOpenDialog(true);
  };

  const handleEditPurchase = (purchase: any) => {
    setEditingPurchase({ ...purchase });
    setOpenDialog(true);
  };

  const handleDeletePurchase = async (id: string) => {
    try {
      await deletePurchase(id);
      setSnackbar({
        open: true,
        message: 'Compra eliminada correctamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al eliminar la compra',
        severity: 'error'
      });
    }
  };

  const handleSavePurchase = async () => {
    try {
      if (editingPurchase.id) {
        await updatePurchase(editingPurchase.id, editingPurchase);
      } else {
        await addPurchase(editingPurchase);
      }
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: `Compra ${editingPurchase.id ? 'actualizada' : 'creada'} correctamente`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al guardar la compra',
        severity: 'error'
      });
    }
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Compras
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={handleNewPurchase}
        >
          Nueva Compra
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar compras..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <Search size={20} style={{ marginRight: '8px', color: '#666' }} />,
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPurchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.id}</TableCell>
                <TableCell>{purchase.supplier}</TableCell>
                <TableCell>{new Date(purchase.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>${purchase.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      backgroundColor: 
                        purchase.status === 'completed' ? '#e8f5e9' :
                        purchase.status === 'pending' ? '#fff3e0' : '#ffebee',
                      color:
                        purchase.status === 'completed' ? '#2e7d32' :
                        purchase.status === 'pending' ? '#e65100' : '#c62828',
                    }}
                  >
                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleEditPurchase(purchase)}
                  >
                    <FileEdit size={18} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeletePurchase(purchase.id)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredPurchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay compras registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPurchase?.id ? 'Editar Compra' : 'Nueva Compra'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Proveedor"
                value={editingPurchase?.supplier || ''}
                onChange={(e) => setEditingPurchase({ ...editingPurchase, supplier: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={editingPurchase?.status || 'pending'}
                  label="Estado"
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, status: e.target.value })}
                >
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="completed">Completada</MenuItem>
                  <MenuItem value="cancelled">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Productos
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editingPurchase?.items?.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              const newItems = editingPurchase.items.filter((_: any, i: number) => i !== index);
                              setEditingPurchase({
                                ...editingPurchase,
                                items: newItems,
                                total: newItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)
                              });
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                startIcon={<Plus />}
                onClick={() => {
                  const newItems = [...(editingPurchase.items || []), {
                    productId: '',
                    productName: '',
                    quantity: 1,
                    price: 0
                  }];
                  setEditingPurchase({
                    ...editingPurchase,
                    items: newItems
                  });
                }}
                sx={{ mt: 2 }}
              >
                Agregar Producto
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSavePurchase} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity === 'success' ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Purchases;