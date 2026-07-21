import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import "./LoginForm.css";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/login`,
        formData
      );

      console.log("===== LOGIN RESPONSE =====");
      console.log(data);

      if (data.success) {
        login(data.user, data.token, formData.remember);

        toast.success("Login Successful");

        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login Failed");
      }
    } catch (err) {
      console.log("===== LOGIN ERROR =====");
      console.error(err);
      console.log(err.response);
      console.log(err.response?.data);

      toast.error(
        err.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      <div className="input-group">
        <label>Email</label>

        <input
          type="email"
          placeholder="Enter your email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Please enter a valid email",
            },
          })}
        />

        {errors.email && (
          <small>{errors.email.message}</small>
        )}
      </div>

      <div className="input-group">
        <label>Password</label>

        <div className="password-box">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 5,
                message: "Password must be at least 5 characters",
              },
            })}
          />

          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {errors.password && (
          <small>{errors.password.message}</small>
        )}
      </div>

      <div className="login-options">
        <label>
          <input type="checkbox" {...register("remember")} />
          Remember me
        </label>
      </div>

      <button
        type="submit"
        className="login-btn"
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>

    </form>
  );
}

export default LoginForm;