import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  name: "",
  slug: "",
  parentId: "",
  imageUrl: "",
  isActive: true,
};

const CategoryFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(initialState);
  const [preview, setPreview] = useState("");
  const [parentOptions, setParentOptions] = useState([]);

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

  const filteredParentOptions = useMemo(() => {
    if (!id) return parentOptions;
    return parentOptions.filter((item) => String(item.id) !== String(id));
  }, [parentOptions, id]);

  const loadInitialData = async () => {
    try {
      setPageLoading(true);
      setApiError("");

      const categoriesRes = await getData("/categories");
      const allCategories = categoriesRes?.data || [];
      setParentOptions(allCategories);

      if (isEdit) {
        const categoryRes = await getData(`/categories/${id}`);
        const category = categoryRes?.data;

        setFormData({
          name: category?.name || "",
          slug: category?.slug || "",
          parentId: category?.parentId || "",
          imageUrl: category?.imageUrl || "",
          isActive: category?.isActive ?? true,
        });

        setPreview(category?.imageUrl || "");
      } else {
        setFormData(initialState);
        setPreview("");
      }
    } catch (error) {
      setApiError(error?.message || "Failed to load category data");
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

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setApiError("");
    setSuccessMsg("");
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (formData.imageUrl && !/^https?:\/\/.+/i.test(formData.imageUrl)) {
      newErrors.imageUrl = "Image URL must be valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    } catch (error) {
      setApiError("Failed to copy image URL");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);
      setApiError("");
      setSuccessMsg("");

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        parentId: formData.parentId || null,
        imageUrl: formData.imageUrl || null,
        isActive: formData.isActive,
      };

      if (isEdit) {
        const response = await putData(`/categories/${id}`, payload);
        setSuccessMsg(response?.message || "Category updated successfully");
      } else {
        const response = await postData("/categories", payload);
        setSuccessMsg(response?.message || "Category created successfully");
      }

      setTimeout(() => {
        navigate("/categories");
      }, 800);
    } catch (error) {
      if (error?.errors?.length) {
        const validationErrors = {};
        error.errors.forEach((item) => {
          validationErrors[item.path] = item.msg;
        });
        setErrors(validationErrors);
      } else {
        setApiError(error?.message || "Failed to save category");
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
            {isEdit ? "Edit Category" : "Add Category"}
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
            {isEdit
              ? "Update category details and image."
              : "Create a new category and upload image."}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate("/categories")}
          sx={{
            textTransform: "none",
            borderRadius: 2.5,
            alignSelf: { xs: "flex-start", md: "center" },
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
          <Grid container spacing={3}>
            <Grid size={{xs:12,md:8}}>
              <Grid container spacing={2.5}>
                <Grid size={{xs:12}}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>

                <Grid size={{xs:12}}>
                  <TextField
                    fullWidth
                    label="Slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    error={!!errors.slug}
                    helperText={errors.slug}
                  />
                </Grid>

                <Grid size={{xs:12}}>
                  <TextField
                    select
                    fullWidth
                    label="Parent Category"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleChange}
                  >
                    <MenuItem value="">None</MenuItem>
                    {filteredParentOptions.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{xs:12}}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    error={!!errors.imageUrl}
                    helperText={errors.imageUrl}
                  />
                </Grid>

                <Grid size={{xs:12}}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleStatusChange}
                      />
                    }
                    label="Active"
                  />
                </Grid>

                <Grid size={{xs:12}}>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap">
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={
                        uploading ? (
                          <CircularProgress size={18} />
                        ) : (
                          <CloudUploadOutlinedIcon />
                        )
                      }
                      disabled={uploading}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                      }}
                    >
                      {uploading ? "Uploading..." : "Upload Image"}
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleUploadImage}
                      />
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<ContentCopyOutlinedIcon />}
                      onClick={handleCopyImageUrl}
                      disabled={!formData.imageUrl}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                      }}
                    >
                      Copy Image URL
                    </Button>
                  </Stack>
                </Grid>

                <Grid size={{xs:12}}>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving || uploading}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2.5,
                        px: 3,
                      }}
                    >
                      {saving
                        ? "Saving..."
                        : isEdit
                        ? "Update Category"
                        : "Create Category"}
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate("/categories")}
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
            </Grid>

            <Grid size={{xs:12,md:4}}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  borderColor: "#e6dbe2",
                  bgcolor: "#faf6f8",
                  height: "100%",
                }}
              >
                <Typography fontWeight={700} sx={{ mb: 2 }}>
                  Image Preview
                </Typography>

                {preview ? (
                  <Box
                    component="img"
                    src={preview}
                    alt="Category Preview"
                    sx={{
                      width: "100%",
                      height: 240,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid #e6dbe2",
                      bgcolor: "#fff",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: 240,
                      borderRadius: 2,
                      border: "1px dashed #d7c6d0",
                      bgcolor: "#fff",
                      display: "grid",
                      placeItems: "center",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Typography color="text.secondary">
                      Upload an image to preview it here
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default CategoryFormPage;