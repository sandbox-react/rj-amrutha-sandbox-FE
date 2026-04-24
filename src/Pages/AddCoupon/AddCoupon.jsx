import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate, useParams } from "react-router-dom";
import { getData, postData, putData } from "../../Axios/axios";

const initialState = {
  code: "",
  title: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: "",
  targetType: "order",
  targetId: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

const CouponFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(initialState);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});

  const loadInitialData = async () => {
    try {
      setPageLoading(true);
      setApiError("");

      const [productRes, categoryRes] = await Promise.all([
        getData("/products"),
        getData("/categories"),
      ]);

      setProducts(productRes?.data?.rows || productRes?.data || []);
      setCategories(categoryRes?.data || []);

      if (isEdit) {
        const couponRes = await getData(`/coupons/${id}`);
        const coupon = couponRes?.data;

        setFormData({
          code: coupon?.code || "",
          title: coupon?.title || "",
          description: coupon?.description || "",
          discountType: coupon?.discountType || "percentage",
          discountValue: coupon?.discountValue || "",
          minOrderAmount: coupon?.minOrderAmount || "",
          maxDiscountAmount: coupon?.maxDiscountAmount || "",
          usageLimit: coupon?.usageLimit || "",
          targetType: coupon?.targetType || "order",
          targetId: coupon?.targetId || "",
          startsAt: coupon?.startsAt
            ? new Date(coupon.startsAt).toISOString().slice(0, 16)
            : "",
          expiresAt: coupon?.expiresAt
            ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
            : "",
          isActive: coupon?.isActive ?? true,
        });
      }
    } catch (error) {
      setApiError(error?.message || "Failed to load coupon data");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "targetType" && value === "order" ? { targetId: "" } : {}),
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
    setSuccessMsg("");
  };

  const handleSwitch = (e) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.code.trim()) newErrors.code = "Coupon code is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.discountValue) newErrors.discountValue = "Discount value is required";
    if (!formData.expiresAt) newErrors.expiresAt = "Expiry date is required";

    if (
      (formData.targetType === "product" || formData.targetType === "category") &&
      !formData.targetId
    ) {
      newErrors.targetId = "Please select target item";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPayload = () => ({
    code: formData.code.trim().toUpperCase(),
    title: formData.title.trim(),
    description: formData.description || null,
    discountType: formData.discountType,
    discountValue: Number(formData.discountValue),
    minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
    maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
    usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
    targetType: formData.targetType,
    targetId:
      formData.targetType === "order" ? null : Number(formData.targetId),
    startsAt: formData.startsAt || null,
    expiresAt: formData.expiresAt,
    isActive: formData.isActive,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setApiError("");
      setSuccessMsg("");

      const payload = getPayload();

      if (isEdit) {
        const response = await putData(`/coupons/${id}`, payload);
        setSuccessMsg(response?.message || "Coupon updated successfully");
      } else {
        const response = await postData("/coupons", payload);
        setSuccessMsg(response?.message || "Coupon created successfully");
      }

      setTimeout(() => {
        navigate("/coupons");
      }, 800);
    } catch (error) {
      if (error?.errors?.length) {
        const validationErrors = {};
        error.errors.forEach((item) => {
          validationErrors[item.path] = item.msg;
        });
        setErrors(validationErrors);
      } else {
        setApiError(error?.message || "Failed to save coupon");
      }
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {isEdit ? "Edit Coupon" : "Add Coupon"}
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
            Create coupon for order, product, or category with expiry.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate("/coupons")}
          sx={{
            textTransform: "none",
            borderRadius: 2.5,
          }}
        >
          Back
        </Button>
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

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          border: "1px solid #e6dbe2",
          bgcolor: "#fff",
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid size={{xs:12,md:6}}>
              <TextField
                fullWidth
                label="Coupon Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                error={!!errors.code}
                helperText={errors.code}
              />
            </Grid>

            <Grid size={{xs:12,md:6}}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{xs:12,md:4}}>
              <TextField
                select
                fullWidth
                label="Discount Type"
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
              >
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="flat">Flat</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{xs:12,md:4}}>
              <TextField
                fullWidth
                type="number"
                label="Discount Value"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                error={!!errors.discountValue}
                helperText={errors.discountValue}
              />
            </Grid>

            <Grid size={{xs:12,md:4}}>
              <TextField
                fullWidth
                type="number"
                label="Min Order Amount"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{xs:12,md:4}}>
              <TextField
                fullWidth
                type="number"
                label="Max Discount Amount"
                name="maxDiscountAmount"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{xs:12,md:4}}>
              <TextField
                fullWidth
                type="number"
                label="Usage Limit"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{xs:12,md:4}}>
              <TextField
                select
                fullWidth
                label="Target Type"
                name="targetType"
                value={formData.targetType}
                onChange={handleChange}
              >
                <MenuItem value="order">Entire Order</MenuItem>
                <MenuItem value="product">Specific Product</MenuItem>
                <MenuItem value="category">Specific Category</MenuItem>
              </TextField>
            </Grid>

            {formData.targetType === "product" && (
              <Grid size={{xs:12}}>
                <TextField
                  select
                  fullWidth
                  label="Target Product"
                  name="targetId"
                  value={formData.targetId}
                  onChange={handleChange}
                  error={!!errors.targetId}
                  helperText={errors.targetId}
                >
                  {products.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {formData.targetType === "category" && (
              <Grid size={{xs:12}}>
                <TextField
                  select
                  fullWidth
                  label="Target Category"
                  name="targetId"
                  value={formData.targetId}
                  onChange={handleChange}
                  error={!!errors.targetId}
                  helperText={errors.targetId}
                >
                  {categories.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid size={{xs:12,md:6}}>
              <TextField
                fullWidth
                label="Start Date"
                type="datetime-local"
                name="startsAt"
                value={formData.startsAt}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{xs:12,md:6}}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                error={!!errors.expiresAt}
                helperText={errors.expiresAt}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitch}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid size={{xs:12}}>
              <Stack direction="row" spacing={1.5}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2.5,
                    px: 3,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : isEdit
                    ? "Update Coupon"
                    : "Create Coupon"}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate("/coupons")}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2.5,
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default CouponFormPage;