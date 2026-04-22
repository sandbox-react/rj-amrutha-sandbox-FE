import React, { useEffect, useState } from "react";
import {
    Alert,
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
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useNavigate } from "react-router-dom";
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

const Coupons = () => {
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const fetchCoupons = async (withLoader = false) => {
        try {
            setApiError("");

            if (withLoader) setTableLoading(true);
            else setLoading(true);

            const response = await getData("/coupons");
            setRows(response?.data || []);
        } catch (error) {
            setApiError(error?.message || "Failed to fetch coupons");
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleAdd = () => {
        navigate("/coupons/add");
    };

    const handleEdit = (row) => {
        navigate(`/coupons/edit/${row.id}`);
    };

    const handleDelete = async (row) => {
        const confirmed = window.confirm(`Delete coupon "${row.code}"?`);
        if (!confirmed) return;

        try {
            setApiError("");
            setSuccessMsg("");

            await deleteData(`/coupons/${row.id}`);
            setSuccessMsg("Coupon deleted successfully");
            fetchCoupons(true);
        } catch (error) {
            setApiError(error?.message || "Failed to delete coupon");
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
        <Box>
            <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                sx={{ mb: 3 }}
            >
                {/* LEFT */}
                <Box
                    sx={{
                        width: { xs: "100%", md: "50%" },
                        display: "flex",
                        justifyContent: "flex-start",
                    }}
                >
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Coupons
                        </Typography>
                        <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
                            Manage order, product, and category based coupons.
                        </Typography>
                    </Box>
                </Box>

                {/* RIGHT */}
                <Box
                    sx={{
                        width: { xs: "100%", md: "50%" },
                        display: "flex",
                        justifyContent: { xs: "flex-start", md: "flex-end" },
                        mt: { xs: 2, md: 0 },
                    }}
                >
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
                        Add Coupon
                    </Button>
                </Box>
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
                                <TableCell sx={headCellSx}>Code</TableCell>
                                <TableCell sx={headCellSx}>Title</TableCell>
                                <TableCell sx={headCellSx}>Type</TableCell>
                                <TableCell sx={headCellSx}>Target</TableCell>
                                <TableCell sx={headCellSx}>Discount</TableCell>
                                <TableCell sx={headCellSx}>Expiry</TableCell>
                                <TableCell sx={headCellSx}>Status</TableCell>
                                <TableCell align="right" sx={headCellSx}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {tableLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ py: 6 }}>
                                        <Box sx={{ display: "grid", placeItems: "center" }}>
                                            <CircularProgress size={28} />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ py: 6 }}>
                                        <Typography align="center" color="text.secondary">
                                            No coupons found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell sx={bodyCellSx}>
                                            <Typography fontWeight={700} color="#3d0b39">
                                                {row.code}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx}>
                                            <Typography color="#3d0b39">{row.title}</Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx}>
                                            <Typography color="text.secondary">
                                                {row.discountType}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx}>
                                            <Chip
                                                label={
                                                    row.targetType === "order"
                                                        ? "Order"
                                                        : row.targetType === "product"
                                                            ? "Product"
                                                            : "Category"
                                                }
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell sx={bodyCellSx}>
                                            <Typography color="text.secondary">
                                                {row.discountType === "percentage"
                                                    ? `${row.discountValue}%`
                                                    : `₹${row.discountValue}`}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx}>
                                            <Typography color="text.secondary">
                                                {new Date(row.expiresAt).toLocaleDateString()}
                                            </Typography>
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

export default Coupons;