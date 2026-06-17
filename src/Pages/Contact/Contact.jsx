import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { getData, postData } from "../../Axios/axios";


export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await getData("/admin/contact-messages");
      const payload = res?.data ?? res;
      const list =
        payload?.data?.rows ??
        payload?.rows ??
        payload?.data ??
        payload ??
        [];
      setMessages(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const openMessage = async (id) => {
    try {
      // fetch single message
      const res = await getData(`/admin/contact-messages/${id}`);
      const payload = res?.data ?? res;
      const msg = payload?.data ?? payload;
      setSelectedMessage(msg);
      setDialogOpen(true);

      // mark as read
      await postData(`/admin/contact-messages/${id}/read`, {});
      // update local state to reflect read status
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMessage(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        sx={{
          fontFamily: "Playfair Display",
          fontSize: 28,
          fontWeight: 700,
          mb: 1,
          color: "#2B0018",
        }}
      >
        Contact Messages
      </Typography>
      <Typography sx={{ color: "#666", mb: 2 }}>
        View and manage inquiries submitted from the Get in Touch form.
      </Typography>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>From</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width={100} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5}>Loading...</TableCell>
              </TableRow>
            )}
            {!loading && messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>No messages found</TableCell>
              </TableRow>
            )}
            {!loading &&
              messages.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.fullName || m.name}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>{m.subject}</TableCell>
                  <TableCell>
                    {m.status === "read" ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <MarkEmailReadOutlinedIcon fontSize="small" color="success" />
                        <Typography sx={{ fontSize: 12, color: "success.main" }}>
                          Read
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 12, color: "#b35e00" }}>
                        New
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openMessage(m.id)}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>

      {/* View Message Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontFamily: "Playfair Display",
            fontSize: 22,
            fontWeight: 700,
            color: "#470541",
          }}
        >
          Message Details
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {selectedMessage && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
              <Typography sx={{ fontSize: 13, color: "#666" }}>
                <strong>Name:</strong> {selectedMessage.fullName || selectedMessage.name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#666" }}>
                <strong>Email:</strong> {selectedMessage.email}
              </Typography>
              {selectedMessage.subject && (
                <Typography sx={{ fontSize: 13, color: "#666" }}>
                  <strong>Subject:</strong> {selectedMessage.subject}
                </Typography>
              )}
              <Typography sx={{ fontSize: 13, color: "#666" }}>
                <strong>Received:</strong>{" "}
                {selectedMessage.createdAt
                  ? new Date(selectedMessage.createdAt).toLocaleString()
                  : "-"}
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "#f9f3ef",
                  borderRadius: 1,
                  border: "1px solid #f0e7db",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Plus Jakarta Sans",
                    fontSize: 14,
                    whiteSpace: "pre-wrap",
                    color: "#333",
                  }}
                >
                  {selectedMessage.message}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
