// src/Pages/ForgotPassword/ForgotPassword.jsx
import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { postData } from "../../Axios/axios";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setApiError("");
    setSuccessMsg("");
  };

  const validateEmailStep = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpStep = () => {
    const newErrors = {};

    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetStep = () => {
    const newErrors = {};

    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!validateEmailStep()) return;

    setLoading(true);
    try {
      const response = await postData("/auth/forgot-password", { email });
      setSuccessMsg(response?.message || "OTP sent successfully");
      setStep(2);
    } catch (error) {
      if (error?.errors?.length) {
        const validationErrors = {};
        error.errors.forEach((item) => {
          validationErrors[item.path] = item.msg;
        });
        setErrors(validationErrors);
      } else {
        setApiError(error?.message || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!validateOtpStep()) return;

    setLoading(true);
    try {
      const response = await postData("/auth/verify-forgot-password-otp", {
        email,
        otp,
      });
      setSuccessMsg(response?.message || "OTP verified successfully");
      setStep(3);
    } catch (error) {
      if (error?.errors?.length) {
        const validationErrors = {};
        error.errors.forEach((item) => {
          validationErrors[item.path] = item.msg;
        });
        setErrors(validationErrors);
      } else {
        setApiError(error?.message || "Invalid OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!validateResetStep()) return;

    setLoading(true);
    try {
      const response = await postData("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      setSuccessMsg(response?.message || "Password reset successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      if (error?.errors?.length) {
        const validationErrors = {};
        error.errors.forEach((item) => {
          validationErrors[item.path] = item.msg;
        });
        setErrors(validationErrors);
      } else {
        setApiError(error?.message || "Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <Box component="form" onSubmit={handleSendOtp}>
      <Grid container spacing={2}>
        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
              resetMessages();
            }}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>

        <Grid size={{xs:12}}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.4, textTransform: "none", borderRadius: 2 }}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </Grid>

        <Grid size={{xs:12}}>
          <Button
            fullWidth
            component={Link}
            to="/login"
            variant="outlined"
            sx={{ py: 1.4, textTransform: "none", borderRadius: 2 }}
          >
            Back to Login
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStepTwo = () => (
    <Box component="form" onSubmit={handleVerifyOtp}>
      <Grid container spacing={2}>
        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            label="Email Address"
            value={email}
            disabled
          />
        </Grid>

        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            label="Enter OTP"
            name="otp"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setErrors((prev) => ({ ...prev, otp: "" }));
              resetMessages();
            }}
            error={!!errors.otp}
            helperText={errors.otp}
          />
        </Grid>

        <Grid size={{xs:12}}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.4, textTransform: "none", borderRadius: 2 }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </Grid>

        <Grid size={{xs:12}}>
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setStep(1);
              setOtp("");
              setErrors({});
              resetMessages();
            }}
            sx={{ textTransform: "none" }}
          >
            Change Email
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStepThree = () => (
    <Box component="form" onSubmit={handleResetPassword}>
      <Grid container spacing={2}>
        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            label="Email Address"
            value={email}
            disabled
          />
        </Grid>

        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            label="OTP"
            value={otp}
            disabled
          />
        </Grid>

        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrors((prev) => ({ ...prev, newPassword: "" }));
              resetMessages();
            }}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
          />
        </Grid>

        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              resetMessages();
            }}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
        </Grid>

        <Grid size={{xs:12}}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.4, textTransform: "none", borderRadius: 2 }}
          >
            {loading ? "Updating..." : "Change Password"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "#f5f7fb",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={1} mb={3} textAlign="center">
              <Typography variant="h4" fontWeight={700}>
                Forgot Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step === 1 && "Enter your email to receive OTP"}
                {step === 2 && "Enter the OTP sent to your email"}
                {step === 3 && "Set your new password"}
              </Typography>
            </Stack>

            {apiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {apiError}
              </Alert>
            )}

            {successMsg && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMsg}
              </Alert>
            )}

            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPassword;