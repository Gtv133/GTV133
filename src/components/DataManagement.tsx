import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
} from '@mui/material';
import { Download, Upload, Save } from 'lucide-react';

interface DataManagementProps {
  onClose: () => void;
  open: boolean;
}

export default function DataManagement({ onClose, open }: DataManagementProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedTables, setSelectedTables] = useState({
    products: true,
    customers: true,
    sales: true,
    sale_items: true,
  });

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      const tables = Object.entries(selectedTables)
        .filter(([, selected]) => selected)
        .map(([table]) => table);
      
      const response = await fetch('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables }),
      });

      if (!response.ok) throw new Error('Failed to export data');
      
      const result = await response.json();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pos-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccess('Data exported successfully');
    } catch (err) {
      setError('Error exporting data: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      setError(null);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);

      const tables = Object.entries(selectedTables)
        .filter(([, selected]) => selected)
        .map(([table]) => table);

      const response = await fetch('http://localhost:3000/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: importData, tables }),
      });

      if (!response.ok) throw new Error('Failed to import data');

      setSuccess('Data imported successfully');
    } catch (err) {
      setError('Error importing data: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/backup', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to create backup');
      
      const result = await response.json();
      setSuccess(`Backup created successfully at: ${result.path}`);
    } catch (err) {
      setError('Error creating backup: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Data Management</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Typography variant="subtitle1" gutterBottom>
          Select tables to export/import:
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <List>
            {Object.entries(selectedTables).map(([table, checked]) => (
              <ListItem key={table}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(e) => setSelectedTables({
                        ...selectedTables,
                        [table]: e.target.checked,
                      })}
                    />
                  }
                  label={table.charAt(0).toUpperCase() + table.slice(1).replace('_', ' ')}
                />
              </ListItem>
            ))}
          </List>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={loading}
          >
            Export Data
          </Button>

          <Button
            variant="contained"
            component="label"
            startIcon={<Upload />}
            disabled={loading}
          >
            Import Data
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleImport}
            />
          </Button>

          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleBackup}
            disabled={loading}
          >
            Create Backup
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <Typography variant="body2" color="text.secondary">
          * Backups are automatically saved in the application data folder
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}