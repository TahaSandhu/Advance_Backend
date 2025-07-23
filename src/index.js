import connectDataBase from "./db/index.js";
import app from "./app.js";

connectDataBase()
  .then(() => {
    const PORT = process.env.PORT || 8080;

    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });

    app.on("error", (err) => {
      console.error("Server error:", err);
      throw err;
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
