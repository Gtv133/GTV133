import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Divider
} from '@mui/material';
import { Bell, Package, AlertTriangle } from 'lucide-react';
import { useProductStore } from '../stores/productStore';
import { useSettingStore } from '../stores/settingStore';
import { useNavigate } from 'react-router-dom';

function Notifications() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { getLowStockProducts } = useProductStore();
  const { notificationSettings } = useSettingStore();
  const navigate = useNavigate();

  const lowStockProducts = getLowStockProducts();
  const hasNotifications = notificationSettings.enablePush && lowStockProducts.length > 0;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLowStockClick = () => {
    handleClose();
    navigate('/low-stock');
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
      >
        <Badge badgeContent={hasNotifications ? lowStockProducts.length : 0} color="error">
          <Bell />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <MenuItem sx={{ justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">Notificaciones</Typography>
          {hasNotifications && (
            <Typography variant="caption" color="error">
              {lowStockProducts.length} nuevas
            </Typography>
          )}
        </MenuItem>
        <Divider />
        {hasNotifications ? (
          <>
            <MenuItem onClick={handleLowStockClick}>
              <ListItemIcon>
                <Package color="#f44336" size={20} />
              </ListItemIcon>
              <ListItemText
                primary={`${lowStockProducts.length} productos con stock bajo`}
                secondary="Click para ver detalles"
              />
            </MenuItem>
          </>
        ) : (
          <MenuItem>
            <ListItemIcon>
              <AlertTriangle size={20} />
            </ListItemIcon>
            <ListItemText primary="No hay notificaciones" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default Notifications;