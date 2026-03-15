const express = require("express");
const runRoutes = require("./routes/run.routes");

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/", runRoutes);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Runner listening on ${port}`));
