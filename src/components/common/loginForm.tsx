import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { authService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await authService.login({ email, password });
      onSuccess();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed');
    }
  };

  return (
    <div>
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleSubmit}>Login</Button>
    </div>
  );
};