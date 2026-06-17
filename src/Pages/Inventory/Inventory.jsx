
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    MenuItem,
    Chip,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { getData, patchData, postData } from "../../Axios/axios";

const colors = {
    pageBg: "#f6f1f4",
    white: "#ffffff",
    border: "#e6dbe2",
    heading: "#3d0b39",
    subText: "#9f6f8d",
    purple: "#7d1f6d",
    gold: "#e2a128",
    green: "#23935a",
    red: "#c73d2b",
    softPurple: "#f1e6ee",
    softGold: "#f7efdf",
    softGreen: "#e5f1e9",
    softRed: "#f8e8e5",
    mutedLine: "#eee3ea"
};

const headCellSx = {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.subText,
    bgcolor: "#faf4f8",
    borderBottom: `1px solid ${colors.mutedLine}`
};

const bodyCellSx = {
    borderBottom: `1px solid ${colors.mutedLine}`,
    py: 2
};

const MetricCard = ({ title, value, subValue, subColor, topColor, icon, iconBg }) => (
    <Paper elevation={0} sx={{ width: "100%", minHeight: 130, borderRadius: "14px", border: `1px solid ${colors.border}`, bgcolor: colors.white, position: "relative", overflow: "hidden", p: "1rem", boxSizing: "border-box" }}>
        <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, bgcolor: topColor }} />
        <Box sx={{ pr: "60px", width: "100%" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: colors.subText, mb: 1 }}>{title}</Typography>
            <Typography sx={{ fontSize: { xs: 26, md: 32 }, lineHeight: 1, fontWeight: 500, color: colors.heading, fontFamily: "serif", mb: 0.8 }}>{value}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: subColor }}>{subValue}</Typography>
        </Box>
        <Box sx={{ position: "absolute", right: "1.25rem", top: "50%", transform: "translateY(-50%)", width: 42, height: 42, borderRadius: "10px", bgcolor: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
            {icon}
        </Box>
    </Paper>
);

const Inventory = () => {
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [dashboardData, setDashboardData] = useState(null);

    const loadInventory = async (withTableLoader = false) => {
        try {
            setApiError("");
            if (withTableLoader) setTableLoading(true);
            else setLoading(true);

            const response = await getData("/inventory/dashboard");
            setDashboardData(response?.data || null);
        } catch (error) {
            setApiError(error?.message || "Failed to load inventory");
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const handleUpdateStock = async (row) => {
        const value = window.prompt("Enter new stock value", String(row.stock));
        if (value === null) return;
        try {
            setApiError("");
            setSuccessMsg("");
            await patchData(`/inventory/products/${row.productId}/stock`, { stock: Number(value) });
            setSuccessMsg("Stock updated successfully");
            loadInventory(true);
        } catch (error) {
            setApiError(error?.message || "Failed to update stock");
        }
    };

    const handleReorderOne = async (row) => {
        const newStock = Number(row.stock) + Number(row.reorderPoint || 20);
        try {
            setApiError("");
            setSuccessMsg("");
            await patchData(`/inventory/products/${row.productId}/stock`, { stock: newStock });
            setSuccessMsg("Item reordered successfully");
            loadInventory(true);
        } catch (error) {
            setApiError(error?.message || "Failed to reorder item");
        }
    };

    const handleReorderLowItems = async () => {
        try {
            setApiError("");
            setSuccessMsg("");
            await postData("/inventory/reorder-low-items", {});
            setSuccessMsg("Low stock items reordered successfully");
            loadInventory(true);
        } catch (error) {
            setApiError(error?.message || "Failed to reorder low stock items");
        }
    };

    const summary = dashboardData?.summary || { inStockItems: 0, lowStockAlerts: 0, outOfStock: 0 };
    const rows = dashboardData?.rows || [];

    const metricCards = useMemo(() => [
        { title: "In Stock Items", value: summary.inStockItems, subValue: "▲ Healthy", subColor: colors.green, topColor: colors.green, iconBg: colors.softGreen, icon: <Inventory2OutlinedIcon sx={{ color: colors.green }} /> },
        { title: "Low Stock Alerts", value: summary.lowStockAlerts, subValue: "▼ Reorder soon", subColor: colors.red, topColor: colors.gold, iconBg: colors.softGold, icon: <WarningAmberOutlinedIcon sx={{ color: colors.gold }} /> },
        { title: "Out of Stock", value: summary.outOfStock, subValue: "▼ Urgent", subColor: colors.red, topColor: colors.red, iconBg: colors.softRed, icon: <BlockOutlinedIcon sx={{ color: colors.red }} /> }
    ], [summary]);

    if (loading) {
        return <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ bgcolor: colors.pageBg }}>
            <Grid container spacing={3} alignItems="stretch">
                {metricCards.map((card) => (
                    <Grid size={{ xs: 12, md: 4 }} key={card.title} sx={{ display: "flex" }}>
                        <MetricCard {...card} />
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 3 }}>
                {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
                {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
            </Box>

            <Paper elevation={0} sx={{ mt: 1, borderRadius: "12px", border: `1px solid ${colors.border}`, overflow: "hidden", bgcolor: colors.white }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ px: 3.5, py: 2.8 }}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <Typography sx={{ fontSize: 20 }}>📦</Typography>
                        <Typography sx={{ fontSize: 22, fontWeight: 700, color: colors.heading }}>Inventory Status</Typography>
                    </Stack>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" onClick={handleReorderLowItems} sx={{ textTransform: "none", borderRadius: 2.5, px: 2.5 }}>Reorder Low Items</Button>
                    </Box>
                </Stack>

                <Box sx={{ borderTop: `1px solid ${colors.mutedLine}` }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={headCellSx}>Product</TableCell>
                                    <TableCell sx={headCellSx}>Category</TableCell>
                                    <TableCell sx={headCellSx}>In Stock</TableCell>
                                    <TableCell sx={headCellSx}>Reorder Point</TableCell>
                                    <TableCell sx={headCellSx}>Level</TableCell>
                                    <TableCell sx={headCellSx}>Status</TableCell>
                                    <TableCell align="right" sx={headCellSx}>Action</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {tableLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ py: 6 }}>
                                            <Box sx={{ display: "grid", placeItems: "center" }}><CircularProgress size={28} /></Box>
                                        </TableCell>
                                    </TableRow>
                                ) : rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ py: 6 }}>
                                            <Typography align="center" color="text.secondary">No inventory items found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row) => {
                                        const statusLabel = row.status === "out_of_stock" ? "Out of Stock" : row.status === "low_stock" ? "Low Stock" : "In Stock";
                                        const statusStyles = row.status === "out_of_stock"
                                            ? { bgcolor: "#f8e8e5", color: colors.red }
                                            : row.status === "low_stock"
                                                ? { bgcolor: "#f7efdf", color: "#c68412" }
                                                : { bgcolor: "#e7f4ec", color: colors.green };

                                        return (
                                            <TableRow key={row.id} hover>
                                                <TableCell sx={bodyCellSx}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Avatar src={row.productImage || ""} alt={row.productName} variant="rounded" sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "#f3e8f0" }}>
                                                            {row.productName?.charAt(0)?.toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ color: colors.heading, fontWeight: 700, fontSize: 16 }}>{row.productName}</Typography>
                                                            <Typography sx={{ color: colors.subText, fontSize: 13 }}>{row.sku || "-"}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell sx={bodyCellSx}><Typography color={colors.heading}>{row.categoryName}</Typography></TableCell>

                                                <TableCell sx={bodyCellSx}>
                                                    <Typography sx={{ color: row.status === "out_of_stock" ? colors.red : colors.heading, fontWeight: 700, fontSize: 16 }}>{row.stock}</Typography>
                                                </TableCell>

                                                <TableCell sx={bodyCellSx}><Typography color={colors.heading}>{row.reorderPoint}</Typography></TableCell>

                                                <TableCell sx={bodyCellSx} width={180}>
                                                    <LinearProgress variant="determinate" value={row.levelPercent} sx={{ height: 8, borderRadius: 999, bgcolor: "#eadce5", "& .MuiLinearProgress-bar": { borderRadius: 999, background: row.status === "out_of_stock" ? colors.red : row.status === "low_stock" ? colors.gold : colors.green } }} />
                                                </TableCell>

                                                <TableCell sx={bodyCellSx}>
                                                    <Chip label={statusLabel} size="small" sx={{ fontWeight: 700, ...statusStyles }} />
                                                </TableCell>

                                                <TableCell align="right" sx={bodyCellSx}>
                                                    {row.status === "in_stock" ? (
                                                        <Button variant="outlined" onClick={() => handleUpdateStock(row)} sx={{ textTransform: "none", borderRadius: 2.5 }}>Update</Button>
                                                    ) : (
                                                        <Button variant="contained" onClick={() => handleReorderOne(row)} sx={{ textTransform: "none", borderRadius: 2.5 }}>Reorder</Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>
        </Box>
    );
};

export default Inventory;