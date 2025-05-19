import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { printerPlugin } from '../utils/printerPlugin';

interface PrinterSelectorProps {
  value: string;
  onChange: (printer: string) => void;
}

export default function PrinterSelector({ value, onChange }: PrinterSelectorProps) {
  const printers = printerPlugin.getPrinters();

  const handleChange = (event: SelectChangeEvent) => {
    const printerName = event.target.value;
    printerPlugin.setSelectedPrinter(printerName);
    onChange(printerName);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Impresora</InputLabel>
      <Select
        value={value}
        label="Impresora"
        onChange={handleChange}
      >
        {printers.map((printer) => (
          <MenuItem key={printer.name} value={printer.name}>
            {printer.name} {printer.type === 'pdf' ? '(PDF)' : ''}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}