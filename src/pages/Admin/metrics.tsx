import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableRow, TableCell } from '@mui/material';
import { adminService } from '../../services/admin.service';

export const Metrics: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [userId, setUser Id] = useState('');

  useEffect(() => {
    if (userId) {
      adminService.getMetrics(userId).then((res) => setMetrics(res.data));
    }
  }, [userId]);

  return (
    <div>
      <TextField label="User  ID" value={userId} onChange={(e) => setUser Id(e.target.value)} />
      {metrics && (
        <Table>
          <TableBody>
            <TableRow><TableCell>Credit Score</TableCell><TableCell>{metrics.creditScore}</TableCell></TableRow>
            {/* Otras rows */}
          </TableBody>
        </Table>
      )}
    </div>
  );
};