// src/components/pages/Notfound404.js
import React from "react";
import { Box, Typography } from "@mui/material";

const NotFound404 = () => {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      bgcolor="#f9f9f9"
    >
      <Typography variant="h3" color="error" gutterBottom>
        404
      </Typography>
      <Typography variant="h6">Page Not Found</Typography>
      <Typography variant="body2">The page you are looking for does not exist.</Typography>
    </Box>
  );
};

export default NotFound404;
