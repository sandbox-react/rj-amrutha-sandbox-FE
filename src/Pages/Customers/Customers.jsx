import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    InputAdornment,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { getData } from "../../Axios/axios";

const colors = {
    pageBg: "#f6f1f4",
    white: "#ffffff",
    heading: "#5f1338",
    subText: "#9a6f8f",
    border: "#e9dbe4",
    headerBg: "#f4ebf1",
    success: "#1a8f5b",
    warning: "#d08a1d",
    purple: "#7a1f6f",
    blue: "#1f5faa",
};

const StatCard = ({
    title,
    value,
    subValue,
    subColor,
    topColor,
    icon,
    iconBg,
}) => {
    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                minHeight: 130,
                borderRadius: "14px",
                border: `1px solid ${colors.border}`,
                bgcolor: colors.white,
                position: "relative",
                overflow: "hidden",
                p: "1rem",
                boxSizing: "border-box",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: 3,
                    bgcolor: topColor,
                }}
            />

            <Box sx={{ pr: "60px", width: "100%" }}>
                <Typography
                    sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: colors.subText,
                        mb: 1,
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    sx={{
                        fontSize: { xs: 26, md: 32 },
                        lineHeight: 1,
                        fontWeight: 500,
                        color: colors.heading,
                        fontFamily: "serif",
                        mb: 0.8,
                    }}
                >
                    {value}
                </Typography>

                <Typography
                    sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: subColor,
                    }}
                >
                    {subValue}
                </Typography>
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    right: "1.25rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 42,
                    height: 42,
                    borderRadius: "10px",
                    bgcolor: iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                }}
            >
                {icon}
            </Box>
        </Paper>
    );
};

const getAvatarColor = (index) => {
    const palette = [
        { bg: "#dfe8f7", color: "#1f5faa" },
        { bg: "#dff0e8", color: "#1a8f5b" },
        { bg: "#f1e4ef", color: "#8a2c6c" },
        { bg: "#f7eddc", color: "#c8870c" },
    ];
    return palette[index % palette.length];
};

const Customers = () => {
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");
    const [search, setSearch] = useState("");
    const [summary, setSummary] = useState({
        totalCustomers: 0,
        repeatCustomerRate: 0,
        avgOrderValue: 0,
    });
    const [customers, setCustomers] = useState([]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setApiError("");

            const query = new URLSearchParams();
            if (search.trim()) query.append("search", search.trim());

            const res = await getData(`/customers?${query.toString()}`);
            setSummary(res?.data?.summary || {});
            setCustomers(res?.data?.rows || []);
        } catch (error) {
            setApiError(error?.message || "Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!search.trim()) return customers;
        return customers.filter(
            (item) =>
                item.name?.toLowerCase().includes(search.toLowerCase()) ||
                item.email?.toLowerCase().includes(search.toLowerCase()) ||
                item.location?.toLowerCase().includes(search.toLowerCase())
        );
    }, [customers, search]);

    return (
        <Box sx={{ p: 2.5, bgcolor: colors.pageBg, minHeight: "100vh" }}>
            {apiError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {apiError}
                </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Total Customers"
                        value={summary.totalCustomers || 0}
                        subValue="▲ Customer base"
                        topColor={colors.purple}
                        icon={<GroupIcon sx={{ color: colors.purple, fontSize: 24 }} />}
                        iconBg="#efe5f1"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Repeat Customers"
                        value={`${summary.repeatCustomerRate || 0}%`}
                        subValue="▲ Loyalty up"
                        topColor={colors.warning}
                        icon={<StarIcon sx={{ color: "#d5a200", fontSize: 24 }} />}
                        iconBg="#f7f0d8"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Avg. Order Value"
                        value={`$${summary.avgOrderValue || 0}`}
                        subValue="▲ Growth"
                        topColor={colors.success}
                        icon={<CreditCardIcon sx={{ color: "#1299d6", fontSize: 24 }} />}
                        iconBg="#dff0eb"
                    />
                </Grid>
            </Grid>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: `1px solid ${colors.border}`,
                    overflow: "hidden",
                    bgcolor: colors.white,
                }}
            >
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "stretch", md: "center" }}
                    justifyContent="space-between"
                    sx={{
                        px: 3.5,
                        py: 2,
                        width: "100%",
                    }}
                >
                    {/* LEFT */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: { md: "flex-start" },
                            width: { xs: "100%", md: "50%" },
                        }}
                    >
                        <Stack direction="row" spacing={1.2} alignItems="center">
                            <GroupIcon sx={{ color: colors.purple }} />
                            <Typography
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: colors.heading,
                                }}
                            >
                                All Customers
                            </Typography>
                        </Stack>
                    </Box>

                    {/* RIGHT */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: { xs: "stretch", md: "flex-end" },
                            alignItems: "center",
                            width: { xs: "100%", md: "40%" },
                            mt: { xs: 1.5, md: 0 },
                        }}
                    >
                        <TextField
                            size="small"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{
                                width: { xs: "100%", md: 260 },
                                bgcolor: "#fff",
                                "& .MuiOutlinedInput-root": {
                                    height: 38,
                                    borderRadius: 2,
                                },
                                "& input": {
                                    py: "6px",
                                    fontSize: 13,
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlinedIcon sx={{ fontSize: 18, color: colors.subText }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Stack>

                {loading ? (
                    <Box sx={{ p: 6, display: "grid", placeItems: "center" }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: colors.headerBg }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: colors.subText }}>
                                        CUSTOMER
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: colors.subText }}>
                                        LOCATION
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: colors.subText }}>
                                        TOTAL ORDERS
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: colors.subText }}>
                                        TOTAL SPENT
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: colors.subText }}>
                                        LAST ORDER
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredCustomers.map((row, index) => {
                                    const avatarStyle = getAvatarColor(index);

                                    return (
                                        <TableRow key={row.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar
                                                        sx={{
                                                            width: 54,
                                                            height: 54,
                                                            bgcolor: avatarStyle.bg,
                                                            color: avatarStyle.color,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {row.name?.slice(0, 2)?.toUpperCase()}
                                                    </Avatar>

                                                    <Box>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: colors.heading,
                                                                fontSize: 16,
                                                            }}
                                                        >
                                                            {row.name}
                                                        </Typography>
                                                        <Typography sx={{ color: colors.subText, fontSize: 14 }}>
                                                            {row.email}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>

                                            <TableCell>
                                                <Typography sx={{ fontSize: 16 }}>{row.location || "-"}</Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                                                    {row.totalOrders}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: colors.purple,
                                                        fontSize: 16,
                                                    }}
                                                >
                                                    ${Number(row.totalSpent || 0).toLocaleString()}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {row.lastOrder
                                                    ? new Date(row.lastOrder).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })
                                                    : "-"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {filteredCustomers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                            No customers found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};

export default Customers;