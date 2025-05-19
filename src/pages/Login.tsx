import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useAuthStore } from '../stores/authStore';
import { Store } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading } = useAuthStore();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Credenciales inválidas. Por favor, intente de nuevo.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            py: 3,
            px: 4,
            textAlign: 'center',
            borderTopLeftRadius: 1,
            borderTopRightRadius: 1
          }}
        >
          <Store size={40} />
          <Typography variant="h5" component="h1" sx={{ mt: 2 }}>
            Sistema POS
          </Typography>
        </Paper>
        
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Correo electrónico"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Credenciales de prueba:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admin: admin@pos.com / admin123
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cajero: cajero@pos.com / cajero123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;