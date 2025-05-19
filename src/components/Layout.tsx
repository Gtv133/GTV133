import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Truck, 
  Users,
  LogOut,
  User
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import Notifications from './Notifications';

const drawerWidth = 240;

const menuItems = [
  { text: 'Panel de Control', icon: <LayoutDashboard />, path: '/' },
  { text: 'Productos', icon: <Package />, path: '/products' },
  { text: 'Ventas', icon: <ShoppingCart />, path: '/sales' },
  { text: 'Clientes', icon: <Users />, path: '/customers' },
  { text: 'Reportes', icon: <FileText />, path: '/reports' },
  { text: 'Compras', icon: <Truck />, path: '/purchases' },
  { text: 'Configuración', icon: <Settings />, path: '/settings' },
];

function Layout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { darkMode } = useThemeStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <Box sx={{ 
      display: 'flex',
      bgcolor: darkMode ? 'grey.900' : 'background.default',
      minHeight: '100vh'
    }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: darkMode ? 'grey.900' : 'primary.main'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            Sistema POS
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Notifications />
            <Typography variant="body1" sx={{ mx: 2 }}>
              {user?.fullName}
            </Typography>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <User />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogOut fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cerrar Sesión</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: darkMode ? 'grey.900' : 'background.paper',
            color: darkMode ? 'common.white' : 'text.primary',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  '&:hover': {
                    bgcolor: darkMode ? 'grey.800' : 'grey.100',
                  }
                }}
              >
                <ListItemIcon sx={{ color: darkMode ? 'common.white' : 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;