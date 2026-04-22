import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate, useParams } from "react-router-dom";
import { getData, postData, putData } from "../../Axios/axios";

const initialState = {
  title: "",
  slug: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  isActive: true,
};

const PageFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(initialState);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      if (isEdit) {
        const response = await getData(`/cms/pages/id/${id}`);
        const page = response?.data;

        setFormData({
          title: page?.title || "",
          slug: page?.slug || "",
          content: page?.content || "",
          metaTitle: page?.metaTitle || "",
          metaDescription: page?.metaDescription || "",
          metaKeywords: page?.metaKeywords || "",
          isActive: page?.isActive ?? true,
        });
      } else {
        setFormData(initialState);
      }
    } catch (error) {
      setApiError(error?.message || "Failed to load page data");
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

      if (name === "title" && !isEdit) {
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

    if (!formData.title.trim()) {
      newErrors.title = "Page title is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setApiError("");
      setSuccessMsg("");

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content.trim(),
        metaTitle: formData.metaTitle.trim() || null,
        metaDescription: formData.metaDescription.trim() || null,
        metaKeywords: formData.metaKeywords.trim() || null,
        isActive: formData.isActive,
      };

      if (isEdit) {
        const response = await putData(`/cms/pages/${id}`, payload);
        setSuccessMsg(response?.message || "Page updated successfully");
      } else {
        const response = await postData("/cms/pages", payload);
        setSuccessMsg(response?.message || "Page created successfully");
      }

      setTimeout(() => {
        navigate("/pages");
      }, 800);
    } catch (error) {
      if (error?.errors?.length) {
        const validationErrors = {};
        error.errors.forEach((item) => {
          validationErrors[item.path] = item.msg;
        });
        setErrors(validationErrors);
      } else {
        setApiError(error?.message || "Failed to save page");
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
            {isEdit ? "Edit Page" : "Add Page"}
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
            {isEdit
              ? "Update page content and meta tags."
              : "Create a new content page with meta tags."}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate("/pages")}
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
          <Grid container spacing={2.5}>
            <Grid size={{xs:12,md:6}}>
              <TextField
                fullWidth
                label="Page Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>

            <Grid size={{xs:12,md:6}}>
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
                fullWidth
                multiline
                minRows={8}
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                error={!!errors.content}
                helperText={errors.content}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Meta Tags
              </Typography>
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Meta Title"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Meta Description"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Meta Keywords"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleChange}
                helperText="Example: snacks, sweets, jio foods"
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
                    ? "Update Page"
                    : "Create Page"}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate("/pages")}
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

export default PageFormPage;