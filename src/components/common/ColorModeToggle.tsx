import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../../theme/ColorModeContext';

/** Botón para alternar entre modo claro y oscuro. */
const ColorModeToggle: React.FC<{ color?: string }> = ({ color }) => {
  const { mode, toggle } = useColorMode();
  return (
    <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
      <IconButton onClick={toggle} sx={{ color: color || 'inherit' }} aria-label="cambiar tema">
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ColorModeToggle;
