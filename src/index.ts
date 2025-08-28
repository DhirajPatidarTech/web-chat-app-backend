import { createServer } from "./session";
import dotenv from "dotenv";
dotenv.config();


const PORT = 5000;

createServer().then((server) => {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
