import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemSecondaryAction,
  Switch,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Input,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
} from '@mui/material';
import { 
  Bell, 
  Moon, 
  Database, 
  Printer, 
  Store,
  Image,
  MessageSquare,
  QrCode,
  Copy,
  Save,
  Download,
  Upload,
  Package,
  Percent
} from 'lucide-react';
import { useSettingStore } from '../stores/settingStore';
import { useThemeStore } from '../stores/themeStore';
import DataManagement from '../components/DataManagement';
import PrinterSelector from '../components/PrinterSelector';
import { printerPlugin } from '../utils/printerPlugin';
import TicketDesigner from '../components/TicketDesigner';

function Settings() {
  const { 
    businessInfo,
    receiptSettings,
    notificationSettings,
    wholesaleSettings,
    updateBusinessInfo,
    updateReceiptSettings,
    updateNotificationSettings,
    updateWholesaleSettings,
  } = useSettingStore();

  const { darkMode, toggleDarkMode } = useThemeStore();
  const [openBusinessDialog, setOpenBusinessDialog] = useState(false);
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [openDataDialog, setOpenDataDialog] = useState(false);
  const [openWholesaleDialog, setOpenWholesaleDialog] = useState(false);
  const [tempBusinessInfo, setTempBusinessInfo] = useState(businessInfo);
  const [tempReceiptSettings, setTempReceiptSettings] = useState(receiptSettings);
  const [tempWholesaleSettings, setTempWholesaleSettings] = useState(wholesaleSettings);
  const [showSuccess, setShowSuccess] = useState(false);

  const ticketSections = [
    {
      id: 'logo',
      title: 'Logo del Negocio',
      enabled: tempReceiptSettings.showLogo,
      preview: '[Logo]\n'
    },
    {
      id: 'header',
      title: 'Encabezado',
      enabled: tempReceiptSettings.printHeader,
      preview: `${businessInfo.name}\n${businessInfo.address}\nTel: ${businessInfo.phone}\nRFC: ${businessInfo.taxId}\n`
    },
    {
      id: 'sale-info',
      title: 'Información de Venta',
      enabled: true,
      preview: 'Fecha: 07/04/2025 15:30\nTicket #: 001\n'
    },
    {
      id: 'items',
      title: 'Productos',
      enabled: true,
      preview: 'Producto          Cant    Precio   Total\n----------------------------------------\nCoca Cola         2      $20.00   $40.00\nPan Dulce         3      $15.00   $45.00\n'
    },
    {
      id: 'totals',
      title: 'Totales',
      enabled: true,
      preview: '----------------------------------------\nSubtotal: $85.00\nIVA: $13.60\nTotal: $98.60\n'
    },
    {
      id: 'payment',
      title: 'Información de Pago',
      enabled: true,
      preview: 'Método de pago: Efectivo\nRecibido: $100.00\nCambio: $1.40\n'
    },
    {
      id: 'footer',
      title: 'Pie de Página',
      enabled: tempReceiptSettings.printFooter,
      preview: `\n${tempReceiptSettings.footerMessage}\n`
    },
    {
      id: 'qr',
      title: 'Código QR',
      enabled: tempReceiptSettings.printQr,
      preview: '[Código QR]\n'
    }
  ];

  useEffect(() => {
    printerPlugin.initialize();
  }, []);

  const handleBusinessSave = () => {
    updateBusinessInfo(tempBusinessInfo);
    setOpenBusinessDialog(false);
    showSuccessMessage();
  };

  const handleReceiptSave = () => {
    updateReceiptSettings(tempReceiptSettings);
    setOpenReceiptDialog(false);
    showSuccessMessage();
  };

  const handleWholesaleSave = () => {
    updateWholesaleSettings(tempWholesaleSettings);
    setOpenWholesaleDialog(false);
    showSuccessMessage();
  };

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempBusinessInfo({
          ...tempBusinessInfo,
          logoUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTicketSectionsChange = (sections: any[]) => {
    const updatedSettings = { ...tempReceiptSettings };
    sections.forEach(section => {
      switch (section.id) {
        case 'logo':
          updatedSettings.showLogo = section.enabled;
          break;
        case 'header':
          updatedSettings.printHeader = section.enabled;
          break;
        case 'footer':
          updatedSettings.printFooter = section.enabled;
          break;
        case 'qr':
          updatedSettings.printQr = section.enabled;
          break;
      }
    });
    setTempReceiptSettings(updatedSettings);
  };

  const settingSections = [
    {
      title: 'Información del Negocio',
      items: [
        {
          icon: <Store />,
          primary: 'Datos del Negocio',
          secondary: 'Nombre, dirección, teléfono, etc.',
          action: 'button',
          buttonText: 'Editar',
          onClick: () => {
            setTempBusinessInfo(businessInfo);
            setOpenBusinessDialog(true);
          }
        }
      ]
    },
    {
      title: 'Configuración de Ventas',
      items: [
        {
          icon: <Package />,
          primary: 'Ventas por Mayoreo',
          secondary: 'Configurar descuentos y cantidades mínimas',
          action: 'button',
          buttonText: 'Configurar',
          onClick: () => {
            setTempWholesaleSettings(wholesaleSettings);
            setOpenWholesaleDialog(true);
          }
        }
      ]
    },
    {
      title: 'Configuración de Tickets',
      items: [
        {
          icon: <Printer />,
          primary: 'Personalización de Tickets',
          secondary: 'Diseño y contenido de tickets',
          action: 'button',
          buttonText: 'Configurar',
          onClick: () => {
            setTempReceiptSettings(receiptSettings);
            setOpenReceiptDialog(true);
          }
        }
      ]
    },
    {
      title: 'Gestión de Datos',
      items: [
        {
          icon: <Database />,
          primary: 'Importar/Exportar Datos',
          secondary: 'Gestionar datos del sistema',
          action: 'button',
          buttonText: 'Gestionar',
          onClick: () => setOpenDataDialog(true)
        }
      ]
    },
    {
      title: 'Notificaciones',
      items: [
        {
          icon: <Bell />,
          primary: 'Notificaciones Push',
          secondary: 'Recibir alertas de stock bajo',
          action: 'switch',
          checked: notificationSettings.enablePush,
          onChange: (checked: boolean) => {
            updateNotificationSettings({ ...notificationSettings, enablePush: checked });
            showSuccessMessage();
          }
        }
      ]
    },
    {
      title: 'Sistema',
      items: [
        {
          icon: <Moon />,
          primary: 'Modo Oscuro',
          secondary: 'Cambiar tema claro/oscuro',
          action: 'switch',
          checked: darkMode,
          onChange: toggleDarkMode
        }
      ]
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Configuración
      </Typography>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuración actualizada exitosamente
        </Alert>
      )}

      {settingSections.map((section) => (
        <Card key={section.title} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              {section.title}
            </Typography>
            <List>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={item.primary}>
                  <ListItem>
                    <ListItemIcon sx={{ color: 'primary.main' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.primary}
                      secondary={item.secondary}
                    />
                    <ListItemSecondaryAction>
                      {item.action === 'switch' ? (
                        <Switch
                          edge="end"
                          checked={item.checked}
                          onChange={(e) => item.onChange(e.target.checked)}
                        />
                      ) : (
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={item.onClick}
                        >
                          {item.buttonText}
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  {itemIndex < section.items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      ))}

      {/* Business Info Dialog */}
      <Dialog 
        open={openBusinessDialog} 
        onClose={() => setOpenBusinessDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Información del Negocio</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Negocio"
                value={tempBusinessInfo.name}
                onChange={(e) => setTempBusinessInfo({
                  ...tempBusinessInfo,
                  name: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                multiline
                rows={2}
                value={tempBusinessInfo.address}
                onChange={(e) => setTempBusinessInfo({
                  ...tempBusinessInfo,
                  address: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={tempBusinessInfo.phone}
                onChange={(e) => setTempBusinessInfo({
                  ...tempBusinessInfo,
                  phone: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={tempBusinessInfo.email}
                onChange={(e) => setTempBusinessInfo({
                  ...tempBusinessInfo,
                  email: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RFC"
                value={tempBusinessInfo.taxId}
                onChange={(e) => setTempBusinessInfo({
                  ...tempBusinessInfo,
                  taxId: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Logo del Negocio
              </Typography>
              <Input
                type="file"
                onChange={handleLogoUpload}
                sx={{ display: 'none' }}
                id="logo-upload"
                inputProps={{ accept: 'image/*' }}
              />
              <label htmlFor="logo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Image />}
                >
                  Subir Logo
                </Button>
              </label>
              {tempBusinessInfo.logoUrl && (
                <Box sx={{ mt: 2 }}>
                  <img 
                    src={tempBusinessInfo.logoUrl} 
                    alt="Logo" 
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBusinessDialog(false)}>Cancelar</Button>
          <Button onClick={handleBusinessSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Settings Dialog */}
      <Dialog 
        open={openReceiptDialog} 
        onClose={() => setOpenReceiptDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>Configuración de Tickets</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <PrinterSelector
                value={tempReceiptSettings.printerName}
                onChange={(printerName) => setTempReceiptSettings({
                  ...tempReceiptSettings,
                  printerName
                })}
              />
            </Grid>

            <Grid item xs={12}>
              <TicketDesigner
                sections={ticketSections}
                onChange={handleTicketSectionsChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ancho del Papel</InputLabel>
                <Select
                  value={tempReceiptSettings.paperWidth}
                  label="Ancho del Papel"
                  onChange={(e) => setTempReceiptSettings({
                    ...tempReceiptSettings,
                    paperWidth: Number(e.target.value)
                  })}
                >
                  <MenuItem value={58}>58mm</MenuItem>
                  <MenuItem value={80}>80mm</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Tamaño de Fuente</Typography>
              <Slider
                value={tempReceiptSettings.fontSize}
                min={8}
                max={12}
                step={1}
                marks
                onChange={(_, value) => setTempReceiptSettings({
                  ...tempReceiptSettings,
                  fontSize: value as number
                })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mensaje de Pie de Página"
                multiline
                rows={2}
                value={tempReceiptSettings.footerMessage}
                onChange={(e) => setTempReceiptSettings({
                  ...tempReceiptSettings,
                  footerMessage: e.target.value
                })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Configuración de Impuestos
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Switch
                  checked={tempReceiptSettings.enableTax}
                  onChange={(e) => setTempReceiptSettings({
                    ...tempReceiptSettings,
                    enableTax: e.target.checked
                  })}
                />
                <Typography>Calcular y mostrar IVA en tickets</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Número de Copias</InputLabel>
                <Select
                  value={tempReceiptSettings.copies}
                  label="Número de Copias"
                  onChange={(e) => setTempReceiptSettings({
                    ...tempReceiptSettings,
                    copies: Number(e.target.value)
                  })}
                >
                  {[1, 2, 3].map((n) => (
                    <MenuItem key={n} value={n}>{n}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReceiptDialog(false)}>Cancelar</Button>
          <Button onClick={handleReceiptSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Data Management Dialog */}
      <DataManagement
        open={openDataDialog}
        onClose={() => setOpenDataDialog(false)}
      />

      {/* Wholesale Settings Dialog */}
      <Dialog
        open={openWholesaleDialog}
        onClose={() => setOpenWholesaleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configuración de Ventas por Mayoreo</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Switch
                  checked={tempWholesaleSettings.enabled}
                  onChange={(e) => setTempWholesaleSettings({
                    ...tempWholesaleSettings,
                    enabled: e.target.checked
                  })}
                />
                <Typography>Habilitar ventas por mayoreo</Typography>
              </Box>
            </Grid>

            {tempWholesaleSettings.enabled && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Cantidad Mínima</InputLabel>
                    <Select
                      value={tempWholesaleSettings.minQuantityType}
                      label="Tipo de Cantidad Mínima"
                      onChange={(e) => setTempWholesaleSettings({
                        ...tempWholesaleSettings,
                        minQuantityType: e.target.value as 'perItem' | 'total'
                      })}
                    >
                      <MenuItem value="perItem">Por Producto</MenuItem>
                      <MenuItem value="total">Total de Productos</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cantidad Mínima"
                    value={tempWholesaleSettings.minQuantity}
                    onChange={(e) => setTempWholesaleSettings({
                      ...tempWholesaleSettings,
                      minQuantity: Number(e.target.value)
                    })}
                    InputProps={{
                      startAdornment: <Package size={20} style={{ marginRight: '8px' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Porcentaje de Descuento"
                    value={tempWholesaleSettings.discountPercentage}
                    onChange={(e) => setTempWholesaleSettings({
                      ...tempWholesaleSettings,
                      discountPercentage: Number(e.target.value)
                    })}
                    InputProps={{
                      startAdornment: <Percent size={20} style={{ marginRight: '8px' }} />,
                      endAdornment: <Typography>%</Typography>
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWholesaleDialog(false)}>Cancelar</Button>
          <Button onClick={handleWholesaleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Settings;