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
  Snackbar,
  Alert,
} from '@mui/material';
import { Plus, Search, FileEdit, Trash2, Mail, Phone } from 'lucide-react';
import { useCustomerStore } from '../stores/customerStore';

function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, searchCustomers } = useCustomerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filteredCustomers, setFilteredCustomers] = useState(customers);

  React.useEffect(() => {
    setFilteredCustomers(searchCustomers(searchTerm));
  }, [searchTerm, customers, searchCustomers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleNewCustomer = () => {
    setEditingCustomer({
      name: '',
      taxId: '',
      email: '',
      phone: '',
      postalCode: '',
      address: '',
      taxRegime: '',
      invoiceUsage: '',
    });
    setOpenDialog(true);
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer({ ...customer });
    setOpenDialog(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
      setSnackbar({
        open: true,
        message: 'Cliente eliminado correctamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al eliminar el cliente',
        severity: 'error'
      });
    }
  };

  const handleSaveCustomer = async () => {
    try {
      if (editingCustomer.id) {
        await updateCustomer(editingCustomer.id, editingCustomer);
        setSnackbar({
          open: true,
          message: 'Cliente actualizado correctamente',
          severity: 'success'
        });
      } else {
        await addCustomer(editingCustomer);
        setSnackbar({
          open: true,
          message: 'Cliente creado correctamente',
          severity: 'success'
        });
      }
      setOpenDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al guardar el cliente',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={handleNewCustomer}
        >
          Nuevo Cliente
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={handleSearchChange}
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
              <TableCell>Nombre</TableCell>
              <TableCell>RFC</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Código Postal</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.taxId}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.postalCode}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleEditCustomer(customer)}
                  >
                    <FileEdit size={18} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteCustomer(customer.id)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay clientes registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre Completo"
                value={editingCustomer?.name || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RFC"
                value={editingCustomer?.taxId || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, taxId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Postal"
                value={editingCustomer?.postalCode || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, postalCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editingCustomer?.email || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={editingCustomer?.phone || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                multiline
                rows={2}
                value={editingCustomer?.address || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Régimen Fiscal"
                value={editingCustomer?.taxRegime || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, taxRegime: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Uso de Factura"
                value={editingCustomer?.invoiceUsage || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, invoiceUsage: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveCustomer} variant="contained">Guardar</Button>
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

export default Customers;