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
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
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
  mutedLine: "#eee3ea",
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

const WeeklyTrendChart = ({ labels = [], thisWeek = [], lastWeek = [] }) => {
  const maxValue = Math.max(...thisWeek, ...lastWeek, 1);

  return (
    <Box sx={{ px: 3, pt: 3, pb: 3 }}>
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
          const thisHeight = Math.max((Number(thisWeek[index] || 0) / maxValue) * 170, 8);
          const lastHeight = Math.max((Number(lastWeek[index] || 0) / maxValue) * 130, 8);

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
                    height: thisHeight,
                    bgcolor: colors.purple,
                    borderRadius: "10px",
                  }}
                />
                <Box
                  sx={{
                    width: 16,
                    height: lastHeight,
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
          <Typography sx={{ color: colors.subText, fontSize: 15 }}>This Week</Typography>
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
          <Typography sx={{ color: colors.subText, fontSize: 15 }}>Last Week</Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setApiError("");

    try {
      const response = await getData("/analytics/page-summary");
      setAnalyticsData(response?.data || null);
    } catch (error) {
      setApiError(error?.message || "Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const metricCards = useMemo(() => {
    const metrics = analyticsData?.metrics || {};

    return [
      {
        title: "Conversion Rate",
        value: `${metrics.conversionRate || 0}%`,
        subValue: metrics.conversionRateChange !== undefined ? `▲ ${metrics.conversionRateChange}%` : "-",
        subColor: colors.green,
        topColor: colors.purple,
        icon: "📉",
        iconBg: colors.softPurple,
      },
      {
        title: "Avg Session",
        value: metrics.avgSession || "0m 00s",
        subValue: metrics.avgSessionChange !== undefined ? `▲ ${metrics.avgSessionChange}s` : "-",
        subColor: colors.green,
        topColor: colors.gold,
        icon: "⏱",
        iconBg: colors.softGold,
      },
      {
        title: "Return Rate",
        value: `${metrics.returnRate || 0}%`,
        subValue: metrics.returnRateChange !== undefined ? `▲ ${metrics.returnRateChange}%` : "-",
        subColor: colors.green,
        topColor: colors.green,
        icon: "🔄",
        iconBg: colors.softGreen,
      },
      {
        title: "Cart Abandonment",
        value: `${metrics.cartAbandonment || 0}%`,
        subValue: (metrics.cartAbandonment || 0) > 0 ? "▼ Needs attention" : "-",
        subColor: (metrics.cartAbandonment || 0) > 0 ? colors.red : colors.subText,
        topColor: colors.red,
        icon: "🛒",
        iconBg: colors.softRed,
      },
    ];
  }, [analyticsData]);

  const weeklyRevenueTrend = analyticsData?.weeklyRevenueTrend || {
    title: "Weekly Revenue Trend",
    labels: [],
    thisWeek: [],
    lastWeek: [],
  };

  const categoryPerformance = analyticsData?.categoryPerformance || [];
  const maxCategoryPercent = Math.max(...categoryPerformance.map((item) => item.percent || 0), 1);

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
      <Grid container spacing={1} alignItems="stretch">
        {metricCards.map((card) => (
          <Grid size={{xs:12,sm:3}} key={card.title} sx={{ display: "flex" }}>
            <MetricCard {...card} />
          </Grid>
        ))}
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
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ px: 3.5, py: 2.8 }}>
              <CalendarMonthOutlinedIcon sx={{ color: colors.subText }} />
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: colors.heading,
                }}
              >
                {weeklyRevenueTrend.title}
              </Typography>
            </Stack>

            <Box sx={{ borderTop: `1px solid ${colors.mutedLine}` }}>
              <WeeklyTrendChart
                labels={weeklyRevenueTrend.labels}
                thisWeek={weeklyRevenueTrend.thisWeek}
                lastWeek={weeklyRevenueTrend.lastWeek}
              />
            </Box>
          </Paper>
        </Grid>

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
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ px: 3.5, py: 2.8 }}>
              <EmojiEventsOutlinedIcon sx={{ color: colors.gold }} />
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: colors.heading,
                }}
              >
                Category Performance
              </Typography>
            </Stack>

            <Box sx={{ borderTop: `1px solid ${colors.mutedLine}`, px: 3.5, py: 3 }}>
              {categoryPerformance.length === 0 ? (
                <Typography sx={{ color: colors.subText }}>
                  No analytics category data available
                </Typography>
              ) : (
                <Stack spacing={3.2}>
                  {categoryPerformance.map((item, index) => (
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
                          {item.label === "Mobile Traffic" || item.label === "Desktop Traffic"
                            ? `${item.percent}%`
                            : `${item.percent}% of revenue`}
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={(Number(item.percent || 0) / maxCategoryPercent) * 100}
                        sx={{
                          height: 9,
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;