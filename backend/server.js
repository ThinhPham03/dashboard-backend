const express = require("express");
const { initRoutes } = require('./index');

const port = process.env.SERVER_PORT;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
initRoutes(app);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});