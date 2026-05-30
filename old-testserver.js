const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("WORKING");
});

app.get("/api/dashboard/stats", (req, res) => {
    res.json({
        success: true,
        message: "API WORKING"
    });
});

app.listen(5000, () => {
    console.log("TEST SERVER RUNNING");
});