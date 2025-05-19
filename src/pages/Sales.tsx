import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import { Search, Barcode, ShoppingCart, Trash2, FileText, Plus, Minus, Edit2, Package } from 'lucide-react';
import { useProductStore } from '../stores/productStore';
import { useSaleStore } from '../stores/saleStore';
import { useSettingStore } from '../stores/settingStore';
import { generateReceipt } from '../utils/receipt';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  total: number;
  product: any;
  originalPrice?: number;
}

function Sales() {
  const { products, searchProducts, updateProduct } = useProductStore();
  const { addItem, removeItem, updateItemQuantity, currentSale, completeSale, clearSale } = useSaleStore();
  const { businessInfo, receiptSettings, wholesaleSettings } = useSettingStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(products);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [documentType, setDocumentType] = useState<'sale' | 'quote'>('sale');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingPrice, setEditingPrice] = useState<{ productId: string; price: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);

  useEffect(() => {
    if (searchTerm) {
      const results = searchProducts(searchTerm);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchTerm, searchProducts]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleProductSelect = (product: any) => {
    addItem(product, 1);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const item = currentSale.find(i => i.productId === productId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateItemQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleEditPrice = (productId: string, currentPrice: number) => {
    setEditingPrice({ productId, price: currentPrice });
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPrice) return;
    
    const newPrice = Number(event.target.value);
    if (isNaN(newPrice) || newPrice < 0) return;

    setEditingPrice({ ...editingPrice, price: newPrice });
  };

  const handlePriceSave = () => {
    if (!editingPrice) return;

    updateItemQuantity(editingPrice.productId, editingPrice.price);
    setEditingPrice(null);
  };

  const calculateTotal = () => {
    const subtotal = currentSale.reduce((sum, item) => sum + item.total, 0);
    const tax = receiptSettings.enableTax ? subtotal * 0.16 : 0;
    return subtotal + tax;
  };

  const calculateDiscount = () => {
    return currentSale.reduce((sum, item) => {
      const originalTotal = item.quantity * (item.originalPrice || item.price);
      return sum + (originalTotal - item.total);
    }, 0);
  };

  const isWholesale = () => {
    if (!wholesaleSettings.enabled) return false;

    const totalQuantity = currentSale.reduce((sum, item) => sum + item.quantity, 0);
    
    if (wholesaleSettings.minQuantityType === 'total') {
      return totalQuantity >= wholesaleSettings.minQuantity;
    } else {
      return currentSale.some(item => item.quantity >= wholesaleSettings.minQuantity);
    }
  };

  const calculateChange = () => {
    const total = calculateTotal();
    return cashReceived - total;
  };

  const handleComplete = () => {
    if (currentSale.length === 0) {
      setSnackbar({
        open: true,
        message: 'Agregue productos antes de continuar',
        severity: 'error'
      });
      return;
    }

    if (documentType === 'sale') {
      setCashReceived(calculateTotal());
      setShowPaymentDialog(true);
    } else {
      // Handle quote generation
      setSnackbar({
        open: true,
        message: 'Cotización generada exitosamente',
        severity: 'success'
      });
      clearSale();
    }
  };

  const handlePaymentComplete = async () => {
    try {
      if (paymentMethod === 'efectivo' && cashReceived < calculateTotal()) {
        setSnackbar({
          open: true,
          message: 'El monto recibido es menor al total',
          severity: 'error'
        });
        return;
      }

      // Complete sale
      const sale = completeSale(paymentMethod);

      // Add payment info to sale object
      const paymentInfo = {
        cashReceived: paymentMethod === 'efectivo' ? cashReceived : undefined,
        change: paymentMethod === 'efectivo' ? calculateChange() : undefined
      };

      // Generate and print receipt
      await generateReceipt(sale, businessInfo, receiptSettings, paymentInfo);

      setSnackbar({
        open: true,
        message: 'Venta completada exitosamente',
        severity: 'success'
      });
      
      setShowPaymentDialog(false);
    } catch (error) {
      console.error('Error completing sale:', error);
      setSnackbar({
        open: true,
        message: 'Error al procesar la venta',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {documentType === 'sale' ? 'Nueva Venta' : 'Nueva Cotización'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Tipo de Documento</InputLabel>
                  <Select
                    value={documentType}
                    label="Tipo de Documento"
                    onChange={(e) => setDocumentType(e.target.value as 'sale' | 'quote')}
                  >
                    <MenuItem value="sale">Venta</MenuItem>
                    <MenuItem value="quote">Cotización</MenuItem>
                  </Select>
                </FormControl>

                {wholesaleSettings.enabled && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={`Venta por Mayoreo ${isWholesale() ? 'Aplicada' : 'Disponible'}`}
                      color={isWholesale() ? 'success' : 'default'}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                )}
              </Box>
              
              <TextField
                fullWidth
                placeholder="Buscar producto (código de barras, nombre o descripción)..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <Barcode size={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {showSearchResults && searchResults.length > 0 && (
                <Paper sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
                  <List>
                    {searchResults.map((product) => (
                      <ListItem
                        key={product.id}
                        button
                        onClick={() => handleProductSelect(product)}
                      >
                        <ListItemAvatar>
                          {product.imageUrl ? (
                            <Avatar 
                              src={product.imageUrl}
                              alt={product.name}
                              variant="rounded"
                              sx={{ width: 50, height: 50 }}
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
                        </ListItemAvatar>
                        <ListItemText
                          primary={product.name}
                          secondary={`Código: ${product.barcode} - Stock: ${product.currentStock}`}
                          sx={{ ml: 2 }}
                        />
                        <Typography color="primary" sx={{ fontWeight: 'bold', ml: 2 }}>
                          ${product.sellingPrice.toFixed(2)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </CardContent>
          </Card>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell align="right">Precio Original</TableCell>
                  <TableCell align="right">Precio Final</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentSale.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                        ) : (
                          <Avatar 
                            variant="rounded"
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: 'grey.200',
                              color: 'text.secondary'
                            }}
                          >
                            <Package size={20} />
                          </Avatar>
                        )}
                        {item.product.name}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(item.productId, -1)}
                        >
                          <Minus size={16} />
                        </IconButton>
                        {item.quantity}
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(item.productId, 1)}
                        >
                          <Plus size={16} />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      ${(item.originalPrice || item.price).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {editingPrice?.productId === item.productId ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editingPrice.price}
                          onChange={handlePriceChange}
                          onBlur={handlePriceSave}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handlePriceSave();
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          sx={{ width: '100px' }}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          ${item.price.toFixed(2)}
                          <IconButton
                            size="small"
                            onClick={() => handleEditPrice(item.productId, item.price)}
                          >
                            <Edit2 size={16} />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {currentSale.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No hay productos agregados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {documentType === 'sale' ? 'Resumen de Venta' : 'Resumen de Cotización'}
              </Typography>
              
              {isWholesale() && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Descuento por mayoreo: ${calculateDiscount().toFixed(2)}
                </Alert>
              )}

              <Box sx={{ my: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  Subtotal: ${currentSale.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                </Typography>
                {receiptSettings.enableTax && (
                  <Typography variant="body1" color="text.secondary">
                    IVA (16%): ${(currentSale.reduce((sum, item) => sum + item.total, 0) * 0.16).toFixed(2)}
                  </Typography>
                )}
                <Typography variant="h4" align="center" sx={{ mt: 2 }}>
                  Total: ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>
              <Button
                fullWidth
                size="large"
                variant="contained"
                startIcon={documentType === 'sale' ? <ShoppingCart /> : <FileText />}
                onClick={handleComplete}
                sx={{ mt: 2 }}
              >
                {documentType === 'sale' ? 'Completar Venta' : 'Generar Cotización'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)}>
        <DialogTitle>Método de Pago</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Método de Pago</InputLabel>
            <Select
              value={paymentMethod}
              label="Método de Pago"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="tarjeta">Tarjeta</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
            </Select>
          </FormControl>

          {paymentMethod === 'efectivo' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Monto Recibido"
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              {cashReceived >= calculateTotal() && (
                <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>
                  Cambio: ${calculateChange().toFixed(2)}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1">Resumen:</Typography>
            <Typography>Subtotal: ${currentSale.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</Typography>
            {receiptSettings.enableTax && (
              <Typography>
                IVA (16%): ${(currentSale.reduce((sum, item) => sum + item.total, 0) * 0.16).toFixed(2)}
              </Typography>
            )}
            {isWholesale() && (
              <Typography color="success.main">
                Descuento por mayoreo: ${calculateDiscount().toFixed(2)}
              </Typography>
            )}
            <Typography variant="h6">
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handlePaymentComplete} 
            variant="contained"
            disabled={paymentMethod === 'efectivo' && cashReceived < calculateTotal()}
          >
            Completar Venta
          </Button>
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

export default Sales;