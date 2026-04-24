import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Chip,
    Avatar,
    Divider,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { getData } from "../../Axios/axios";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

const colors = {
    pageBg: "#f7f2f5",
    white: "#ffffff",
    border: "#eadfe5",
    heading: "#5f1431",
    subText: "#8b6480",
    muted: "#a88aa0",
    softPink: "#fdf0f6",
    softGold: "#fff6df",
    softBlue: "#eef5ff",
    softGreen: "#edf9f2",
    softRed: "#fff0f0",
    purple: "#7a1f5c",
    gold: "#e1a11d",
    blue: "#3b82f6",
    green: "#1f9d62",
    red: "#d14343",
};

const cardStyle = {
    borderRadius: "12px",
    border: `1px solid ${colors.border}`,
    boxShadow: "none",
    height: "100%",
};

const tableHeadSx = {
    fontWeight: 700,
    color: colors.subText,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: `1px solid ${colors.border}`,
    bgcolor: "#fbf8fa",
};

const MetricCard = ({ title, value, subtitle, icon, topColor, iconBg }) => {
    return (
        <Card sx={{ ...cardStyle, overflow: "hidden", position: "relative" }}>
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: 4,
                    bgcolor: topColor,
                }}
            />
            <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: colors.subText,
                                textTransform: "uppercase",
                                letterSpacing: 1.5,
                                mb: 1,
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 32,
                                fontWeight: 700,
                                color: colors.heading,
                                lineHeight: 1.1,
                            }}
                        >
                            {value}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.8 }}>
                            {subtitle}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: 58,
                            height: 58,
                            borderRadius: "18px",
                            bgcolor: iconBg,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

const ProductDashboard = () => {
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        categoryId: "",
    });

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const fetchCategories = async () => {
        try {
            const response = await getData("/categories");
            setCategories(response?.data || []);
        } catch {
            setCategories([]);
        }
    };

    const fetchDashboard = async (isFilterAction = false) => {
        try {
            setApiError("");
            if (isFilterAction) setFilterLoading(true);
            else setLoading(true);

            const params = {};
            if (filters.fromDate) params.fromDate = filters.fromDate;
            if (filters.toDate) params.toDate = filters.toDate;
            if (filters.categoryId) params.categoryId = filters.categoryId;

            const response = await getData("/products/dashboard/summary", params);
            setDashboard(response?.data || null);
        } catch (error) {
            setApiError(error?.message || "Failed to load product dashboard");
        } finally {
            setLoading(false);
            setFilterLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterChange = (field) => (event) => {
        setFilters((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const handleApplyFilters = () => {
        fetchDashboard(true);
    };

    const handleResetFilters = () => {
        setFilters({
            fromDate: "",
            toDate: "",
            categoryId: "",
        });

        setTimeout(() => {
            fetchDashboard(true);
        }, 0);
    };

    const summary = dashboard?.summary || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        featuredProducts: 0,
        totalCategories: 0,
        totalStock: 0,
        lowStockCount: 0,
    };

    const topSellingProducts = dashboard?.topSellingProducts || [];
    const categorySales = dashboard?.categorySales || [];
    const lowStockProducts = dashboard?.lowStockProducts || [];
    const recentProducts = dashboard?.recentProducts || [];
    const mostSaleCategory = dashboard?.mostSaleCategory || null;

    const topProductsChartData = useMemo(() => {
        return {
            labels: topSellingProducts.map((item) => item.productName),
            datasets: [
                {
                    label: "Revenue",
                    data: topSellingProducts.map((item) => item.revenue),
                    borderWidth: 0,
                    borderRadius: 8,
                },
            ],
        };
    }, [topSellingProducts]);

    const categorySalesChartData = useMemo(() => {
        return {
            labels: categorySales.map((item) => item.categoryName),
            datasets: [
                {
                    label: "Category Revenue",
                    data: categorySales.map((item) => item.revenue),
                    borderWidth: 1,
                },
            ],
        };
    }, [categorySales]);

    if (loading) {
        return (
            <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: colors.pageBg, minHeight: "100%", p: { xs: 1, md: 0 } }}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize: { xs: 26, md: 32 },
                            fontWeight: 700,
                            color: colors.heading,
                            lineHeight: 1.1,
                        }}
                    >
                        Product Dashboard
                    </Typography>
                    <Typography sx={{ color: colors.subText, mt: 0.8 }}>
                        Track product performance, category sales, stock health, and recent catalog activity.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<RefreshOutlinedIcon />}
                    onClick={() => fetchDashboard(true)}
                    sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        px: 2.2,
                        height: 44,
                    }}
                >
                    Refresh
                </Button>
            </Stack>

            {apiError && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
                    {apiError}
                </Alert>
            )}

            {/* Filters */}
            <Card sx={{ ...cardStyle, mb: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ xs: "stretch", md: "flex-end" }}
                    >
                        {/* From Date */}
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#7a5a6f",
                                    mb: 0.6,
                                }}
                            >
                                From Date
                            </Typography>
                            <TextField
                                type="date"
                                value={filters.fromDate}
                                onChange={handleFilterChange("fromDate")}
                                fullWidth
                                size="small"
                                sx={{
                                    "& .MuiInputBase-root": {
                                        height: 40,
                                        borderRadius: 2.5,
                                        bgcolor: "#fff",
                                    },
                                }}
                            />
                        </Box>

                        {/* To Date */}
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#7a5a6f",
                                    mb: 0.6,
                                }}
                            >
                                To Date
                            </Typography>
                            <TextField
                                type="date"
                                value={filters.toDate}
                                onChange={handleFilterChange("toDate")}
                                fullWidth
                                size="small"
                                sx={{
                                    "& .MuiInputBase-root": {
                                        height: 40,
                                        borderRadius: 2.5,
                                        bgcolor: "#fff",
                                    },
                                }}
                            />
                        </Box>

                        {/* Category */}
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#7a5a6f",
                                    mb: 0.6,
                                }}
                            >
                                Category
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={filters.categoryId}
                                    onChange={handleFilterChange("categoryId")}
                                    displayEmpty
                                    sx={{
                                        height: 40,
                                        borderRadius: 2.5,
                                        bgcolor: "#fff",
                                    }}
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    {categories.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Buttons */}
                        <Stack direction="row" spacing={1.2} sx={{ alignSelf: "flex-end" }}>
                            <Button
                                variant="contained"
                                onClick={handleApplyFilters}
                                disabled={filterLoading}
                                sx={{
                                    borderRadius: 2.5,
                                    textTransform: "none",
                                    minWidth: 100,
                                    height: 40,
                                }}
                            >
                                {filterLoading ? "Loading..." : "Apply"}
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={handleResetFilters}
                                sx={{
                                    borderRadius: 2.5,
                                    textTransform: "none",
                                    minWidth: 80,
                                    height: 40,
                                }}
                            >
                                Reset
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Metrics */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Total Products"
                        value={summary.totalProducts}
                        subtitle="All catalog products"
                        topColor={colors.purple}
                        iconBg={colors.softPink}
                        icon={<Inventory2OutlinedIcon sx={{ color: colors.purple }} />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Active Products"
                        value={summary.activeProducts}
                        subtitle="Live and available"
                        topColor={colors.green}
                        iconBg={colors.softGreen}
                        icon={<LocalMallOutlinedIcon sx={{ color: colors.green }} />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Featured Products"
                        value={summary.featuredProducts}
                        subtitle="Homepage / featured items"
                        topColor={colors.gold}
                        iconBg={colors.softGold}
                        icon={<StarBorderOutlinedIcon sx={{ color: colors.gold }} />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Low Stock Count"
                        value={summary.lowStockCount}
                        subtitle="Requires attention"
                        topColor={colors.red}
                        iconBg={colors.softRed}
                        icon={<WarningAmberOutlinedIcon sx={{ color: colors.red }} />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MetricCard
                        title="Total Categories"
                        value={summary.totalCategories}
                        subtitle="Organized catalog groups"
                        topColor={colors.blue}
                        iconBg={colors.softBlue}
                        icon={<CategoryOutlinedIcon sx={{ color: colors.blue }} />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MetricCard
                        title="Total Stock"
                        value={summary.totalStock}
                        subtitle="Across active variants"
                        topColor={colors.green}
                        iconBg={colors.softGreen}
                        icon={<Inventory2OutlinedIcon sx={{ color: colors.green }} />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                    <MetricCard
                        title="Inactive Products"
                        value={summary.inactiveProducts}
                        subtitle="Disabled or archived"
                        topColor={colors.subText}
                        iconBg="#f4edf2"
                        icon={<InsightsOutlinedIcon sx={{ color: colors.subText }} />}
                    />
                </Grid>
            </Grid>

            {/* Charts + best category */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Card sx={cardStyle}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography sx={{ fontSize: 20, fontWeight: 700, color: colors.heading, mb: 2 }}>
                                Top Selling Products
                            </Typography>

                            {topSellingProducts.length ? (
                                <Box sx={{ height: 360 }}>
                                    <Bar
                                        data={topProductsChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                            },
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ py: 8, textAlign: "center", color: colors.subText }}>
                                    No product sales data available
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                    <Stack spacing={2.5} sx={{ height: "100%" }}>
                        <Card sx={cardStyle}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 700, color: colors.heading, mb: 2 }}>
                                    Category Sales Split
                                </Typography>

                                {categorySales.length ? (
                                    <Box sx={{ height: 260 }}>
                                        <Doughnut
                                            data={categorySalesChartData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: "bottom",
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ py: 6, textAlign: "center", color: colors.subText }}>
                                        No category sales data available
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        <Card sx={cardStyle}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 700, color: colors.heading, mb: 2 }}>
                                    Most Sale Category
                                </Typography>

                                {mostSaleCategory ? (
                                    <Stack spacing={1.5}>
                                        <Typography sx={{ fontSize: 24, fontWeight: 700, color: colors.purple }}>
                                            {mostSaleCategory.categoryName}
                                        </Typography>

                                        <Stack direction="row" spacing={1.2} flexWrap="wrap">
                                            <Chip
                                                label={`Revenue: ₹${mostSaleCategory.revenue}`}
                                                sx={{ fontWeight: 700 }}
                                            />
                                            <Chip
                                                label={`Units Sold: ${mostSaleCategory.unitsSold}`}
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </Stack>

                                        <Divider sx={{ my: 1 }} />

                                        <Typography sx={{ color: colors.subText }}>
                                            This category generated the highest sales in the selected date range.
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <Typography sx={{ color: colors.subText }}>
                                        No sales category data found.
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>

            {/* Low stock + recent products */}
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={cardStyle}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ p: 2.5 }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 700, color: colors.heading }}>
                                    Low Stock Products
                                </Typography>
                                <Typography sx={{ color: colors.subText, mt: 0.7 }}>
                                    Variants that need replenishment soon.
                                </Typography>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={tableHeadSx}>Product</TableCell>
                                            <TableCell sx={tableHeadSx}>Category</TableCell>
                                            <TableCell sx={tableHeadSx}>Variant</TableCell>
                                            <TableCell sx={tableHeadSx}>Stock</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {lowStockProducts.length ? (
                                            lowStockProducts.map((item) => (
                                                <TableRow key={item.id} hover>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1.2} alignItems="center">
                                                            <Avatar
                                                                src={item.imageUrl || ""}
                                                                alt={item.productName}
                                                                variant="rounded"
                                                                sx={{ width: 46, height: 46, borderRadius: 2 }}
                                                            >
                                                                {item.productName?.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 700, color: colors.heading }}>
                                                                    {item.productName}
                                                                </Typography>
                                                                <Typography sx={{ color: colors.subText, fontSize: 13 }}>
                                                                    {item.sku}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>{item.categoryName}</TableCell>
                                                    <TableCell>{item.variantLabel}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={item.stock}
                                                            color={item.stock <= 5 ? "error" : "warning"}
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 5, color: colors.subText }}>
                                                    No low stock products
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={cardStyle}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ p: 2.5 }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 700, color: colors.heading }}>
                                    Recent Products
                                </Typography>
                                <Typography sx={{ color: colors.subText, mt: 0.7 }}>
                                    Latest additions to your product catalog.
                                </Typography>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={tableHeadSx}>Product</TableCell>
                                            <TableCell sx={tableHeadSx}>Category</TableCell>
                                            <TableCell sx={tableHeadSx}>Price</TableCell>
                                            <TableCell sx={tableHeadSx}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentProducts.length ? (
                                            recentProducts.map((item) => (
                                                <TableRow key={item.id} hover>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1.2} alignItems="center">
                                                            <Avatar
                                                                src={item.imageUrl || ""}
                                                                alt={item.name}
                                                                variant="rounded"
                                                                sx={{ width: 46, height: 46, borderRadius: 2 }}
                                                            >
                                                                {item.name?.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 700, color: colors.heading }}>
                                                                    {item.name}
                                                                </Typography>
                                                                <Typography sx={{ color: colors.subText, fontSize: 13 }}>
                                                                    {item.sku}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>{item.categoryName}</TableCell>
                                                    <TableCell>₹{item.basePrice}</TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1}>
                                                            <Chip
                                                                label={item.isActive ? "Active" : "Inactive"}
                                                                color={item.isActive ? "success" : "default"}
                                                                variant="outlined"
                                                            />
                                                            {item.isFeatured && (
                                                                <Chip
                                                                    label="Featured"
                                                                    color="warning"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 5, color: colors.subText }}>
                                                    No recent products found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProductDashboard;