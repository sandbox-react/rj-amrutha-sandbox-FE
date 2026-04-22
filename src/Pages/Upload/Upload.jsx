import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { deleteData, getData, uploadFile } from "../../Axios/axios";

const colors = {
  pageBg: "#f6f1f4",
  white: "#ffffff",
  border: "#e6dbe2",
  heading: "#3d0b39",
  subText: "#9f6f8d",
  purple: "#7d1f6d",
  gold: "#e2a128",
  red: "#c73d2b",
  softPurple: "#f1e6ee",
  mutedLine: "#eee3ea",
};

const headCellSx = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: colors.subText,
  bgcolor: "#faf4f8",
  borderBottom: `1px solid ${colors.mutedLine}`,
};

const bodyCellSx = {
  borderBottom: `1px solid ${colors.mutedLine}`,
  py: 2,
};

const formatSize = (bytes) => {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(2)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const Uploads = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchFiles = async (withLoader = false) => {
    try {
      setApiError("");
      if (withLoader) {
        setTableLoading(true);
      } else {
        setLoading(true);
      }

      const response = await getData("/upload");
      setRows(response?.data || []);
    } catch (error) {
      setApiError(error?.message || "Failed to fetch uploaded images");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleOpenUploadDialog = () => {
    setUploadedFile(null);
    setApiError("");
    setSuccessMsg("");
    setOpenUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    if (uploading) return;
    setOpenUploadDialog(false);
    setUploadedFile(null);
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setApiError("");
      setSuccessMsg("");

      const formData = new FormData();
      formData.append("image", file);

      const response = await uploadFile("/upload/image", formData);
      setUploadedFile(response?.data || null);
      setSuccessMsg(response?.message || "Image uploaded successfully");

      await fetchFiles(true);
    } catch (error) {
      setApiError(error?.message || "Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleCopy = async (url) => {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setSuccessMsg("Image URL copied successfully");
    } catch (error) {
      setApiError("Failed to copy image URL");
    }
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setOpenPreviewDialog(true);
  };

  const handleClosePreviewDialog = () => {
    setOpenPreviewDialog(false);
    setSelectedRow(null);
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm("Delete this image?");
    if (!confirmed) return;

    try {
      setApiError("");
      setSuccessMsg("");

      await deleteData(`/upload?key=${encodeURIComponent(row.key)}`);
      setSuccessMsg("Image deleted successfully");

      if (selectedRow?.key === row.key) {
        handleClosePreviewDialog();
      }

      await fetchFiles(true);
    } catch (error) {
      setApiError(error?.message || "Failed to delete image");
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.pageBg }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Upload Images
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
            Manage uploaded images, preview them, copy URL, and delete when needed.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <IconButton
            onClick={() => fetchFiles(true)}
            sx={{
              width: 44,
              height: 44,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              bgcolor: "#fff",
            }}
          >
            <RefreshOutlinedIcon />
          </IconButton>

          <Button
            variant="contained"
            startIcon={<AddPhotoAlternateOutlinedIcon />}
            onClick={handleOpenUploadDialog}
            sx={{
              textTransform: "none",
              borderRadius: 2.5,
              px: 2.5,
              py: 1.1,
            }}
          >
            Add Image
          </Button>
        </Stack>
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
          borderRadius: 4,
          border: `1px solid ${colors.border}`,
          overflow: "hidden",
          bgcolor: colors.white,
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Preview</TableCell>
                <TableCell sx={headCellSx}>File Name</TableCell>
                <TableCell sx={headCellSx}>Size</TableCell>
                <TableCell sx={headCellSx}>Uploaded At</TableCell>
                <TableCell align="right" sx={headCellSx}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 6 }}>
                    <Box sx={{ display: "grid", placeItems: "center" }}>
                      <CircularProgress size={28} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 6 }}>
                    <Typography align="center" color="text.secondary">
                      No uploaded images found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow
                    key={`${row.key}-${index}`}
                    hover
                    onClick={() => handleRowClick(row)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell sx={bodyCellSx}>
                      <Box
                        component="img"
                        src={row.url}
                        alt="preview"
                        sx={{
                          width: 54,
                          height: 54,
                          objectFit: "cover",
                          borderRadius: 2,
                          border: `1px solid ${colors.border}`,
                          bgcolor: colors.softPurple,
                        }}
                      />
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography fontWeight={700} color={colors.heading}>
                        {row.key?.split("/").pop()}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography color="text.secondary">
                        {formatSize(row.size)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography color="text.secondary">
                        {row.lastModified
                          ? new Date(row.lastModified).toLocaleString()
                          : "-"}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(row);
                        }}
                        sx={{
                          color: colors.red,
                          border: "1px solid #f2d9d5",
                          borderRadius: 2,
                        }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Upload Dialog */}
      <Dialog
        open={openUploadDialog}
        onClose={handleCloseUploadDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Upload Image
            </Typography>

            <IconButton onClick={handleCloseUploadDialog} disabled={uploading}>
              <CloseOutlinedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5}>
            {uploadedFile?.url ? (
              <>
                <Box
                  component="img"
                  src={uploadedFile.url}
                  alt="uploaded preview"
                  sx={{
                    width: "100%",
                    maxHeight: 320,
                    objectFit: "contain",
                    borderRadius: 3,
                    border: `1px solid ${colors.border}`,
                    bgcolor: "#faf6f8",
                  }}
                />

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: colors.border,
                    bgcolor: "#faf6f8",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>
                    Image URL
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      color: "text.secondary",
                      wordBreak: "break-all",
                    }}
                  >
                    {uploadedFile.url}
                  </Typography>
                </Paper>
              </>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  borderStyle: "dashed",
                  borderRadius: 3,
                  p: 4,
                  textAlign: "center",
                  borderColor: colors.border,
                  bgcolor: "#faf6f8",
                }}
              >
                <CloudUploadOutlinedIcon
                  sx={{
                    fontSize: 44,
                    color: colors.subText,
                    mb: 1,
                  }}
                />
                <Typography fontWeight={700}>Choose an image to upload</Typography>
                <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                  JPG, PNG, JPEG, WEBP supported
                </Typography>
              </Paper>
            )}

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                component="label"
                variant="contained"
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadOutlinedIcon />}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                {uploading ? "Uploading..." : "Choose Image"}
                <input hidden type="file" accept="image/*" onChange={handleUploadImage} />
              </Button>

              {uploadedFile?.url ? (
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyOutlinedIcon />}
                  onClick={() => handleCopy(uploadedFile.url)}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Copy URL
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCloseUploadDialog}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={openPreviewDialog}
        onClose={handleClosePreviewDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Image Preview
            </Typography>

            <IconButton onClick={handleClosePreviewDialog}>
              <CloseOutlinedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5}>
            {selectedRow?.url ? (
              <>
                <Box
                  component="img"
                  src={selectedRow.url}
                  alt="selected preview"
                  sx={{
                    width: "100%",
                    maxHeight: 320,
                    objectFit: "contain",
                    borderRadius: 3,
                    border: `1px solid ${colors.border}`,
                    bgcolor: "#faf6f8",
                  }}
                />

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: colors.border,
                    bgcolor: "#faf6f8",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>
                    Image URL
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      color: "text.secondary",
                      wordBreak: "break-all",
                    }}
                  >
                    {selectedRow.url}
                  </Typography>
                </Paper>
              </>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyOutlinedIcon />}
            onClick={() => handleCopy(selectedRow?.url)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Copy URL
          </Button>

          <Button
            onClick={handleClosePreviewDialog}
            variant="contained"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Uploads;