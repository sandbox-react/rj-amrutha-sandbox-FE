
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { useNavigate, useParams } from "react-router-dom";
import { getData, postData, putData, uploadFile } from "../../Axios/axios";

const initialState = {
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  sku: "",
  basePrice: "",
  imageUrl: "",
  discountType: "",
  discountValue: "",
  taxType: "",
  taxValue: "",
  totalPrice: "",
  isActive: true,
  isFeatured: false,
  mealType: "",
  preference: "",
  stock: 0,
  reorderPoint: 20,
  isTopSeller: false,
};

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(initialState);
  const [preview, setPreview] = useState("");
  const [categories, setCategories] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});

  const makeSlug = (value = "") =>
    value
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-");

  const computedTaxAmount = useMemo(() => {
    const base = Number(formData.basePrice || 0);
    const tax = Number(formData.taxValue || 0);
    if (formData.taxType === "percentage") return ((base * tax) / 100).toFixed(2);
    if (formData.taxType === "flat") return tax.toFixed(2);
    return "0.00";
  }, [formData.basePrice, formData.taxType, formData.taxValue]);

  const computedTotalPrice = useMemo(() => {
    const base = Number(formData.basePrice || 0);
    const taxAmount = Number(computedTaxAmount || 0);
    return (base + taxAmount).toFixed(2);
  }, [formData.basePrice, computedTaxAmount]);

  const loadInitialData = async () => {
    try {
      setPageLoading(true);
      setApiError("");

      const categoriesRes = await getData("/categories");
      setCategories(categoriesRes?.data || []);

      if (isEdit) {
        const productRes = await getData(`/products/${id}`);
        const product = productRes?.data;

        setFormData({
          categoryId: product?.categoryId || "",
          name: product?.name || "",
          slug: product?.slug || "",
          description: product?.description || "",
          sku: product?.sku || "",
          basePrice: product?.basePrice || "",
          imageUrl: product?.imageUrl || "",
          discountType: product?.discountType || "",
          discountValue: product?.discountValue || "",
          taxType: product?.taxType || "",
          taxValue: product?.taxValue || "",
          totalPrice: product?.totalPrice || "",
          isActive: product?.isActive ?? true,
          isFeatured: product?.isFeatured ?? false,
          mealType: product?.mealType || "",
          preference: product?.preference || "",
          stock: product?.stock ?? 0,
          reorderPoint: product?.reorderPoint ?? 20,
          isTopSeller: product?.isTopSeller ?? false,
        });

        setPreview(product?.imageUrl || "");
      } else {
        setFormData(initialState);
        setPreview("");
      }
    } catch (error) {
      setApiError(error?.message || "Failed to load product data");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [id]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, totalPrice: computedTotalPrice }));
  }, [computedTotalPrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "name" && !isEdit) updated.slug = makeSlug(value);
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
    setSuccessMsg("");
  };

  const handleNumberChange = (name) => (e) => {
    const raw = e.target.value;
    const val = raw === "" ? "" : Number(raw);
    setFormData((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSwitchChange = (name) => (e) =>
    setFormData((prev) => ({ ...prev, [name]: e.target.checked }));

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setApiError("");
      setSuccessMsg("");
      const formDataObj = new FormData();
      formDataObj.append("image", file);
      const response = await uploadFile("/upload/image", formDataObj);
      const uploadedUrl = response?.data?.url || "";
      setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      setPreview(uploadedUrl);
      setSuccessMsg(response?.message || "Image uploaded successfully");
    } catch (error) {
      setApiError(error?.message || "Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleCopyImageUrl = async () => {
    if (!formData.imageUrl) return;
    try {
      await navigator.clipboard.writeText(formData.imageUrl);
      setSuccessMsg("Image URL copied successfully");
    } catch {
      setApiError("Failed to copy image URL");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.basePrice) newErrors.basePrice = "Base price is required";
    if (formData.imageUrl && !/^https?:\/\/.+/i.test(formData.imageUrl))
      newErrors.imageUrl = "Image URL must be valid";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createProductPayload = () => ({
    categoryId: Number(formData.categoryId),
    name: formData.name.trim(),
    slug: formData.slug.trim(),
    description: formData.description.trim(),
    sku: formData.sku.trim(),
    basePrice: Number(formData.basePrice),
    imageUrl: formData.imageUrl || null,
    discountType: formData.discountType || null,
    discountValue: formData.discountValue ? Number(formData.discountValue) : 0,
    taxType: formData.taxType || null,
    taxValue: formData.taxValue ? Number(formData.taxValue) : 0,
    totalPrice: Number(computedTotalPrice),
    isActive: formData.isActive,
    isFeatured: formData.isFeatured,
    mealType: formData.mealType || null,
    preference: formData.preference || null,
    stock: Number(formData.stock || 0),
    reorderPoint: Number(formData.reorderPoint || 20),
    isTopSeller: !!formData.isTopSeller,
  });

  const updateProductPayload = () => ({
    categoryId: Number(formData.categoryId),
    name: formData.name.trim(),
    slug: formData.slug.trim(),
    description: formData.description.trim(),
    sku: formData.sku.trim(),
    basePrice: Number(formData.basePrice),
    imageUrl: formData.imageUrl || null,
    discountType: formData.discountType || null,
    discountValue: formData.discountValue ? Number(formData.discountValue) : 0,
    taxType: formData.taxType || null,
    taxValue: formData.taxValue ? Number(formData.taxValue) : 0,
    totalPrice: Number(computedTotalPrice),
    isActive: formData.isActive,
    isFeatured: formData.isFeatured,
    mealType: formData.mealType || null,
    preference: formData.preference || null,
    stock: Number(formData.stock || 0),
    reorderPoint: Number(formData.reorderPoint || 20),
    isTopSeller: !!formData.isTopSeller,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setApiError("");
      setSuccessMsg("");

      if (isEdit) {
        const response = await putData(`/products/${id}`, updateProductPayload());
        setSuccessMsg(response?.message || "Product updated successfully");
      } else {
        const response = await postData("/products", createProductPayload());
        setSuccessMsg(response?.message || "Product created successfully");
      }

      setTimeout(() => navigate("/products"), 800);
    } catch (error) {
      if (error?.errors?.length) {
        const validationErrors = {};
        error.errors.forEach((item) => {
          validationErrors[item.path] = item.msg;
        });
        setErrors(validationErrors);
      } else {
        setApiError(error?.message || "Failed to save product");
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          {isEdit ? "Edit Product" : "Add Product"}
        </Typography>

        <Button variant="outlined" size="small" startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate("/products")}>
          Back
        </Button>
      </Stack>

      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e6dbe2" }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Category" name="categoryId" value={formData.categoryId} onChange={handleChange} error={!!errors.categoryId} helperText={errors.categoryId}>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Product Name" name="name" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Slug" name="slug" value={formData.slug} onChange={handleChange} error={!!errors.slug} helperText={errors.slug} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="SKU" name="sku" value={formData.sku} onChange={handleChange} error={!!errors.sku} helperText={errors.sku} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline minRows={3} label="Description" name="description" value={formData.description} onChange={handleChange} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth type="number" label="Base Price" name="basePrice" value={formData.basePrice} onChange={handleChange} error={!!errors.basePrice} helperText={errors.basePrice} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField select fullWidth label="Tax Type" name="taxType" value={formData.taxType} onChange={handleChange}>
                <MenuItem value="">None</MenuItem>
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="flat">Flat</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth type="number" label="Tax Value" name="taxValue" value={formData.taxValue} onChange={handleChange} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Tax Amount" value={computedTaxAmount} disabled helperText="Automatically calculated" sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#5f1431", fontWeight: 600 } }} />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField select fullWidth label="Discount Type" name="discountType" value={formData.discountType} onChange={handleChange}>
                <MenuItem value="">None</MenuItem>
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="flat">Flat</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth type="number" label="Discount Value" name="discountValue" value={formData.discountValue} onChange={handleChange} />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Total Price" name="totalPrice" value={computedTotalPrice} disabled helperText="Automatically calculated from Base Price + Tax" sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#5f1431", fontWeight: 600 } }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleChange} error={!!errors.imageUrl} helperText={errors.imageUrl} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button component="label" variant="outlined" size="small" startIcon={uploading ? <CircularProgress size={14} /> : <CloudUploadOutlinedIcon />}>
                  Upload
                  <input hidden type="file" onChange={handleUploadImage} />
                </Button>

                <Button variant="outlined" size="small" startIcon={<ContentCopyOutlinedIcon />} onClick={handleCopyImageUrl} disabled={!formData.imageUrl}>
                  Copy URL
                </Button>
              </Stack>
            </Grid>

            {preview && (
              <Grid size={{ xs: 12 }}>
                <Box component="img" src={preview} alt="preview" sx={{ width: 120, height: 120, objectFit: "cover", borderRadius: 2, border: "1px solid #ddd" }} />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2}>
                <FormControlLabel control={<Switch checked={formData.isFeatured} onChange={handleSwitchChange("isFeatured")} />} label="Featured" />
                <FormControlLabel control={<Switch checked={formData.isActive} onChange={handleSwitchChange("isActive")} />} label="Active" />
                <FormControlLabel control={<Switch checked={formData.isTopSeller} onChange={handleSwitchChange("isTopSeller")} />} label="Top Seller" />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Meal Type" name="mealType" value={formData.mealType} onChange={handleChange}>
                <MenuItem value="">None</MenuItem>
                <MenuItem value="breakfast">Breakfast</MenuItem>
                <MenuItem value="lunch">Lunch</MenuItem>
                <MenuItem value="dinner">Dinner</MenuItem>
                <MenuItem value="snacks">Snacks</MenuItem>
                <MenuItem value="desserts">Desserts</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Preference" name="preference" value={formData.preference} onChange={handleChange}>
                <MenuItem value="">None</MenuItem>
                <MenuItem value="vegan">Vegan</MenuItem>
                <MenuItem value="vegetarian">Vegetarian</MenuItem>
                <MenuItem value="non_veg">Non-Veg</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label="Stock" name="stock" value={formData.stock} onChange={handleNumberChange("stock")} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label="Reorder Point" name="reorderPoint" value={formData.reorderPoint} onChange={handleNumberChange("reorderPoint")} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" size="small" disabled={saving}>
                  {saving ? "Saving..." : isEdit ? "Update" : "Create"}
                </Button>

                <Button variant="outlined" size="small" onClick={() => navigate("/products")}>
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

export default ProductFormPage;