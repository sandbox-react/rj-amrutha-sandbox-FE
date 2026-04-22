import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
  LinearProgress,
} from "@mui/material";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import { getData } from "../../Axios/axios";

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
  paleSection: "#faf4f8",
  mutedLine: "#eee3ea",
};

const formatMoney = (value) => {
  const num = Number(value || 0);
  return `$${num.toLocaleString()}`;
};

const formatChangeText = (value) => {
  if (value === null || value === undefined) return "-";
  if (value > 0) return `▲ ${value}% vs last month`;
  if (value < 0) return `▼ ${Math.abs(value)}% vs last month`;
  return "0% vs last month";
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "-";
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;

  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

const MetricCard = ({
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

const RevenueBars = ({ labels = [], revenue = [], orders = [] }) => {
  const maxRevenue = Math.max(...revenue, 1);
  const maxOrders = Math.max(...orders, 1);

  return (
    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
      <Box
        sx={{
          height: 220,
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {labels.map((label, index) => {
          const revenueHeight = Math.max((Number(revenue[index] || 0) / maxRevenue) * 170, 8);
          const ordersHeight = Math.max((Number(orders[index] || 0) / maxOrders) * 130, 8);

          return (
            <Box
              key={label + index}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "end",
                gap: 1.2,
              }}
            >
              <Box
                sx={{
                  height: 170,
                  width: "100%",
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: revenueHeight,
                    bgcolor: colors.purple,
                    borderRadius: "10px",
                  }}
                />
                <Box
                  sx={{
                    width: 16,
                    height: ordersHeight,
                    bgcolor: colors.gold,
                    borderRadius: "10px",
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontSize: 14,
                  color: colors.subText,
                }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              bgcolor: colors.purple,
            }}
          />
          <Typography sx={{ color: colors.subText, fontSize: 15 }}>Revenue</Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              bgcolor: colors.gold,
            }}
          />
          <Typography sx={{ color: colors.subText, fontSize: 15 }}>Orders</Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

const MiniTrendBars = ({ values = [30, 36, 42, 48, 52, 58, 66, 74, 82, 90] }) => {
  const max = Math.max(...values, 1);

  return (
    <Stack direction="row" spacing={0.4} alignItems="end" sx={{ height: 54 }}>
      {values.map((item, index) => (
        <Box
          key={index}
          sx={{
            width: 3,
            height: `${Math.max((item / max) * 100, 10)}%`,
            bgcolor: colors.purple,
            borderRadius: "4px",
          }}
        />
      ))}
    </Stack>
  );
};

const ProductIconBox = ({ icon }) => {
  return (
    <Box
      sx={{
        width: 54,
        height: 54,
        borderRadius: "16px",
        bgcolor: colors.softPurple,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
      }}
    >
      {icon}
    </Box>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setApiError("");

    try {
      const response = await getData("/analytics/dashboard-summary");
      setDashboardData(response?.data || null);
    } catch (error) {
      setApiError(error?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const metricCards = useMemo(() => {
    const metrics = dashboardData?.metrics || {};

    return [
      {
        title: "Total Revenue",
        value: formatMoney(metrics.totalRevenue),
        subValue: formatChangeText(metrics.ordersThisMonthChange),
        subColor: colors.green,
        topColor: colors.purple,
        icon: "💰",
        iconBg: colors.softPurple,
      },
      {
        title: "Orders This Month",
        value: metrics.ordersThisMonth ?? 0,
        subValue: formatChangeText(metrics.ordersThisMonthChange),
        subColor: colors.green,
        topColor: colors.gold,
        icon: "🛒",
        iconBg: colors.softGold,
      },
      {
        title: "New Customers",
        value: metrics.newCustomers ?? 0,
        subValue: formatChangeText(metrics.newCustomersChange),
        subColor: colors.green,
        topColor: colors.green,
        icon: "👥",
        iconBg: colors.softGreen,
      },
      {
        title: "Pending Orders",
        value: metrics.pendingOrders ?? 0,
        subValue: (metrics.pendingOrders ?? 0) > 0 ? "▼ Need attention" : "-",
        subColor: (metrics.pendingOrders ?? 0) > 0 ? colors.red : colors.subText,
        topColor: colors.red,
        icon: "⏳",
        iconBg: colors.softRed,
      },
    ];
  }, [dashboardData]);

  const revenueOverview = dashboardData?.revenueOverview || {
    title: "Revenue Overview",
    labels: [],
    revenue: [],
    orders: [],
    summary: [],
  };

  const topSellingProducts = dashboardData?.topSellingProducts || [];
  const salesByCategory = dashboardData?.salesByCategory || [];
  const topStatesByOrders = dashboardData?.topStatesByOrders || [];
  const recentActivity = dashboardData?.recentActivity || [];

  const maxCategoryPercent = Math.max(...salesByCategory.map((item) => item.percent || 0), 1);
  const maxStateOrders = Math.max(...topStatesByOrders.map((item) => item.orders || 0), 1);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (apiError) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: "24px",
          border: `1px solid ${colors.border}`,
        }}
      >
        <Typography sx={{ color: colors.red, fontSize: 18, fontWeight: 700 }}>
          {apiError}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.pageBg }}>
      <Grid container spacing={1}>
        {metricCards.map((card) => (
          <Grid size={{xs:12,sm:3}} key={card.title}>
            <MetricCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1} sx={{ mt: 0.5 }}>
        <Grid size={{xs:12,sm:8}}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: `1px solid ${colors.border}`,
              overflow: "hidden",
              bgcolor: colors.white,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ px: 3.5, py: 2.8 }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                <TimelineOutlinedIcon sx={{ color: colors.purple }} />
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.heading,
                  }}
                >
                  {revenueOverview.title}
                </Typography>
              </Stack>

           
            </Stack>

            <Box sx={{ borderTop: `1px solid ${colors.mutedLine}` }}>
              <RevenueBars
                labels={revenueOverview.labels}
                revenue={revenueOverview.revenue}
                orders={revenueOverview.orders}
              />
            </Box>

            <Box
              sx={{
                mt: 1,
                px: 3,
                py: 3.2,
                bgcolor: colors.paleSection,
                borderTop: `1px solid ${colors.mutedLine}`,
              }}
            >
              <Grid container spacing={1}>
                {revenueOverview.summary?.map((item) => (
                  <Grid size={{xs:12,md:3}} key={item.label}>
                    <Box textAlign="center">
                      <Typography
                        sx={{
                          fontSize: 30,
                          color: colors.heading,
                          fontWeight: 700,
                        }}
                      >
                        {item.value}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.6,
                          fontSize: 14,
                          color: colors.subText,
                          letterSpacing: 2,
                          textTransform: "uppercase",
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{xs:12,sm:4}}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: `1px solid ${colors.border}`,
              overflow: "hidden",
              bgcolor: colors.white,
              height: "100%",
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ px: 3.5, py: 2.8 }}>
              <AccessTimeOutlinedIcon sx={{ color: colors.purple }} />
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: colors.heading,
                }}
              >
                Recent Activity
              </Typography>
            </Stack>

            <Box sx={{ borderTop: `1px solid ${colors.mutedLine}`, px: 3.5 }}>
              {recentActivity.length === 0 ? (
                <Typography sx={{ py: 4, color: colors.subText }}>
                  No recent activity available
                </Typography>
              ) : (
                recentActivity.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      py: 3,
                      borderBottom:
                        index !== recentActivity.length - 1
                          ? `1px solid ${colors.mutedLine}`
                          : "none",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          mt: 0.8,
                          width: 13,
                          height: 13,
                          borderRadius: "50%",
                          bgcolor: item.color || colors.purple,
                          flexShrink: 0,
                        }}
                      />

                      <Box>
                        <Typography
                          sx={{
                            fontSize: 17,
                            lineHeight: 1.55,
                            color: colors.heading,
                          }}
                        >
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {item.title}
                          </Box>{" "}
                          {item.description}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.8,
                            fontSize: 14,
                            color: colors.subText,
                          }}
                        >
                          {formatTimeAgo(item.time)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={1} sx={{ mt: 0.5 }}>
        <Grid size={{xs:12,sm:6}}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: `1px solid ${colors.border}`,
              overflow: "hidden",
              bgcolor: colors.white,
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ px: 3.5, py: 2.8 }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                <EmojiEventsOutlinedIcon sx={{ color: colors.gold }} />
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.heading,
                  }}
                >
                  Top Selling Products
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.gold,
                }}
              >
                View All
              </Typography>
            </Stack>

            <Box sx={{ borderTop: `1px solid ${colors.mutedLine}` }}>
              <Grid
                container
                sx={{
                  px: 3.5,
                  py: 2.2,
                  bgcolor: colors.paleSection,
                  borderBottom: `1px solid ${colors.mutedLine}`,
                }}
              >
                <Grid size={{xs:5}}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: colors.subText, letterSpacing: 3 }}>
                    PRODUCT
                  </Typography>
                </Grid>
                <Grid size={{xs:2}}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: colors.subText, letterSpacing: 3 }}>
                    UNITS SOLD
                  </Typography>
                </Grid>
                <Grid size={{xs:3}}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: colors.subText, letterSpacing: 3 }}>
                    REVENUE
                  </Typography>
                </Grid>
                <Grid size={{xs:2}}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: colors.subText, letterSpacing: 3 }}>
                    TREND
                  </Typography>
                </Grid>
              </Grid>

              {topSellingProducts.length === 0 ? (
                <Typography sx={{ p: 3.5, color: colors.subText }}>
                  No top selling products available
                </Typography>
              ) : (
                topSellingProducts.slice(0, 4).map((item, index) => (
                  <Grid
                    container
                    key={item.id || index}
                    sx={{
                      px: 3.5,
                      py: 2.3,
                      alignItems: "center",
                      borderBottom:
                        index !== Math.min(topSellingProducts.length, 4) - 1
                          ? `1px solid ${colors.mutedLine}`
                          : "none",
                    }}
                  >
                    <Grid size={{xs:5}}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <ProductIconBox icon={["🪙", "🥜", "🎁", "🌾"][index] || "📦"} />

                        <Box>
                          <Typography
                            sx={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: colors.heading,
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 14,
                              color: colors.subText,
                              mt: 0.3,
                            }}
                          >
                            {item.sku}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid size={{xs:2}}>
                      <Typography sx={{ fontSize: 18, color: colors.heading }}>
                        {item.unitsSold}
                      </Typography>
                    </Grid>

                    <Grid size={{xs:3}}>
                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: colors.purple,
                        }}
                      >
                        {formatMoney(item.revenue)}
                      </Typography>
                    </Grid>

                    <Grid size={{xs:2}}>
                      <MiniTrendBars />
                    </Grid>
                  </Grid>
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{xs:12,sm:6}}>
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
                overflow: "hidden",
                bgcolor: colors.white,
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ px: 3.5, py: 2.8 }}>
                <BarChartOutlinedIcon sx={{ color: colors.gold }} />
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.heading,
                  }}
                >
                  Sales by Category
                </Typography>
              </Stack>

              <Box sx={{ borderTop: `1px solid ${colors.mutedLine}`, px: 3.5, py: 3 }}>
                {salesByCategory.length === 0 ? (
                  <Typography sx={{ color: colors.subText }}>
                    No category sales available
                  </Typography>
                ) : (
                  <Stack spacing={3}>
                    {salesByCategory.map((item, index) => (
                      <Box key={index}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.2 }}>
                          <Typography
                            sx={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: colors.heading,
                            }}
                          >
                            {item.label}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 16,
                              color: colors.subText,
                            }}
                          >
                            {formatMoney(item.value)} · {item.percent}%
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={(Number(item.percent || 0) / maxCategoryPercent) * 100}
                          sx={{
                            height: 10,
                            borderRadius: 999,
                            bgcolor: "#eadce5",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 999,
                              background: `linear-gradient(90deg, ${colors.purple}, ${colors.gold})`,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
                overflow: "hidden",
                bgcolor: colors.white,
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ px: 3.5, py: 2.8 }}>
                <RoomOutlinedIcon sx={{ color: "#d85a8c" }} />
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.heading,
                  }}
                >
                  Top States by Orders
                </Typography>
              </Stack>

              <Box sx={{ borderTop: `1px solid ${colors.mutedLine}`, px: 3.5, py: 3 }}>
                {topStatesByOrders.length === 0 ? (
                  <Typography sx={{ color: colors.subText }}>
                    No state order data available
                  </Typography>
                ) : (
                  <Stack spacing={3}>
                    {topStatesByOrders.map((item, index) => (
                      <Box key={index}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.2 }}>
                          <Typography
                            sx={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: colors.heading,
                            }}
                          >
                            {item.label}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 16,
                              color: colors.subText,
                            }}
                          >
                            {item.orders} orders
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={(Number(item.orders || 0) / maxStateOrders) * 100}
                          sx={{
                            height: 10,
                            borderRadius: 999,
                            bgcolor: "#eadce5",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 999,
                              background: `linear-gradient(90deg, ${colors.purple}, ${colors.gold})`,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;