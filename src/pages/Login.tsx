import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper } from '@mui/material';

const Login: React.FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Estate Planner
          </Typography>
          <Typography variant="h6" gutterBottom>
            Secure Your Legacy
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Plan for tomorrow, protect what matters today. Get started with our comprehensive estate planning tools.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => loginWithRedirect()}
            sx={{ mt: 2 }}
          >
            Sign In / Sign Up
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 