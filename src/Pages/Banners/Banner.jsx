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
import { useNavigate } from "react-router-dom";
import { deleteData, getData } from "../../Axios/axios";

const headCellSx = {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#9f6f8d",
    bgcolor: "#faf4f8",
    borderBottom: "1px solid #eee3ea",
    py: 1.5,
    px: 2,
};

const bodyCellSx = {
    borderBottom: "1px solid #f1e7ed",
    py: 1.5,
    px: 2,
    verticalAlign: "middle",
};

const Banners = () => {
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const fetchBanners = async (withLoader = false) => {
        try {
            setApiError("");
            if (withLoader) setTableLoading(true);
            else setLoading(true);
            const response = await getData("/cms/banners");
            setRows(response?.data || []);
        } catch (error) {
            setApiError(error?.message || "Failed to fetch banners");
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleAdd = () => navigate("/cms/banners/add");
    const handleEdit = (row) => navigate(`/cms/banners/edit/${row.id}`);

    const handleDelete = async (row) => {
        const confirmed = window.confirm(`Delete banner "${row.title}"?`);
        if (!confirmed) return;
        try {
            setApiError("");
            setSuccessMsg("");
            await deleteData(`/cms/banners/${row.id}`);
            setSuccessMsg("Banner deleted successfully");
            fetchBanners(true);
        } catch (error) {
            setApiError(error?.message || "Failed to delete banner");
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
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                sx={{ mb: 2.5, width: "100%" }}
            >
                {/* LEFT */}
                <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                    <Typography variant="h5" fontWeight={700}>
                        Banners
                    </Typography>
                </Box>

                {/* RIGHT */}
                <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        onClick={handleAdd}
                        size="small"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            px: 2,
                            py: 0.75,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            minWidth: "unset",
                            lineHeight: 1.5,
                        }}
                    >
                        Add Banner
                    </Button>
                </Box>
            </Stack>

            {apiError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError("")}>
                    {apiError}
                </Alert>
            )}

            {successMsg && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>
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
                    <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ ...headCellSx, width: 110 }}>Image</TableCell>
                                <TableCell sx={{ ...headCellSx, width: "auto" }}>Title</TableCell>
                                <TableCell sx={{ ...headCellSx, width: 120 }}>Status</TableCell>
                                <TableCell align="right" sx={{ ...headCellSx, width: 110 }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {tableLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ py: 6 }}>
                                        <Box sx={{ display: "grid", placeItems: "center" }}>
                                            <CircularProgress size={28} />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ py: 6 }}>
                                        <Typography align="center" color="text.secondary">
                                            No banners found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        hover
                                        sx={{ "&:last-child td": { borderBottom: "none" } }}
                                    >
                                        <TableCell sx={bodyCellSx}>
                                            <Avatar
                                                src={row.imageUrl || ""}
                                                alt={row.title}
                                                variant="rounded"
                                                sx={{
                                                    width: 76,
                                                    height: 48,
                                                    borderRadius: 2,
                                                    bgcolor: "#f3e8f0",
                                                    fontSize: "1rem",
                                                    fontWeight: 700,
                                                    color: "#9f6f8d",
                                                }}
                                            >
                                                {row.title?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx}>
                                            <Typography
                                                fontWeight={600}
                                                fontSize="0.875rem"
                                                color="#3d0b39"
                                                noWrap
                                            >
                                                {row.title}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx}>
                                            <Chip
                                                label={row.isActive ? "Active" : "Inactive"}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: "0.72rem",
                                                    height: 24,
                                                    bgcolor: row.isActive ? "#e7f4ec" : "#f8e8e5",
                                                    color: row.isActive ? "#23935a" : "#c73d2b",
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell align="right" sx={bodyCellSx}>
                                            <Stack
                                                direction="row"
                                                spacing={0.75}
                                                justifyContent="flex-end"
                                                alignItems="center"
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEdit(row)}
                                                    sx={{
                                                        border: "1px solid #eadce5",
                                                        borderRadius: 1.5,
                                                        p: 0.75,
                                                        color: "#5a3d55",
                                                        "&:hover": { bgcolor: "#f3e8f0" },
                                                    }}
                                                >
                                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                                </IconButton>

                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(row)}
                                                    sx={{
                                                        border: "1px solid #f2d9d5",
                                                        borderRadius: 1.5,
                                                        p: 0.75,
                                                        color: "#c73d2b",
                                                        "&:hover": { bgcolor: "#fdf0ee" },
                                                    }}
                                                >
                                                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
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

export default Banners;