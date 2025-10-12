const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

// route
app.use("/auth", require("./routes/auth"));
app.use("/courses", require("./routes/courses"));
app.use("/teams", require("./routes/teams"));
app.use("/", require("./routes/evaluationRequests"));
app.use("/", require("./routes/evaluations"));

app.get("/health", (req, res) => res.json({ ok: true }));

// connect db and strat
db.sequelize.sync({ alter: false }).then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log(`✅ Server running on port ${process.env.PORT || 3001}`);
  });
});
