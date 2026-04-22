import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
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
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useNavigate, useParams } from "react-router-dom";
import { deleteData, getData, postData, putData, uploadFile } from "../../Axios/axios";

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
  isActive: true,
  isFeatured: false,
  variants: [
    {
      label: "",
      weight: "",
      size: "",
      price: "",
      stock: "",
      sku: "",
      isActive: true,
    },
  ],
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

  const makeSlug = (value = "") => {
    return value
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-");
  };

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
          isActive: product?.isActive ?? true,
          isFeatured: product?.isFeatured ?? false,
          variants:
            product?.variants?.length > 0
              ? product.variants.map((item) => ({
                  id: item.id,
                  label: item.label || "",
                  weight: item.weight || "",
                  size: item.size || "",
                  price: item.price || "",
                  stock: item.stock || "",
                  sku: item.sku || "",
                  isActive: item.isActive ?? true,
                }))
              : [
                  {
                    label: "",
                    weight: "",
                    size: "",
                    price: "",
                    stock: "",
                    sku: "",
                    isActive: true,
                  },
                ],
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "name" && !isEdit) {
        updated.slug = makeSlug(value);
      }

      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
    setSuccessMsg("");
  };

  const handleSwitchChange = (name) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.checked,
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value,
      };
      return {
        ...prev,
        variants: updatedVariants,
      };
    });
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          label: "",
          weight: "",
          size: "",
          price: "",
          stock: "",
          sku: "",
          isActive: true,
        },
      ],
    }));
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => {
      if (prev.variants.length === 1) return prev;
      return {
        ...prev,
        variants: prev.variants.filter((_, idx) => idx !== index),
      };
    });
  };

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

      setFormData((prev) => ({
        ...prev,
        imageUrl: uploadedUrl,
      }));

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

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (!formData.basePrice) {
      newErrors.basePrice = "Base price is required";
    }

    if (formData.imageUrl && !/^https?:\/\/.+/i.test(formData.imageUrl)) {
      newErrors.imageUrl = "Image URL must be valid";
    }

    formData.variants.forEach((variant, index) => {
      if (!variant.label?.trim()) {
        newErrors[`variant_label_${index}`] = "Variant label is required";
      }
      if (!variant.price) {
        newErrors[`variant_price_${index}`] = "Variant price is required";
      }
      if (variant.stock === "" || variant.stock === null || variant.stock === undefined) {
        newErrors[`variant_stock_${index}`] = "Variant stock is required";
      }
      if (!variant.sku?.trim()) {
        newErrors[`variant_sku_${index}`] = "Variant SKU is required";
      }
    });

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
    isActive: formData.isActive,
    isFeatured: formData.isFeatured,
    variants: formData.variants.map((variant) => ({
      label: variant.label.trim(),
      weight: variant.weight || null,
      size: variant.size || null,
      price: Number(variant.price),
      stock: Number(variant.stock),
      sku: variant.sku.trim(),
      isActive: variant.isActive ?? true,
    })),
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
    isActive: formData.isActive,
    isFeatured: formData.isFeatured,
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

        const existingVariantIds = formData.variants.filter((v) => v.id).map((v) => v.id);
        const originalProduct = await getData(`/products/${id}`);
        const originalVariants = originalProduct?.data?.variants || [];

        for (const variant of formData.variants) {
          const variantPayload = {
            label: variant.label.trim(),
            weight: variant.weight || null,
            size: variant.size || null,
            price: Number(variant.price),
            stock: Number(variant.stock),
            sku: variant.sku.trim(),
            isActive: variant.isActive ?? true,
          };

          if (variant.id) {
            await putData(`/products/variants/${variant.id}`, variantPayload);
          } else {
            await postData(`/products/${id}/variants`, variantPayload);
          }
        }

        for (const oldVariant of originalVariants) {
          if (!existingVariantIds.includes(oldVariant.id)) {
            await deleteData(`/products/variants/${oldVariant.id}`);
          }
        }
      } else {
        const response = await postData("/products", createProductPayload());
        setSuccessMsg(response?.message || "Product created successfully");
      }

      setTimeout(() => {
        navigate("/products");
      }, 800);
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

// ONLY UI PART CHANGED — logic remains same

return (
  <Box>
    {/* HEADER */}
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 2 }}
    >
      <Typography variant="h5" fontWeight={600}>
        {isEdit ? "Edit Product" : "Add Product"}
      </Typography>

      <Button
        variant="outlined"
        size="small"
        startIcon={<ArrowBackOutlinedIcon />}
        onClick={() => navigate("/products")}
      >
        Back
      </Button>
    </Stack>

    {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
    {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid #e6dbe2",
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          
          {/* BASIC FIELDS */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select fullWidth label="Category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              error={!!errors.categoryId}
              helperText={errors.categoryId}
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              error={!!errors.slug}
              helperText={errors.slug}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              error={!!errors.sku}
              helperText={errors.sku}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth multiline minRows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth type="number"
              label="Base Price"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              error={!!errors.basePrice}
              helperText={errors.basePrice}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select fullWidth label="Discount Type"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
              <MenuItem value="flat">Flat</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth type="number"
              label="Discount Value"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth label="Image URL"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              error={!!errors.imageUrl}
              helperText={errors.imageUrl}
            />
          </Grid>

          {/* IMAGE BUTTONS */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1}>
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={uploading ? <CircularProgress size={14} /> : <CloudUploadOutlinedIcon />}
              >
                Upload
                <input hidden type="file" onChange={handleUploadImage} />
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyOutlinedIcon />}
                onClick={handleCopyImageUrl}
                disabled={!formData.imageUrl}
              >
                Copy URL
              </Button>
            </Stack>
          </Grid>

          {/* SWITCHES */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={<Switch checked={formData.isFeatured} onChange={handleSwitchChange("isFeatured")} />}
                label="Featured"
              />
              <FormControlLabel
                control={<Switch checked={formData.isActive} onChange={handleSwitchChange("isActive")} />}
                label="Active"
              />
            </Stack>
          </Grid>

          {/* VARIANTS */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography fontWeight={600}>Variants</Typography>
              <Button size="small" onClick={handleAddVariant}>Add</Button>
            </Stack>

            <Stack spacing={1.5}>
              {formData.variants.map((v, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth label="Label" value={v.label}
                        onChange={(e)=>handleVariantChange(i,"label",e.target.value)} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth label="SKU" value={v.sku}
                        onChange={(e)=>handleVariantChange(i,"sku",e.target.value)} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth type="number" label="Price" value={v.price}
                        onChange={(e)=>handleVariantChange(i,"price",e.target.value)} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth type="number" label="Stock" value={v.stock}
                        onChange={(e)=>handleVariantChange(i,"stock",e.target.value)} />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Grid>

          {/* ACTIONS */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" size="small">
                {isEdit ? "Update" : "Create"}
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