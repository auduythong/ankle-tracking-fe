import { useEffect, useState, SyntheticEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

// third-party
import * as Yup from 'yup';
import { Formik, FormikValues } from 'formik';
import { enqueueSnackbar } from 'notistack';

//utils
import { isNumber, isLowercaseChar, isUppercaseChar, isSpecialChar, minLength } from 'utils/password-validation';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// project-imports
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

//redux
import { dispatch } from 'store';
import { openSnackbar, handlerIconVariants } from 'store/reducers/snackbar';

// types
import { StringColorProps } from 'types/password';

// assets
import { Eye, EyeSlash } from 'iconsax-react';
import { FormattedMessage, useIntl } from 'react-intl';

//Hook
import useMapCode from 'hooks/useMapCode';
import { useSelector } from 'store';

// ============================|| JWT - REGISTER ||============================ //

const AuthRegister = () => {
  const { register } = useAuth();
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const userSocial = useSelector((state) => state.authSlice.userSocial);
  const intl = useIntl();
  const { getStatusMessage } = useMapCode();

  const [level, setLevel] = useState<StringColorProps>();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const changePassword = (value: string) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  const getInitialValues = (user: FormikValues | null) => {
    const newUser = {
      firstname: '',
      lastname: '',
      email: '',
      phonenumber: '',
      username: '',
      password: '',
      submit: null,
      user_group: [1]
    };

    if (user) {
      newUser.firstname = user.given_name || user.first_name;
      newUser.lastname = user.family_name || user.last_name;
      newUser.email = user.email;
      newUser.phonenumber = '';
      newUser.username = '';
      newUser.submit = null;
      newUser.password = '';
      newUser.user_group = [1];

      return newUser;
    }

    return newUser;
  };

  useEffect(() => {
    changePassword('');
  }, []);

  return (
    <>
      <Formik
        initialValues={getInitialValues(userSocial)}
        validationSchema={Yup.object().shape({
          firstname: Yup.string()
            .max(255)
            .required(intl.formatMessage({ id: 'first-name-required' })),
          lastname: Yup.string()
            .max(255)
            .required(intl.formatMessage({ id: 'last-name-required' })),
          username: Yup.string()
            .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
            .max(255)
            .required(intl.formatMessage({ id: 'user-name-required' })),
          phonenumber: Yup.string()
            .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
            .matches(/^\d+$/, intl.formatMessage({ id: 'numbers-only-allowed' }))
            .required(intl.formatMessage({ id: 'phone-number-required' }))
            .length(10, intl.formatMessage({ id: 'phone-number-max-10' })),
          email: Yup.string()
            .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
            .email(intl.formatMessage({ id: 'email-in-valid' }))
            .max(255)
            .required(intl.formatMessage({ id: 'email-address-required' })),
          password: Yup.string()
            .required(intl.formatMessage({ id: 'password-required' }))
            .test('is-long-enough', intl.formatMessage({ id: 'at-least-8-characters' }), (value) => minLength(value))
            .test('has-number', intl.formatMessage({ id: 'at-least-1-number' }), (value) => isNumber(value))
            .test('has-lowercase', intl.formatMessage({ id: 'at-least-1-lower-letter' }), (value) => isLowercaseChar(value))
            .test('has-uppercase', intl.formatMessage({ id: 'at-least-1-uppercase-letter' }), (value) => isUppercaseChar(value))
            .test('has-special-char', intl.formatMessage({ id: 'at-least-1-special-characters' }), (value) => isSpecialChar(value))
            .matches(
              /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
              intl.formatMessage({ id: 'password-must-contain-at-least-8-characters-uppercase-number-special' })
            )
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const res: any = await register(
              values.phonenumber,
              values.username,
              values.email,
              values.password,
              values.firstname,
              values.lastname,
              true
            );
            if (scriptedRef.current) {
              if (res.code === 0) {
                setStatus({ success: true });
                setSubmitting(false);
                dispatch(
                  openSnackbar({
                    open: true,
                    message: intl.formatMessage({ id: 'registration-successfully' }),
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    },
                    close: false
                  })
                );

                setTimeout(() => {
                  navigate('/login', { replace: true });
                }, 1000);
              } else {
                setStatus({ success: true });
                setSubmitting(false);
                dispatch(
                  handlerIconVariants({
                    iconVariant: 'useemojis'
                  })
                );
                enqueueSnackbar(getStatusMessage('registration', res.code), {
                  variant: 'error'
                });
              }
            }
          } catch (err: any) {
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }

            dispatch(
              handlerIconVariants({
                iconVariant: 'useemojis'
              })
            );
            enqueueSnackbar(intl.formatMessage({ id: 'registration-failed' }), {
              variant: 'error'
            });
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="firstname-signup">
                    <FormattedMessage id="first-name" />*
                  </InputLabel>
                  <OutlinedInput
                    id="firstname-login"
                    type="firstname"
                    value={values.firstname}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="John"
                    fullWidth
                    error={Boolean(touched.firstname && errors.firstname)}
                  />
                  {touched.firstname && errors.firstname && (
                    <FormHelperText error id="helper-text-firstname-signup">
                      {errors.firstname}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="lastname-signup">
                    <FormattedMessage id="last-name" />*
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.lastname && errors.lastname)}
                    id="lastname-signup"
                    type="lastname"
                    value={values.lastname}
                    name="lastname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Doe"
                    inputProps={{}}
                  />
                  {touched.lastname && errors.lastname && (
                    <FormHelperText error id="helper-text-lastname-signup">
                      {errors.lastname}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="phonenumber-signup">
                    <FormattedMessage id="phone-number" />*
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.phonenumber && errors.phonenumber)}
                    id="phonenumber-login"
                    type="phonenumber"
                    value={values.phonenumber}
                    name="phonenumber"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="0123456789"
                    inputProps={{}}
                  />
                  {touched.phonenumber && errors.phonenumber && (
                    <FormHelperText error id="helper-text-phonenumber-signup">
                      {errors.phonenumber}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup">
                    <FormattedMessage id="email-address" />*
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="demo@company.com"
                    inputProps={{}}
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error id="helper-text-email-signup">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="username-signup">
                    <FormattedMessage id="username" />*
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.username && errors.username)}
                    id="username-signup"
                    value={values.username}
                    name="username"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Demo Inc."
                    inputProps={{}}
                  />
                  {touched.username && errors.username && (
                    <FormHelperText error id="helper-text-username-signup">
                      {errors.username}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-signup">
                    <FormattedMessage id="password" />*
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={!showPassword ? 'password' : 'text'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {!showPassword ? <EyeSlash /> : <Eye />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="******"
                    inputProps={{}}
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error id="helper-text-password-signup">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1" fontSize="0.75rem">
                        <FormattedMessage id={level?.label || 'Poor'} />
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <FormattedMessage id="by-signing-up-you-agree-to-our" /> &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    <FormattedMessage id="terms-of-service" />
                  </Link>
                  &nbsp; <FormattedMessage id="and" /> &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    <FormattedMessage id="private-policy" />
                  </Link>
                </Typography>
              </Grid>
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    <FormattedMessage id="create-account" />
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthRegister;
