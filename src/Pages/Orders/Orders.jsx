import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  MenuItem,
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
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { getData, putData } from "../../Axios/axios";

const colors = {
  pageBg: "#f7f2f5",
  white: "#ffffff",
  heading: "#5a083b",
  text: "#32102d",
  subText: "#9a6f8f",
  border: "#eadce5",
  chipPendingBg: "#f4e4bf",
  chipPendingText: "#b97700",
  chipProcessingBg: "#dde8f7",
  chipProcessingText: "#1f5faa",
  chipDeliveredBg: "#dff0e8",
  chipDeliveredText: "#1c8c5e",
  chipCancelledBg: "#f5dfdb",
  chipCancelledText: "#c53f2f",
  actionBtn: "#7a1f6f",
};

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packing", label: "Packing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusChipStyle = (status) => {
  switch (status) {
    case "pending":
    case "placed":
    case "confirmed":
    case "packing":
      return {
        bgcolor: colors.chipPendingBg,
        color: colors.chipPendingText,
      };
    case "processing":
    case "shipped":
      return {
        bgcolor: colors.chipProcessingBg,
        color: colors.chipProcessingText,
      };
    case "delivered":
      return {
        bgcolor: colors.chipDeliveredBg,
        color: colors.chipDeliveredText,
      };
    case "cancelled":
      return {
        bgcolor: colors.chipCancelledBg,
        color: colors.chipCancelledText,
      };
    default:
      return {
        bgcolor: "#eee",
        color: "#555",
      };
  }
};

const formatStatus = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const StepCircle = ({ active, done, number, label }) => (
  <Stack alignItems="center" spacing={1} sx={{ minWidth: 90 }}>
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontWeight: 700,
        fontSize: 14,
        border: done || active ? "2px solid #d18f1d" : "2px solid #e4d7e1",
        bgcolor: done ? "#7a1f6f" : active ? "#fff" : "#f4edf2",
        color: done ? "#fff" : active ? "#d18f1d" : "#ab8ea3",
      }}
    >
      {done ? "✓" : number}
    </Box>
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: active || done ? 600 : 500,
        color: active ? "#d18f1d" : done ? "#5a083b" : "#ab8ea3",
      }}
    >
      {label}
    </Typography>
  </Stack>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [detailStatus, setDetailStatus] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setApiError("");

      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (status) query.append("status", status);

      const res = await getData(`/orders?${query.toString()}`);
      setOrders(res?.data?.rows || []);
    } catch (error) {
      setApiError(error?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderById = async (id) => {
    try {
      const res = await getData(`/orders/${id}`);
      setSelectedOrder(res?.data || null);
      setDetailStatus(res?.data?.status || "");
      setOpen(true);
    } catch (error) {
      setApiError(error?.message || "Failed to fetch order details");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    return orders.filter(
      (item) =>
        item.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        item.customerName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);

  const exportCsv = () => {
    const headers = [
      "Order Number",
      "Customer",
      "Location",
      "Items",
      "Total",
      "Status",
      "Date",
    ];

    const rows = filteredOrders.map((item) => [
      item.orderNumber,
      item.customerName,
      item.location,
      item.itemsText,
      item.totalAmount,
      item.status,
      new Date(item.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "orders.csv";
    link.click();
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder?.id) return;

    try {
      setUpdating(true);
      await putData(`/orders/${selectedOrder.id}/status`, { status: detailStatus });
      await fetchOrderById(selectedOrder.id);
      await fetchOrders();
    } catch (error) {
      setApiError(error?.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const stepOrder = ["placed", "confirmed", "packing", "shipped", "delivered"];
  const currentStepIndex = stepOrder.indexOf(selectedOrder?.status);

  return (
    <Box sx={{ p: 2.5, bgcolor: colors.pageBg, minHeight: "100vh" }}>
      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ mb: 3 }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1 }}>
          <TextField
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
            InputProps={{
              startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: colors.subText }} />,
            }}
            sx={{
              minWidth: 280,
              bgcolor: "#fff",
              borderRadius: 2,
            }}
          />

          <TextField
            select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{
              minWidth: 200,
              bgcolor: "#fff",
              borderRadius: 2,
            }}
          >
            {statusOptions.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<DownloadOutlinedIcon />}
          onClick={exportCsv}
          sx={{
            textTransform: "none",
            borderRadius: 2.5,
            px: 2.5,
            bgcolor: "#fff",
          }}
        >
          Export CSV
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${colors.border}`,
          overflow: "hidden",
          bgcolor: colors.white,
        }}
      >
        {loading ? (
          <Box sx={{ p: 6, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f5edf2" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: colors.subText }}>ORDER ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.subText }}>CUSTOMER</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.subText }}>ITEMS</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.subText }}>TOTAL</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.subText }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.subText }}>DATE</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.subText }}>ACTION</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredOrders.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: colors.heading }}>
                        #{row.orderNumber}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "#e9eef7", color: "#1c5daa", fontWeight: 700 }}>
                          {row.customerName?.slice(0, 2)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: colors.text }}>
                            {row.customerName}
                          </Typography>
                          <Typography sx={{ color: colors.subText, fontSize: 14 }}>
                            {row.location}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography>{row.itemsText}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 800 }}>
                        ${Number(row.totalAmount).toFixed(2)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`• ${formatStatus(row.status)}`}
                        sx={{
                          ...getStatusChipStyle(row.status),
                          fontWeight: 700,
                          borderRadius: "999px",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {new Date(row.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => fetchOrderById(row.id)}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2.5,
                          bgcolor: colors.actionBtn,
                          minWidth: 72,
                          "&:hover": {
                            bgcolor: colors.actionBtn,
                          },
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ bgcolor: colors.heading, color: "#f4c14d", px: 4, py: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 22, fontWeight: 500, fontFamily: "serif" }}>
              Order #{selectedOrder?.orderNumber} — Detail
            </Typography>
            <IconButton onClick={() => setOpen(false)} sx={{ color: "#d9a23f" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 4, bgcolor: "#fff" }}>
          {selectedOrder && (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={0}
                sx={{ mb: 4, overflowX: "auto" }}
              >
                {stepOrder.map((step, index) => (
                  <React.Fragment key={step}>
                    <StepCircle
                      number={index + 1}
                      label={formatStatus(step)}
                      done={index < currentStepIndex}
                      active={index === currentStepIndex}
                    />
                    {index !== stepOrder.length - 1 && (
                      <Box
                        sx={{
                          width: 50,
                          height: 2,
                          bgcolor: index < currentStepIndex ? "#7a1f6f" : "#e8dde5",
                          mt: -3,
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#f8f1f6",
                  mb: 3,
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.subText, mb: 1 }}>
                  CUSTOMER
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                  {selectedOrder.User?.name}
                </Typography>
                <Typography sx={{ color: colors.subText, mt: 0.5 }}>
                  {selectedOrder.User?.email} · {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                </Typography>
              </Paper>

              <TableContainer sx={{ mb: 3 }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#f7eef4" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: colors.subText }}>ITEM</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.subText }}>QTY</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.subText }}>PRICE</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedOrder.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.Product?.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}

                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Shipping</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>$0.00</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Total</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: colors.heading }}>
                        ${Number(selectedOrder.totalAmount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.subText, mb: 1 }}>
                UPDATE STATUS
              </Typography>

              <TextField
                select
                fullWidth
                value={detailStatus}
                onChange={(e) => setDetailStatus(e.target.value)}
                sx={{ mb: 4 }}
              >
                {statusOptions
                  .filter((item) => item.value)
                  .map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
              </TextField>

              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => setOpen(false)}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 3,
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 3,
                    bgcolor: colors.actionBtn,
                    "&:hover": {
                      bgcolor: colors.actionBtn,
                    },
                  }}
                >
                  {updating ? "Updating..." : "Update Order"}
                </Button>
              </Stack>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Orders;