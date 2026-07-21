import { motion } from "framer-motion";
import "./AuthLayout.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">

      <motion.div
        className="auth-left"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="overlay">
          <h1>Beebo Beauty Center</h1>

          <p>
            Beauty Management System
          </p>

          <div className="circle one"></div>
          <div className="circle two"></div>
          <div className="circle three"></div>
        </div>
      </motion.div>

      <motion.div
        className="auth-right"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >

        <div className="auth-card">

          <h2>{title}</h2>

          <p>{subtitle}</p>

          {children}

        </div>

      </motion.div>

    </div>
  );
}

export default AuthLayout;