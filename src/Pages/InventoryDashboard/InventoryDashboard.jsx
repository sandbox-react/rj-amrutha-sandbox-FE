import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  MenuItem,
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
  CircularProgress,
  Chip,
  Grid,
} from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { getData } from "../../Axios/axios";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const colors = {
  pageBg: "#f7f2f5",
  white: "#ffffff",
  border: "#eadfe5",
  heading: "#5f1431",
  subText: "#8b6480",
  card1: "#fdf0f6",
  card2: "#eef5ff",
  card3: "#edf9f2",
  card4: "#fff3e8",
  card5: "#f3efff",
  card6: "#fff0f0",
};

const pieColors = ["#1f9d62", "#e1a11d", "#d14343"];

const InventoryDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    categoryId: "",
    status: "",
  });

  const fetchCategories = async () => {
    try {
      const res = await getData("/categories");
      setCategories(res?.data || []);
    } catch {
      setCategories([]);
    }
  };

  const fetchData = async (isFilter = false) => {
    try {
      setApiError("");
      if (isFilter) setFilterLoading(true);
      else setLoading(true);

      const params = {};
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.status) params.status = filters.status;

      const res = await getData("/inventory-dashboard", params);
      setData(res.data);
    } catch (error) {
      setApiError(error?.message || "Failed to fetch inventory dashboard");
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = () => {
    fetchData(true);
  };

  const handleReset = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      categoryId: "",
      status: "",
    });

    setTimeout(() => {
      fetchData(true);
    }, 0);
  };

  const pieData = useMemo(() => {
    return {
      labels: data?.stockStatusChart?.map((item) => item.label) || [],
      datasets: [
        {
          data: data?.stockStatusChart?.map((item) => item.value) || [],
          backgroundColor: pieColors,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  const barData = useMemo(() => {
    return {
      labels: data?.categoryStock?.map((item) => item.categoryName) || [],
      datasets: [
        {
          label: "Stock Units",
          data: data?.categoryStock?.map((item) => item.stock) || [],
          backgroundColor: ["#7a1f5c", "#9a3b73", "#b75488", "#3b82f6", "#1f9d62", "#e1a11d"],
          borderRadius: 8,
        },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ bgcolor: colors.pageBg, minHeight: "100%" }}>
      <Typography
        sx={{
          fontSize: { xs: 26, md: 32 },
          fontWeight: 700,
          color: colors.heading,
          mb: 2,
        }}
      >
        Inventory Dashboard
      </Typography>

      {apiError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
          {apiError}
        </Alert>
      )}

      {/* Filters */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        mb={3}
        alignItems={{ md: "flex-end" }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.6, color: "#7a5a6f" }}>
            From Date
          </Typography>
          <TextField
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
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

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.6, color: "#7a5a6f" }}>
            To Date
          </Typography>
          <TextField
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
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

        <Box sx={{ minWidth: 180 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.6, color: "#7a5a6f" }}>
            Category
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              displayEmpty
              sx={{ height: 40, borderRadius: 2.5, bgcolor: "#fff" }}
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

        <Box sx={{ minWidth: 180 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.6, color: "#7a5a6f" }}>
            Stock Status
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              displayEmpty
              sx={{ height: 40, borderRadius: 2.5, bgcolor: "#fff" }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="in_stock">In Stock</MenuItem>
              <MenuItem value="low_stock">Low Stock</MenuItem>
              <MenuItem value="out_of_stock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography sx={{ visibility: "hidden", mb: 0.6 }}>Action</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={filterLoading}
              sx={{
                height: 40,
                borderRadius: 2.5,
                textTransform: "none",
                minWidth: 100,
              }}
            >
              {filterLoading ? "Loading..." : "Apply"}
            </Button>

            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                height: 40,
                borderRadius: 2.5,
                textTransform: "none",
                minWidth: 90,
              }}
            >
              Reset
            </Button>
          </Stack>
        </Box>
      </Stack>

      {/* Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 2 }}>
          <Card sx={{ borderRadius: 4, bgcolor: colors.card1, boxShadow: "none" }}>
            <CardContent>
              <Typography color={colors.subText}>Total Items</Typography>
              <Typography variant="h5" sx={{ color: colors.heading, fontWeight: 700 }}>
                {data?.summary?.totalItems || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 2 }}>
          <Card sx={{ borderRadius: 4, bgcolor: colors.card2, boxShadow: "none" }}>
            <CardContent>
              <Typography color={colors.subText}>In Stock</Typography>
              <Typography variant="h5" sx={{ color: colors.heading, fontWeight: 700 }}>
                {data?.summary?.inStockItems || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 2 }}>
          <Card sx={{ borderRadius: 4, bgcolor: colors.card3, boxShadow: "none" }}>
            <CardContent>
              <Typography color={colors.subText}>Low Stock</Typography>
              <Typography variant="h5" sx={{ color: colors.heading, fontWeight: 700 }}>
                {data?.summary?.lowStockAlerts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 2 }}>
          <Card sx={{ borderRadius: 4, bgcolor: colors.card4, boxShadow: "none" }}>
            <CardContent>
              <Typography color={colors.subText}>Out of Stock</Typography>
              <Typography variant="h5" sx={{ color: colors.heading, fontWeight: 700 }}>
                {data?.summary?.outOfStock || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 2 }}>
          <Card sx={{ borderRadius: 4, bgcolor: colors.card5, boxShadow: "none" }}>
            <CardContent>
              <Typography color={colors.subText}>Stock Units</Typography>
              <Typography variant="h5" sx={{ color: colors.heading, fontWeight: 700 }}>
                {data?.summary?.totalStockUnits || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 2 }}>
          <Card sx={{ borderRadius: 4, bgcolor: colors.card6, boxShadow: "none" }}>
            <CardContent>
              <Typography color={colors.subText}>Adjustments</Typography>
              <Typography variant="h5" sx={{ color: colors.heading, fontWeight: 700 }}>
                {data?.summary?.movementAdjustment || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 4 }}>
          <Card sx={{ mt: 3, borderRadius: 4, boxShadow: "none" }}>
            <CardContent>
              <Typography mb={2} sx={{ fontWeight: 700, color: colors.heading }}>
                Stock Status Split
              </Typography>
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 8 }}>
          <Card sx={{ mt: 3, borderRadius: 4, boxShadow: "none" }}>
            <CardContent>
              <Typography mb={2} sx={{ fontWeight: 700, color: colors.heading }}>
                Category Wise Stock
              </Typography>
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Low stock rows */}
      <Card sx={{ mt: 3, borderRadius: 4, boxShadow: "none" }}>
        <CardContent>
          <Typography mb={2} sx={{ fontWeight: 700, color: colors.heading }}>
            Low / Out of Stock Items
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Variant</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.lowStockRows?.length ? (
                  data.lowStockRows.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Avatar
                            src={item.productImage || ""}
                            alt={item.productName}
                            variant="rounded"
                            sx={{ width: 42, height: 42, borderRadius: 2 }}
                          >
                            {item.productName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>{item.productName}</Typography>
                            <Typography sx={{ fontSize: 12, color: colors.subText }}>
                              {item.sku}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{item.categoryName}</TableCell>
                      <TableCell>{item.label}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status.replaceAll("_", " ")}
                          color={
                            item.status === "out_of_stock"
                              ? "error"
                              : item.status === "low_stock"
                              ? "warning"
                              : "success"
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No low stock records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent logs */}
      <Card sx={{ mt: 3, borderRadius: 4, boxShadow: "none" }}>
        <CardContent>
          <Typography mb={2} sx={{ fontWeight: 700, color: colors.heading }}>
            Recent Inventory Logs
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Variant</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Note</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.recentLogs?.length ? (
                  data.recentLogs.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.categoryName}</TableCell>
                      <TableCell>{item.variantLabel}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.type}
                          size="small"
                          color={
                            item.type === "in"
                              ? "success"
                              : item.type === "out"
                              ? "error"
                              : "warning"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.note || "-"}</TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No inventory logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventoryDashboard;