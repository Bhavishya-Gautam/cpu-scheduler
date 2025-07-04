const express = require("express");
const cors = require("cors");
const dotenv=require("dotenv");
const bodyParser = require("body-parser");
dotenv.config({
    path:"./.env"
})

const fcfs = require("../algorithms/fcfs");
const sjf = require("../algorithms/sjf"); // Ensure implemented
const rr = require("../algorithms/rr"); // Ensure implemented
const priority = require("../algorithms/priority"); // Ensure implemented
const mlq = require("../algorithms/mlq"); // Ensure implemented
const mlfq = require("../algorithms/mlfq"); // Ensure implemented
const mlqAging = require("../algorithms/mlq_aging"); // Ensure implemented
const sjfAging = require("../algorithms/sjf_aging"); // Ensure implemented

const app = express();
const PORT = process.env.PORT||18080;

app.use(cors({
    origin: "http://localhost:3000",
}));
app.use(bodyParser.json());

// Test endpoint
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "CPU Scheduler API is live 🚀",
    });
});

// Main scheduling endpoint
app.post("/api/schedule", (req, res) => {
    try {
        const { scheduling_type, processes, quantum, num_queues } = req.body;

        // Input validation
        if (!scheduling_type || !Array.isArray(processes)) {
            return res.status(400).json({
                status: "error",
                message: "Missing or invalid 'scheduling_type' or 'processes'.",
            });
        }

        for (const p of processes) {
            if (
                typeof p.p_id === 'undefined' ||
                typeof p.arrival_time !== 'number' ||
                typeof p.burst_time !== 'number' ||
                p.arrival_time < 0 ||
                p.burst_time <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "Each process must have: p_id, arrival_time (>=0), burst_time (>0).",
                });
            }
        }

        if (["RR", "MLQ", "MLFQ", "MLQ_AGING"].includes(scheduling_type)) {
            if (typeof quantum !== "number" || quantum <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Missing or invalid quantum value.",
                });
            }
        }

        // Execute scheduling
        let result;

        switch (scheduling_type) {
            case "FCFS":
                result = fcfs(processes);
                break;
            case "SJF":
                result = sjf(processes);
                break;
            case "RR":
                result = rr(processes, quantum);
                break;
            case "Priority":
                result = priority(processes);
                break;
            case "MLQ":
                result = mlq(processes, num_queues || 3, quantum);
                break;
            case "MLFQ":
                result = mlfq(processes, quantum, num_queues || 3);
                break;
            case "MLQ_AGING":
                result = mlqAging(processes, num_queues || 3, quantum);
                break;
            case "SJF_AGING":
                result = sjfAging(processes, 50); // Can make threshold configurable
                break;
            default:
                return res.status(400).json({
                    status: "error",
                    message: `Unsupported scheduling type: ${scheduling_type}`,
                });
        }

        result.status = "success";
        res.json(result);

    } catch (error) {
        console.error("Error in /api/schedule:", error);
        res.status(500).json({
            status: "error",
            message: error.message || "Internal server error",
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
