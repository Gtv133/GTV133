import Papa from 'papaparse';

export const productTemplate = {
  barcode: '',
  internalCode: '',
  name: '',
  description: '',
  category: '',
  unit: '',
  purchasePrice: 0,
  sellingPrice: 0,
  currentStock: 0,
  minStock: 0
};

export function downloadProductTemplate() {
  const csv = Papa.unparse([productTemplate]);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'plantilla_productos.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}