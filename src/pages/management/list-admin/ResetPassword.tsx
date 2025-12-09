// components/ResetPasswordForm.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ResetPasswordBody } from 'hooks/useHandleUser';

interface ResetPasswordFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ResetPasswordBody) => Promise<void>;
  username: string;
  email: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ open, onClose, onSubmit, username, email }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    onSubmit({ username, email, newPassword }).then(() => {
      onClose();
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <FormattedMessage id="reset-password" />
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Reset password for <strong>{username}</strong> ({email})
        </Typography>
        <TextField
          label={<FormattedMessage id="new-password" />}
          type="password"
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          label={<FormattedMessage id="confirm-password" />}
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          required
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          <FormattedMessage id="cancel" />
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          <FormattedMessage id="submit" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordForm;
