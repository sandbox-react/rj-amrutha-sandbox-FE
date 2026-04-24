import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { deleteData, getData } from "../../Axios/axios";

const headCellSx = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "#9f6f8d",
  bgcolor: "#faf4f8",
  borderBottom: "1px solid #eee3ea",
};

const bodyCellSx = {
  borderBottom: "1px solid #f1e7ed",
  py: 2,
};

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

const Products = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchProducts = async (withLoader = false) => {
    try {
      setApiError("");

      if (withLoader) setTableLoading(true);
      else setLoading(true);

      const response = await getData("/products");
      setRows(response?.data?.rows || response?.data || []);
    } catch (error) {
      setApiError(error?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    navigate("/products/add");
  };

  const handleEdit = (row) => {
    navigate(`/products/edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(`Delete product "${row.name}"?`);
    if (!confirmed) return;

    try {
      setApiError("");
      setSuccessMsg("");

      await deleteData(`/products/${row.id}`);
      setSuccessMsg("Product deleted successfully");
      fetchProducts(true);
    } catch (error) {
      setApiError(error?.message || "Failed to delete product");
    }
  };

  const handleExportExcel = () => {
    if (!rows.length) return;

    const exportRows = rows.map((row, index) => ({
      SNo: index + 1,
      ID: row.id,
      Name: row.name || "-",
      Category: row.Category?.name || "-",
      SKU: row.sku || "-",
      "Base Price": Number(row.basePrice || 0),
      "Tax Type": row.taxType || "-",
      "Tax Value": Number(row.taxValue || 0),
      "Total Price": Number(row.totalPrice || 0),
      Featured: row.isFeatured ? "Yes" : "No",
      Status: row.isActive ? "Active" : "Inactive",
      "Image URL": row.imageUrl || "-",
      "Created At": row.createdAt || "-",
      "Updated At": row.updatedAt || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 8 },
      { wch: 28 },
      { wch: 20 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 45 },
      { wch: 24 },
      { wch: 24 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `products-${today}.xlsx`);
  };

  if (loading) {
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
        <Typography variant="h5" fontWeight={700}>
          Products
        </Typography>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={handleExportExcel}
            disabled={!rows.length}
            sx={{
              textTransform: "none",
              borderRadius: 2.5,
              px: 2.5,
            }}
          >
            Export to Excel
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              textTransform: "none",
              borderRadius: 2.5,
              px: 2.5,
            }}
          >
            Add Product
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
          border: "1px solid #e6dbe2",
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Image</TableCell>
                <TableCell sx={headCellSx}>Name</TableCell>
                <TableCell sx={headCellSx}>Category</TableCell>
                <TableCell sx={headCellSx}>SKU</TableCell>
                <TableCell sx={headCellSx}>Base Price</TableCell>
                <TableCell sx={headCellSx}>Tax</TableCell>
                <TableCell sx={headCellSx}>Total</TableCell>
                <TableCell sx={headCellSx}>Featured</TableCell>
                <TableCell sx={headCellSx}>Status</TableCell>
                <TableCell align="right" sx={headCellSx}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={10} sx={{ py: 6 }}>
                    <Box sx={{ display: "grid", placeItems: "center" }}>
                      <CircularProgress size={28} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} sx={{ py: 6 }}>
                    <Typography align="center" color="text.secondary">
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={bodyCellSx}>
                      <Avatar
                        src={row.imageUrl || ""}
                        alt={row.name}
                        variant="rounded"
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          bgcolor: "#f3e8f0",
                        }}
                      >
                        {row.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography fontWeight={700} color="#3d0b39">
                        {row.name}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography color="text.secondary">
                        {row.Category?.name || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography color="text.secondary">
                        {row.sku || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography color="text.secondary">
                        {formatMoney(row.basePrice)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography color="text.secondary">
                        {row.taxType
                          ? row.taxType === "percentage"
                            ? `${Number(row.taxValue || 0)}%`
                            : formatMoney(row.taxValue)
                          : "-"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography fontWeight={700} color="#3d0b39">
                        {formatMoney(row.totalPrice)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Chip
                        label={row.isFeatured ? "Yes" : "No"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: row.isFeatured ? "#f7efdf" : "#f2f2f2",
                          color: row.isFeatured ? "#e2a128" : "#6b7280",
                        }}
                      />
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Chip
                        label={row.isActive ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: row.isActive ? "#e7f4ec" : "#f8e8e5",
                          color: row.isActive ? "#23935a" : "#c73d2b",
                        }}
                      />
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          onClick={() => handleEdit(row)}
                          sx={{
                            border: "1px solid #eadce5",
                            borderRadius: 2,
                          }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          onClick={() => handleDelete(row)}
                          sx={{
                            border: "1px solid #f2d9d5",
                            borderRadius: 2,
                            color: "#c73d2b",
                          }}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Products;