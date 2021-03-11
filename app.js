const express = require("express");
const app = express();
// const server = require("http").createServer(app);

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/client/index.html");
});

app.use(express.static("client"));

app.listen(process.env.PORT ?? 8080, () => {
	console.log("Now listening on port 8080\n");
});
