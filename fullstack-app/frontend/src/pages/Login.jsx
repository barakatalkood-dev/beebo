import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";

function Login() {
  return (
    <AuthLayout
      title="Welcome Back 👋"
      subtitle="Sign in to continue to Beebo Beauty Center"
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default Login;