import { Box, FormHelperText, Link, Stack, TextField, Typography } from '@mui/material';
import LoadingButton from 'components/@extended/LoadingButton';
import { Formik } from 'formik';
import useAuth from 'hooks/useAuth';
import useMapCode from 'hooks/useMapCode';
import useScriptRef from 'hooks/useScriptRef';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { dispatch } from 'store';
import { handlerIconVariants, openSnackbar } from 'store/reducers/snackbar';
import * as Yup from 'yup';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Eye, EyeSlash } from 'iconsax-react';

const AuthLogin = ({ forgot }: { forgot?: string }) => {
  const intl = useIntl();
  const { isLoggedIn, login } = useAuth();
  const scriptedRef = useScriptRef();
  const { getStatusMessage } = useMapCode();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            // color: '#1e293b',
            mb: 1,
            fontSize: { xs: 24, sm: 28 },
            letterSpacing: 0.5
          }}
        >
          <FormattedMessage id="login" defaultMessage="Login" />
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 400,
            fontSize: { xs: 13, sm: 14 }
          }}
        >
          {intl.formatMessage({
            id: 'system-title',
            defaultMessage: 'Hệ thống quản lý Ankle Tracker'
          })}
        </Typography>
      </Box>

      {/* Form */}
      <Formik
        initialValues={{ username: '', password: '', submit: null }}
        validationSchema={Yup.object().shape({
          username: Yup.string()
            .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
            .max(255)
            .required(intl.formatMessage({ id: 'username-required' })),
          password: Yup.string()
            .max(255)
            .required(intl.formatMessage({ id: 'password-required' }))
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const res: any = await login(values.username, values.password);
            if (scriptedRef.current) {
              if (res.code === 0) {
                setStatus({ success: true });
                setSubmitting(false);
                dispatch(
                  openSnackbar({
                    open: true,
                    message: getStatusMessage('login', res.code),
                    variant: 'alert',
                    alert: { color: 'success' },
                    close: false
                  })
                );
              } else {
                setStatus({ success: true });
                setSubmitting(false);
                dispatch(handlerIconVariants({ iconVariant: 'useemojis' }));
                enqueueSnackbar(getStatusMessage('login', res.code), {
                  variant: 'error'
                });
              }
            }
          } catch {
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({
                submit: intl.formatMessage({
                  id: 'verify-your-username-and-password'
                })
              });
              setSubmitting(false);
              dispatch(handlerIconVariants({ iconVariant: 'useemojis' }));
              enqueueSnackbar(intl.formatMessage({ id: 'login-failed' }), { variant: 'error' });
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Stack spacing={3}>
              {/* Username */}
              <div>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.75,
                    ml: 0.5,
                    fontWeight: 500,
                    fontSize: 14
                  }}
                >
                  {intl.formatMessage({ id: 'username' })}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  // label={intl.formatMessage({ id: 'username' })}
                  name="username"
                  placeholder={intl.formatMessage({ id: 'enter-username' })}
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.username && errors.username)}
                  helperText={touched.username && errors.username}
                  InputProps={{
                    sx: { borderRadius: 3 }
                  }}
                />
              </div>
              {/* Password */}
              <div>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.75,
                    ml: 0.5,
                    fontWeight: 500,
                    fontSize: 14
                  }}
                >
                  {intl.formatMessage({ id: 'password' })}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={intl.formatMessage({ id: 'enter-password' })}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.password && errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <EyeSlash /> : <Eye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 }
                  }}
                />
              </div>
              {/* Error text */}
              {errors.submit && (
                <FormHelperText
                  error
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#dc2626'
                  }}
                >
                  {errors.submit}
                </FormHelperText>
              )}
              {/* Forgot password */}
              <Box sx={{ textAlign: 'end' }}>
                <Link
                  variant="body2"
                  component={RouterLink}
                  to={isLoggedIn && forgot ? forgot : '/forgot-password'}
                  sx={{
                    fontSize: 14,
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  <FormattedMessage id="forgot-password" />?
                </Link>
              </Box>
              {/* Login button */}
              <LoadingButton
                loading={isSubmitting}
                fullWidth
                disableElevation
                disabled={isSubmitting}
                type="submit"
                size="large"
                variant="contained"
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 15
                }}
              >
                <FormattedMessage id="login" defaultMessage="Sign In" />
              </LoadingButton>
            </Stack>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AuthLogin;
