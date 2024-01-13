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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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
  const userId = req.cookies.userId;

  if (!userId) {
    res.status(400).send("please login or register");
  }

  const user = users[userId];
  
  const templateVars = {
    user,
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

/** direct /urls/new page  */
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    res.render("login");
  }

  const user = users[userId];

  const templateVars = {
    user,
  };

  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies.userId;

  if (userId) {
    const user = users[userId];

    const templateVars = {
      user,
    };
    res.render("urls_index", templateVars);
  }
  res.render("login");
});

app.get("/register", (req, res) => {
  // const userId = req.cookies.userId;
  // console.log("register: ", userId);

  // if (userId) {
  //   const user = users[userId];

  //   const templateVars = {
  //     user,
  //   };
  //   res.render("urls_index", templateVars);
  // }
  res.render("register");
});

/** direct to urls/:id page */
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    res.render("login");
  }

  const user = users[userId];

  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

/**random id number function */
app.post("/urls", (req, res) => {
  const shortId = generateRandomString();
  urlDatabase[shortId] = req.body.longURL;
  res.redirect(`urls/${shortId}`);
});

/**login*/
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("please provide username and password");
  }

  let foundUser;
  for (let userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }

  if (!foundUser) {
    res.status(401).send("Invaild username/password");
  }

  if (foundUser.password !== password) {
    res.status(401).send("Invaild username/password");
  }

  res.cookie("userId", foundUser);
  res.redirect("/urls");
});

/**logout*/
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.clearCookie("email");
  res.redirect("/urls");
});
/**delete url */
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

/** update urls link */
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("please provide username and password");
  }

  let foundUser;
  for (let userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }
  if (foundUser) {
    res.status(400).send("user already exists");
  }

  const id = generateRandomString();

  const newUser = {
    id,
    email,
    password,
  };
  users[id] = newUser;

  console.log("register newUser", newUser);

  res.cookie("userId", id);
  res.redirect(`urls`);
});
