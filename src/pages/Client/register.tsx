import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { authService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const [data, setData] = useState({ name: '', email: '', password: '', role: 'client' });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    await authService.register(data);
    navigate('/login');
  };

  return (
    <div>
      <TextField label="Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
      {/* Otros fields */}
      <Button onClick={handleSubmit}>Register</Button>
    </div>
  );
};