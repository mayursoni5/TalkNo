import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8)
      errors.push("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(password))
      errors.push("Password must contain at least one uppercase letter.");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
      errors.push("Password must contain at least one special character.");
    return errors;
  };

  const validateLogin = () => {
    if (!email) {
      toast.error("Email is required.");
      emailRef.current?.focus();
      return false;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      emailRef.current?.focus();
      return false;
    }
    if (!password) {
      toast.error("Password is required.");
      passwordRef.current?.focus();
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!email) {
      toast.error("Email is required.");
      emailRef.current?.focus();
      return false;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      emailRef.current?.focus();
      return false;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      toast.error(passwordErrors[0]);
      passwordRef.current?.focus();
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      confirmPasswordRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      const res = await apiClient.post(
        LOGIN_ROUTE,
        { email, password },
        { withCredentials: true }
      );
      if (res.data.user.id) {
        setUserInfo(res.data.user);
        navigate(res.data.user.profileSetup ? "/chat" : "/profile");
      }
    }
  };

  const handleSignup = async () => {
    if (validateSignup()) {
      try {
        const res = await apiClient.post(
          SIGNUP_ROUTE,
          { email, password },
          { withCredentials: true }
        );

        if (res.status === 201) {
          setUserInfo(res.data.user);
          toast.success("Signup successful! 🎉");
          navigate("/profile");
        }
      } catch (error) {
        if (error.response?.status === 409) {
          toast.error("User with this email already exists.");
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
      }
    }
  };

  const handleKeyPress = (e, nextRef, submitHandler) => {
    if (e.key === "Enter") {
      if (nextRef) nextRef.current?.focus();
      else if (submitHandler) submitHandler();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-4">
      <Logo />
      <div className="w-full max-w-2xl bg-black/30 border border-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 mt-6 text-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Welcome ✌</h1>
          <p className="text-white/70 mt-2">
            Fill in the details to get started with the best{" "}
            <strong>TalkNO</strong>!
          </p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="bg-black/30 backdrop-blur-sm rounded-full mb-6 flex justify-between w-full">
            <TabsTrigger
              value="login"
              className="w-full py-2 rounded-full data-[state=active]:bg-purple-700 data-[state=active]:text-white text-white/70"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="w-full py-2 rounded-full data-[state=active]:bg-purple-700 data-[state=active]:text-white text-white/70"
            >
              Signup
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="flex flex-col gap-5">
            <Input
              ref={emailRef}
              placeholder="Email"
              type="email"
              className="rounded-full px-6 py-4 bg-white/10 text-white placeholder-white/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, passwordRef)}
            />
            <div className="relative">
              <Input
                ref={passwordRef}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                className="rounded-full px-6 py-4 bg-white/10 text-white placeholder-white/40 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, null, handleLogin)}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
            <Button
              onClick={handleLogin}
              className="rounded-full p-4 bg-purple-700 hover:bg-purple-800 transition"
            >
              Login
            </Button>
          </TabsContent>
          <TabsContent value="signup" className="flex flex-col gap-5">
            <Input
              ref={emailRef}
              placeholder="Email"
              type="email"
              className="rounded-full px-6 py-4 bg-white/10 text-white placeholder-white/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, passwordRef)}
            />
            <div className="relative">
              <Input
                ref={passwordRef}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                className="rounded-full px-6 py-4 bg-white/10 text-white placeholder-white/40 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, confirmPasswordRef)}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
            <Input
              ref={confirmPasswordRef}
              placeholder="Confirm Password"
              type={showPassword ? "text" : "password"}
              className="rounded-full px-6 py-4 bg-white/10 text-white placeholder-white/40"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, null, handleSignup)}
            />
            <Button
              onClick={handleSignup}
              className="rounded-full p-4 bg-purple-700 hover:bg-purple-800 transition"
            >
              Signup
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const Logo = () => (
  <div className="flex justify-center items-center gap-3 text-white text-3xl font-bold">
    <svg
      id="logo-38"
      width="48"
      height="24"
      viewBox="0 0 78 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z" fill="#a855f7" />
      <path d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z" fill="#9333ea" />
      <path d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z" fill="#7e22ce" />
    </svg>
    <span>TalkNO</span>
  </div>
);
