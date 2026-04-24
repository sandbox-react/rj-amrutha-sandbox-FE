import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Select,
  MenuItem,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Avatar,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Bar, Pie } from "react-chartjs-2";
import * as XLSX from "xlsx";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const colors = {
  pageBg: "#f7f2f5",
  heading: "#5f1431",
  subText: "#8b6480",
  card1: "#fdf0f6",
  card2: "#eef5ff",
  card3: "#edf9f2",
  card4: "#fff3e8",
};

const pieColors = ["#7a1f5c", "#e1a11d", "#3b82f6", "#1f9d62", "#d14343", "#8b5cf6"];

const SalesDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [filters, setFilters] = useState({
    filterType: "monthly",
    fromDate: "",
    toDate: "",
  });

  const fetchData = async (isFilter = false) => {
    try {
      setApiError("");
      if (isFilter) setFilterLoading(true);
      else setLoading(true);

      const params = { filterType: filters.filterType };
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;

      const res = await getData("/analytics/sales-dashboard", params);
      setData(res.data);
    } catch (error) {
      setApiError(error?.message || "Failed to fetch sales dashboard");
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = () => fetchData(true);

  const handleReset = () => {
    setFilters({ filterType: "monthly", fromDate: "", toDate: "" });
    setTimeout(() => fetchData(true), 0);
  };

  const handleExportExcel = () => {
    if (!data) return;

    const rows = [];

    rows.push(["SALES DASHBOARD REPORT"]);
    rows.push([]);

    rows.push(["SUMMARY"]);
    rows.push(["Metric", "Value"]);
    rows.push(["Revenue", Number(data?.summary?.revenue || 0)]);
    rows.push(["Orders", Number(data?.summary?.orders || 0)]);
    rows.push(["Delivered", Number(data?.summary?.delivered || 0)]);
    rows.push(["Cancelled", Number(data?.summary?.cancelled || 0)]);
    rows.push(["Filter Type", filters.filterType]);
    rows.push(["From Date", filters.fromDate || "-"]);
    rows.push(["To Date", filters.toDate || "-"]);
    rows.push([]);

    rows.push(["REVENUE TREND"]);
    rows.push(["Date", "Revenue"]);
    (data?.trend || []).forEach((item) => {
      rows.push([item.date, Number(item.revenue || 0)]);
    });
    rows.push([]);

    rows.push(["PRODUCTS"]);
    rows.push([
      "Product ID",
      "Product",
      "SKU",
      "Image URL",
      "Units Sold",
      "Unit Cost",
      "Tax Type",
      "Tax Value",
      "Tax Amount",
      "Total Cost",
      "Revenue",
    ]);

    (data?.topProducts || []).forEach((item) => {
      rows.push([
        item.productId,
        item.name,
        item.sku || "-",
        item.imageUrl || "-",
        Number(item.units || 0),
        Number(item.unitCost || 0),
        item.taxType || "-",
        Number(item.taxValue || 0),
        Number(item.taxAmount || 0),
        Number(item.totalCost || 0),
        Number(item.revenue || 0),
      ]);
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 24 },
      { wch: 16 },
      { wch: 35 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Dashboard");

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `sales-dashboard-${today}.xlsx`);
  };

  const chartData = useMemo(() => {
    return {
      labels:
        data?.trend?.map((d) =>
          String(d.date).includes("-Q")
            ? d.date
            : String(d.date).length === 7
              ? d.date
              : new Date(d.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })
        ) || [],
      datasets: [
        {
          label: "Revenue",
          data: data?.trend?.map((d) => d.revenue) || [],
          backgroundColor: [
            "#7a1f5c",
            "#9a3b73",
            "#b75488",
            "#d16f9f",
            "#e98ab6",
            "#f1a3c5",
            "#f7bed4",
            "#fbd0df",
            "#e1a11d",
            "#3b82f6",
            "#1f9d62",
            "#d14343",
            "#8b5cf6",
            "#06b6d4",
            "#f97316",
          ],
          borderRadius: 8,
        },
      ],
    };
  }, [data]);

  const pieChartData = useMemo(() => {
    return {
      labels: data?.topProducts?.map((item) => item.name) || [],
      datasets: [
        {
          data: data?.topProducts?.map((item) => item.revenue) || [],
          backgroundColor: pieColors,
          borderColor: "#ffffff",
          borderWidth: 2,
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          sx={{
            fontSize: { xs: 26, md: 32 },
            fontWeight: 700,
            color: colors.heading,
          }}
        >
          Sales Dashboard
        </Typography>

        <Button
          variant="contained"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={handleExportExcel}
          disabled={!data}
          sx={{
            height: 40,
            borderRadius: 2.5,
            textTransform: "none",
            bgcolor: colors.heading,
          }}
        >
          Export to Excel
        </Button>
      </Stack>

      {apiError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
          {apiError}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        mb={3}
        alignItems={{ md: "flex-end" }}
      >
        <Box sx={{ minWidth: 160 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.6, color: "#7a5a6f" }}>
            Filter Type
          </Typography>
          <Select
            value={filters.filterType}
            onChange={(e) => setFilters({ ...filters, filterType: e.target.value })}
            fullWidth
            size="small"
            sx={{ height: 40, borderRadius: 2.5, bgcolor: "#fff" }}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
            <MenuItem value="quarterly">Quarterly</MenuItem>
          </Select>
        </Box>

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

        <Box>
          <Typography sx={{ visibility: "hidden", mb: 0.6 }}>Action</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={filterLoading}
              sx={{ height: 40, borderRadius: 2.5, textTransform: "none", minWidth: 100 }}
            >
              {filterLoading ? "Loading..." : "Apply"}
            </Button>

            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{ height: 40, borderRadius: 2.5, textTransform: "none", minWidth: 90 }}
            >
              Reset
            </Button>
          </Stack>
        </Box>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 3 }}>
          <Card sx={{ borderRadius: 4, bgcolor: colors.card1, boxShadow: "none" }}>
            <CardContent>
              <Typography color={colors.subText}>Total Revenue</Typography>
              <Typography variant="h5" sx={{ color: colors.heading, fontWeight: 700 }}>
                ₹{Number(data?.summary?.revenue || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Card sx={{ borderRadius: 4, bgcolor: colors.card2, boxShadow: "none" }}>
            <CardContent>
              <Typography color={colors.subText}>Orders</Typography>
              <Typography variant="h5" sx={{ color: colors.heading, fontWeight: 700 }}>
                {data?.summary?.orders || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Card sx={{ borderRadius: 4, bgcolor: colors.card3, boxShadow: "none" }}>
            <CardContent>
              <Typography color={colors.subText}>Delivered</Typography>
              <Typography variant="h5" sx={{ color: colors.heading, fontWeight: 700 }}>
                {data?.summary?.delivered || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Card sx={{ borderRadius: 4, bgcolor: colors.card4, boxShadow: "none" }}>
            <CardContent>
              <Typography color={colors.subText}>Cancelled</Typography>
              <Typography variant="h5" sx={{ color: colors.heading, fontWeight: 700 }}>
                {data?.summary?.cancelled || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 8 }}>
          <Card sx={{ mt: 3, borderRadius: 4, boxShadow: "none" }}>
            <CardContent>
              <Typography mb={2} sx={{ fontWeight: 700, color: colors.heading }}>
                Revenue Trend
              </Typography>
              <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Card sx={{ mt: 3, borderRadius: 4, boxShadow: "none" }}>
            <CardContent>
              <Typography mb={2} sx={{ fontWeight: 700, color: colors.heading }}>
                Top Products Revenue Split
              </Typography>
              <Pie data={pieChartData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3, borderRadius: 4, boxShadow: "none" }}>
        <CardContent>
          <Typography mb={2} sx={{ fontWeight: 700, color: colors.heading }}>
            Top Selling Products
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Units Sold</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Unit Cost</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tax</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tax Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Cost</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data?.topProducts?.length ? (
                  data.topProducts.map((item, index) => (
                    <TableRow key={`${item.name}-${index}`} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Avatar
                            src={item.imageUrl || ""}
                            alt={item.name}
                            variant="rounded"
                            sx={{ width: 40, height: 40, borderRadius: 2 }}
                          >
                            {item.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                            <Typography sx={{ fontSize: 12, color: colors.subText }}>
                              {item.sku || "-"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>{item.units}</TableCell>
                      <TableCell>₹{Number(item.unitCost || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {item.taxType
                          ? item.taxType === "percentage"
                            ? `${Number(item.taxValue || 0)}%`
                            : `₹${Number(item.taxValue || 0).toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell>₹{Number(item.taxAmount || 0).toFixed(2)}</TableCell>
                      <TableCell>₹{Number(item.totalCost || 0).toFixed(2)}</TableCell>
                      <TableCell>₹{Number(item.revenue || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={index === 0 ? "Top Seller" : "Selling"}
                          color={index === 0 ? "success" : "primary"}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No product data found
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

export default SalesDashboard;