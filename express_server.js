const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = () => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
/** return all urls on database  */
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/** direct to home page and return hello*/
app.get("/", (req, res) => {
  res.send("Hello!");
});

/** display message on terminal when server start */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/** direct to /hello page and return hello world*/
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/** direct to /urls page with login/logout and display all urls with edit and delete function*/
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

/** direct /urls/new page  */
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("register", templateVars);
});

/**random id number function */
app.post("/urls", (req, res) => {
  const shortId = generateRandomString();
  urlDatabase[shortId] = req.body.longURL;
  res.redirect(`urls/${shortId}`);
});

/**login*/
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

/**logout*/
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
/**delete url */
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

/** direct to urls/:id page */
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    username: req.cookies["username"],
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

/** update urls link */
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});
