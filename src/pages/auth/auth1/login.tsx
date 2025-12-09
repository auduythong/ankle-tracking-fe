// material-ui

// project-imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';

// assets

// ================================|| LOGIN ||================================ //

const Login = () => {
  return (
    <AuthWrapper>
      <AuthLogin forgot="/auth/forgot-password" />
    </AuthWrapper>
  );
};

export default Login;
