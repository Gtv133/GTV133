import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Product } from '../stores/productStore';

interface ImportedProduct {
  barcode: string;
  internalCode: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
}

export async function importProductsFromFile(file: File): Promise<ImportedProduct[]> {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const products = results.data.map(normalizeProduct);
          resolve(products.filter(isValidProduct));
        },
        error: (error) => {
          reject(new Error(`Error parsing CSV: ${error}`));
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          const products = jsonData.map(normalizeProduct);
          resolve(products.filter(isValidProduct));
        } catch (error) {
          reject(new Error(`Error parsing Excel file: ${error}`));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsBinaryString(file);
    } else {
      reject(new Error('Unsupported file format'));
    }
  });
}

function normalizeProduct(row: any): ImportedProduct {
  return {
    barcode: String(row.barcode || ''),
    internalCode: String(row.internalCode || row.internal_code || ''),
    name: String(row.name || ''),
    description: String(row.description || ''),
    category: String(row.category || ''),
    unit: String(row.unit || 'Unidad'),
    purchasePrice: Number(row.purchasePrice || row.purchase_price || 0),
    sellingPrice: Number(row.sellingPrice || row.selling_price || 0),
    currentStock: Number(row.currentStock || row.current_stock || 0),
    minStock: Number(row.minStock || row.min_stock || 0)
  };
}

function isValidProduct(product: ImportedProduct): boolean {
  return (
    product.name.length > 0 &&
    product.purchasePrice >= 0 &&
    product.sellingPrice >= 0 &&
    product.currentStock >= 0 &&
    product.minStock >= 0
  );
}