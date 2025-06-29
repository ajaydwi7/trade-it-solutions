import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAdmin, loginAdmin } from "../../services/adminApi";
import { toast } from "react-toastify";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Eye, EyeOff } from "lucide-react";

const AdminAuthStep = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) =>
    setFormData({ ...formData, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await registerAdmin(formData);
        toast.success("Admin registered! Please log in.");
        setIsSignUp(false);
      } else {
        const result = await loginAdmin(formData);
        login(result.user, result.token);
        toast.success("Admin logged in!");
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 hidden md:block">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WEB%20BACKGROUND.png-OZ4OMdtxyVzgNZTsKH6DnBI8zA47Ol.jpeg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 md:hidden">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MOBILE%20BACKGROUND.jpg-PHaF8vfpeVmOjN6jtm4jvvI91pnyCR.jpeg"
          alt="Mobile Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main form card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg bg-black/20 backdrop-blur-2xl border border-indigo-500/50 rounded-3xl p-10 shadow-2xl">
          <h2 className="text-4xl text-white font-semibold mb-6">
            {isSignUp ? "Admin Registration" : "Admin Login"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="input-auth"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="input-auth"
                  required
                />
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="input-auth"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="input-auth pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xl py-4 rounded-lg transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {loading
                ? "Processing..."
                : isSignUp
                  ? "Register"
                  : "Login"}
            </button>

            <div className="text-center text-white text-base">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-indigo-400 underline"
                    onClick={() => setIsSignUp(false)}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Need an admin account?{" "}
                  <button
                    type="button"
                    className="text-indigo-400 underline"
                    onClick={() => setIsSignUp(true)}
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Custom input style */}
      <style>{`
        .input-auth {
          background-color: rgba(0, 0, 0, 0.3);
          border: 2px solid transparent;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 500;
          color: white;
          padding: 1rem;
          width: 100%;
          outline: none;
          background-clip: padding-box;
          border-image: linear-gradient(to right, rgba(85, 88, 185, 0.5), rgba(248, 221, 255, 0.5)) 1;
        }

        .input-auth::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .input-auth:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px rgba(85, 88, 185, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AdminAuthStep;
