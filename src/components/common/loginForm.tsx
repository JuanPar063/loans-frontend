import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { authService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await authService.login({ username, password });
      onSuccess();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed');
    }
  };

  return (
    <div>
      <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleSubmit}>Login</Button>
    </div>
  );
};