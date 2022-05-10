const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const paginate = require("express-paginate");
const passport = require("passport");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const router = require("./routes/index");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());
023;
//middleware for cookies
app.use(cookieParser());

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// any route after this line will be verify with this
app.use(passport.initialize());
require("./middleware/passport-middleware")(passport);

// this set the numbers of items the user can get when api call is made
app.use(paginate.middleware(process.env.LIMIT, process.env.MAX_LIMIT));

// routes
app.use(router);
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
