import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import { Plus, Search, FileEdit, Trash2, Upload, Download, Barcode, Package } from 'lucide-react';
import { useProductStore } from '../stores/productStore';
import { downloadProductTemplate } from '../utils/exportTemplates';
import { importProductsFromFile } from '../utils/importProducts';

function Products() {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    searchProducts,
    importProducts 
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [duplicateBarcodeDialog, setDuplicateBarcodeDialog] = useState(false);
  const [existingProduct, setExistingProduct] = useState<any>(null);

  const unitOptions = ['Unidad', 'Gramos', 'Kilogramos', 'Litros'];

  useEffect(() => {
    setFilteredProducts(searchProducts(searchTerm));
  }, [searchTerm, products, searchProducts]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleNewProduct = () => {
    setEditingProduct({
      barcode: '',
      internalCode: '',
      name: '',
      description: '',
      category: '',
      unit: 'Unidad',
      purchasePrice: 0,
      sellingPrice: 0,
      margin: 0,
      currentStock: 0,
      minStock: 0,
    });
    setOpenDialog(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct({ ...product });
    setOpenDialog(true);
  };

  const handleDeleteProduct = (id: string) => {
    try {
      deleteProduct(id);
      setSnackbar({
        open: true,
        message: 'Producto eliminado correctamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al eliminar el producto',
        severity: 'error'
      });
    }
  };

  const checkDuplicateBarcode = (barcode: string): any => {
    return products.find(p => 
      p.barcode === barcode && p.id !== editingProduct?.id
    );
  };

  const handleSaveProduct = () => {
    try {
      if (editingProduct.barcode) {
        const duplicate = checkDuplicateBarcode(editingProduct.barcode);
        if (duplicate) {
          setExistingProduct(duplicate);
          setDuplicateBarcodeDialog(true);
          return;
        }
      }

      if (editingProduct.id) {
        updateProduct(editingProduct.id, editingProduct);
      } else {
        addProduct(editingProduct);
      }
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: `Producto ${editingProduct.id ? 'actualizado' : 'creado'} correctamente`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al guardar el producto',
        severity: 'error'
      });
    }
  };

  const handleReplaceProduct = () => {
    if (existingProduct && editingProduct) {
      updateProduct(existingProduct.id, {
        ...editingProduct,
        id: existingProduct.id
      });
      setDuplicateBarcodeDialog(false);
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Producto actualizado correctamente',
        severity: 'success'
      });
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const importedProducts = await importProductsFromFile(file);
      
      if (importedProducts.length === 0) {
        throw new Error('No se encontraron productos válidos en el archivo');
      }

      importProducts(importedProducts);

      setSnackbar({
        open: true,
        message: `${importedProducts.length} productos importados correctamente`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al importar productos: ${error.message}`,
        severity: 'error'
      });
    }
    
    // Clear the input
    event.target.value = '';
  };

  const calculateMargin = (purchasePrice: number, sellingPrice: number) => {
    if (purchasePrice <= 0 || sellingPrice <= 0) return 0;
    return Number(((sellingPrice - purchasePrice) / sellingPrice * 100).toFixed(2));
  };

  const handlePriceChange = (field: string, value: string) => {
    const numValue = Number(value);
    const updates: any = {
      ...editingProduct,
      [field]: numValue
    };

    if (field === 'purchasePrice' || field === 'sellingPrice') {
      updates.margin = calculateMargin(
        field === 'purchasePrice' ? numValue : editingProduct.purchasePrice,
        field === 'sellingPrice' ? numValue : editingProduct.sellingPrice
      );
    }

    setEditingProduct(updates);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({
          ...editingProduct,
          imageUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Productos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadProductTemplate}
          >
            Descargar Plantilla
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            component="label"
          >
            Importar Excel/CSV
            <input
              type="file"
              hidden
              accept=".csv,.xlsx,.xls"
              onChange={handleImportFile}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={handleNewProduct}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar productos..."
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
              <TableCell>Imagen</TableCell>
              <TableCell>Código de Barras</TableCell>
              <TableCell>Código Interno</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Unidad</TableCell>
              <TableCell>Precio Compra</TableCell>
              <TableCell>Precio Venta</TableCell>
              <TableCell>Margen</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
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
                    <Box 
                      sx={{ 
                        width: '50px', 
                        height: '50px', 
                        bgcolor: 'grey.200',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Package size={24} color="#666" />
                    </Box>
                  )}
                </TableCell>
                <TableCell>{product.barcode}</TableCell>
                <TableCell>{product.internalCode}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>${product.purchasePrice.toFixed(2)}</TableCell>
                <TableCell>${product.sellingPrice.toFixed(2)}</TableCell>
                <TableCell>{product.margin}%</TableCell>
                <TableCell>{product.currentStock}</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      backgroundColor: product.currentStock <= product.minStock ? '#ffebee' : '#e8f5e9',
                      color: product.currentStock <= product.minStock ? '#c62828' : '#2e7d32',
                    }}
                  >
                    {product.currentStock <= product.minStock ? 'Stock Bajo' : 'Normal'}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleEditProduct(product)}
                  >
                    <FileEdit size={18} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Product Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct?.id ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                {editingProduct?.imageUrl ? (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={editingProduct.imageUrl}
                      alt="Product"
                      style={{ 
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                      size="small"
                      onClick={() => setEditingProduct({ ...editingProduct, imageUrl: undefined })}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '200px',
                      height: '200px',
                      bgcolor: 'grey.100',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      cursor: 'pointer',
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      '&:hover': { bgcolor: 'grey.200' }
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Package size={40} color="#666" />
                    <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                      Subir Imagen
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código de Barras"
                value={editingProduct?.barcode || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <Barcode size={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Interno"
                value={editingProduct?.internalCode || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, internalCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Producto"
                value={editingProduct?.name || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={2}
                value={editingProduct?.description || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Categoría"
                value={editingProduct?.category || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unidad de Medida</InputLabel>
                <Select
                  value={editingProduct?.unit || 'Unidad'}
                  label="Unidad de Medida"
                  onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                >
                  {unitOptions.map((unit) => (
                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Precio de Compra"
                value={editingProduct?.purchasePrice || ''}
                onChange={(e) => handlePriceChange('purchasePrice', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Precio de Venta"
                value={editingProduct?.sellingPrice || ''}
                onChange={(e) => handlePriceChange('sellingPrice', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                disabled
                label="Margen de Ganancia"
                value={`${editingProduct?.margin || 0}%`}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Stock Actual"
                value={editingProduct?.currentStock || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, currentStock: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Stock Mínimo"
                value={editingProduct?.minStock || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, minStock: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveProduct} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Barcode Dialog */}
      <Dialog open={duplicateBarcodeDialog} onClose={() => setDuplicateBarcodeDialog(false)}>
        <DialogTitle>Código de Barras Duplicado</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Ya existe un producto con este código de barras:
          </Alert>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Producto existente:</Typography>
            <Typography>Nombre: {existingProduct?.name}</Typography>
            <Typography>Código: {existingProduct?.barcode}</Typography>
            <Typography>Stock: {existingProduct?.currentStock}</Typography>
          </Box>
          <Typography>
            ¿Desea reemplazar el producto existente con los nuevos datos o modificar el código de barras?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateBarcodeDialog(false)}>Cancelar</Button>
          <Button 
            onClick={() => {
              setDuplicateBarcodeDialog(false);
              setEditingProduct({ ...editingProduct, barcode: '' });
            }}
          >
            Modificar Código
          </Button>
          <Button 
            variant="contained" 
            color="warning"
            onClick={handleReplaceProduct}
          >
            Reemplazar Producto
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

export default Products;