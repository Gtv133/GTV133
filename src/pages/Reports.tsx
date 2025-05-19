import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import { BarChart, PieChart, TrendingUp, DollarSign, Printer, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useSaleStore } from '../stores/saleStore';
import { useProductStore } from '../stores/productStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateReceipt } from '../utils/receipt';
import { useSettingStore } from '../stores/settingStore';

interface TicketPrintHistory {
  saleId: string;
  printedAt: string;
  success: boolean;
  error?: string;
}

function Reports() {
  const { sales, getDailySales, getWeeklySales, getMonthlySales } = useSaleStore();
  const { products } = useProductStore();
  const { businessInfo, receiptSettings } = useSettingStore();
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTicketDialog, setOpenTicketDialog] = useState(false);
  const [printHistory, setPrintHistory] = useState<TicketPrintHistory[]>([]);

  const dailySales = getDailySales();
  const weeklySales = getWeeklySales();
  const monthlySales = getMonthlySales();

  // Calculate total products sold
  const totalProductsSold = sales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  // Calculate growth percentage
  const previousMonthSales = sales
    .filter(sale => {
      const date = new Date(sale.createdAt);
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      return date >= previousMonth && date < new Date();
    })
    .reduce((sum, sale) => sum + sale.total, 0);

  const growth = previousMonthSales ? ((monthlySales - previousMonthSales) / previousMonthSales) * 100 : 0;

  const reportCards = [
    { 
      title: 'Ventas del Día', 
      icon: <BarChart />, 
      value: `$${dailySales.toFixed(2)}`,
      color: '#2196f3'
    },
    { 
      title: 'Productos Vendidos', 
      icon: <PieChart />, 
      value: `${totalProductsSold} unidades`,
      color: '#4caf50'
    },
    { 
      title: 'Crecimiento', 
      icon: <TrendingUp />, 
      value: `${growth.toFixed(1)}%`,
      color: growth >= 0 ? '#4caf50' : '#f44336'
    },
    { 
      title: 'Ingresos Totales', 
      icon: <DollarSign />, 
      value: `$${monthlySales.toFixed(2)}`,
      color: '#ff9800'
    },
  ];

  const handleReprintTicket = async (sale: any) => {
    try {
      await generateReceipt(sale, businessInfo, receiptSettings);
      
      // Record successful print
      setPrintHistory(prev => [...prev, {
        saleId: sale.id,
        printedAt: new Date().toISOString(),
        success: true
      }]);
      
    } catch (error) {
      // Record failed print
      setPrintHistory(prev => [...prev, {
        saleId: sale.id,
        printedAt: new Date().toISOString(),
        success: false,
        error: error.message
      }]);
      
      console.error('Error reprinting ticket:', error);
    }
  };

  const handleViewTicket = (sale: any) => {
    setSelectedSale(sale);
    setOpenTicketDialog(true);
  };

  const getLastPrintStatus = (saleId: string) => {
    const prints = printHistory.filter(p => p.saleId === saleId);
    return prints.length > 0 ? prints[prints.length - 1] : null;
  };

  const formatTicketContent = (sale: any) => {
    let content = '';
    
    // Business info
    if (receiptSettings.printHeader) {
      content += `${businessInfo.name}\n`;
      if (businessInfo.address) content += `${businessInfo.address}\n`;
      if (businessInfo.phone) content += `Tel: ${businessInfo.phone}\n`;
      if (businessInfo.taxId) content += `RFC: ${businessInfo.taxId}\n`;
      content += '\n';
    }

    // Sale info
    content += `Fecha: ${format(new Date(sale.createdAt), 'PPpp', { locale: es })}\n`;
    content += `Ticket #: ${sale.id}\n\n`;

    // Items
    content += 'Producto          Cant    Precio   Total\n';
    content += '----------------------------------------\n';

    for (const item of sale.items) {
      const name = item.product.name.padEnd(16).slice(0, 16);
      const quantity = item.quantity.toString().padStart(4);
      const price = item.price.toFixed(2).padStart(8);
      const total = item.total.toFixed(2).padStart(8);
      content += `${name} ${quantity} ${price} ${total}\n`;
    }

    content += '----------------------------------------\n';

    // Totals
    content += `Subtotal: ${sale.subtotal.toFixed(2).padStart(21)}\n`;
    if (receiptSettings.enableTax) {
      content += `IVA:      ${sale.tax.toFixed(2).padStart(21)}\n`;
    }
    content += `Total:    ${sale.total.toFixed(2).padStart(21)}\n\n`;

    // Payment method
    content += `Método de pago: ${sale.paymentMethod}\n\n`;

    // Footer
    if (receiptSettings.printFooter && receiptSettings.footerMessage) {
      content += `${receiptSettings.footerMessage}\n`;
    }

    return content;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reportes
      </Typography>
      
      <Grid container spacing={3}>
        {reportCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <Box sx={{ 
                  color: card.color,
                  mb: 2,
                  '& > svg': { width: 40, height: 40 }
                }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" component="div" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h4" sx={{ color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Printer size={24} />
            Historial de Tickets
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Ticket #</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Método de Pago</TableCell>
                  <TableCell>Estado de Impresión</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale) => {
                  const printStatus = getLastPrintStatus(sale.id);
                  
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {format(new Date(sale.createdAt), 'PPpp', { locale: es })}
                      </TableCell>
                      <TableCell>{sale.id}</TableCell>
                      <TableCell>${sale.total.toFixed(2)}</TableCell>
                      <TableCell>{sale.paymentMethod}</TableCell>
                      <TableCell>
                        {printStatus ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {printStatus.success ? (
                              <Tooltip title="Impreso correctamente">
                                <CheckCircle size={18} color="#4caf50" />
                              </Tooltip>
                            ) : (
                              <Tooltip title={`Error: ${printStatus.error}`}>
                                <AlertCircle size={18} color="#f44336" />
                              </Tooltip>
                            )}
                            <Typography variant="caption">
                              {format(new Date(printStatus.printedAt), 'HH:mm:ss')}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No impreso
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewTicket(sale)}
                        >
                          <Eye size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleReprintTicket(sale)}
                        >
                          <Printer size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No hay tickets registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Ticket Preview Dialog */}
      <Dialog 
        open={openTicketDialog} 
        onClose={() => setOpenTicketDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Vista Previa del Ticket</DialogTitle>
        <DialogContent>
          <Box 
            sx={{ 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {selectedSale && formatTicketContent(selectedSale)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTicketDialog(false)}>Cerrar</Button>
          <Button 
            variant="contained"
            onClick={() => {
              handleReprintTicket(selectedSale);
              setOpenTicketDialog(false);
            }}
          >
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Reports;