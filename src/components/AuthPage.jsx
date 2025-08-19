import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignUpEmailPassword, useSignInEmailPassword, useAuthenticationStatus } from '@nhost/react';
import { Box, Title, Paper, TextInput, PasswordInput, Button, Text, Anchor, Stack, Alert, Loader, Center } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const navigate = useNavigate();
  const { signUpEmailPassword, isLoading: isSigningUp, isError: isSignUpError, error: signUpError } = useSignUpEmailPassword();
  const { signInEmailPassword, isLoading: isSigningIn, isError: isSignInError, error: signInError } = useSignInEmailPassword();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthenticationStatus();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setShowVerificationMessage(false); // Reset message
    
    if (isRegister) {
      try {
        const result = await signUpEmailPassword(email, password);
        console.log('Sign up result:', result); // Debug log
        
        // Check if sign up was successful (no error occurred)
        if (!isSignUpError && result) {
          setShowVerificationMessage(true);
          // Clear form after successful signup
          setEmail('');
          setPassword('');
        }
      } catch (err) {
        console.error('Sign up error:', err);
      }
    } else {
      try {
        const result = await signInEmailPassword(email, password);
        console.log('Sign in result:', result); // Debug log
        
        if (result?.session) {
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Sign in error:', err);
      }
    }
  };

  // Reset verification message when switching between sign in/up
  useEffect(() => {
    setShowVerificationMessage(false);
  }, [isRegister]);

  const isLoading = isSigningUp || isSigningIn;
  const isError = isSignUpError || isSignInError;
  const error = signUpError || signInError;

  if (isAuthLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
      }}
    >
      <Paper
        withBorder
        shadow="md"
        radius="md"
        p="lg"
        style={{ width: 400, borderRadius: '1rem' }}
      >
        <Title ta="center" order={2} mb="lg">
          {isRegister ? 'Create an Account' : 'Welcome !!'}
        </Title>

        {showVerificationMessage ? (
          // Verification message screen
          <Stack align="center" gap="lg">
            <Alert
              icon={<IconCheck size="1rem" />}
              title="Account Created Successfully!"
              color="green"
              radius="md"
            >
              Verification link sent to your email. Please check your inbox or spam folder.
            </Alert>
            <Text size="sm" ta="center" c="dimmed">
              Click the verification link in your email to activate your account, then return here to sign in.
            </Text>
            <Button
              variant="light"
              onClick={() => {
                setShowVerificationMessage(false);
                setIsRegister(false); // Switch to sign in mode
              }}
            >
              Back to Sign In
            </Button>
          </Stack>
        ) : (
          // Regular auth form
          <>
            <form onSubmit={handleAuth}>
              <Stack gap="sm">
                <TextInput
                  required
                  label="Email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  type="email"
                />
                <PasswordInput
                  required
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
                {isError && (
                  <Alert
                    icon={<IconAlertCircle size="1rem" />}
                    title="Incorrect Credentials!"
                    color="red"
                    radius="md"
                  >
                    {error?.message}
                  </Alert>
                )}
                <Button
                  type="submit"
                  fullWidth
                  mt="md"
                  loading={isLoading}
                  radius="md"
                  size="md"
                >
                  {isRegister ? 'Sign Up' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            <Text c="dimmed" size="sm" ta="center" mt="lg">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Anchor
                size="sm"
                component="button"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </Anchor>
            </Text>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AuthPage;
