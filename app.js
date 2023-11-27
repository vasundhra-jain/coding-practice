const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
const dbPath = path.join(__dirname, "userData.db");
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1
app.post("/register", async (request, response) => {
  const personDetails = request.body;
  const { username, name, password, gender, location } = personDetails;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status = 400;
      response.send("Password is too Short");
    } else {
      const createUserQuery = `
    INSERT INTO 
    user(username, name, password, gender, location)
    VALUES('${username}','${name}','${password}','${gender}','${location}');
    `;
      const dbResponse = await db.run(createUserQuery);
      //const newUserId=dbResponse.lastId;
      response.send("User Created Successfully");
    }
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});
//API 2
app.post("/login", async (request, response) => {
  //const personDetails = request.body;
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status = 400;
    response.send = "Invalid User";
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    console.log(password);
    console.log(dbUser.password);
    console.log(isPasswordMatched);
    if (isPasswordMatched === true) {
      response.send("Login success!");
    } else {
      response.status = 400;
      response.send("Invalid password");
    }
  }
});

module.exports = app;
