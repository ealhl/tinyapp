const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail } = require("./helper");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['232334'],
}));

const urlDatabase = {
  userRandomID: {
    b2xVn2: "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
  },
  user2RandomID: {
    vhg2aa: "https://ca.yahoo.com/?p=us",
    er43we: "https://www.geeksforgeeks.org/",
  },
};

const urlsForUser = (id) => {
  return urlDatabase[id];
};
const password = "purple-monkey-dinosaur";
const password2 = "dishwasher-funk";
const hashedPassword = bcrypt.hashSync(password, 10);
const hashedPassword2 = bcrypt.hashSync(password2, 10);

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPassword,
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPassword2,
  },
};

/** direct to home page and return hello*/
app.get("/", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    res.render("login");
  }

  const user = users[userId];

  const templateVars = {
    user,
    urls: urlDatabase[userId],
  };

  res.render("urls_index", templateVars);
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
  console.log("req.session: ");
  console.log(req.session);
  const userId = req.session.userId;

  if (!userId) {
    res.status(400).send("please login or register");
  }

  const user = users[userId];

  const userUrls = urlsForUser(userId);
  console.log("userUrls: ", userUrls);

  const templateVars = {
    user,
    urls: userUrls,
  };
  res.render("urls_index", templateVars);
});

/** direct /urls/new page  */
app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    res.render("login");
  }

  const user = users[userId];

  const templateVars = {
    user,
    urls: urlDatabase[userId],
  };

  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    const user = users[userId];

    const templateVars = {
      user,
      urls: urlDatabase[userId],
    };

    res.render("urls_index", templateVars);
  }

  res.render("login");
});

app.get("/register", (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    const user = users[userId];

    const templateVars = {
      user,
      urls: urlDatabase[userId],
    };

    res.render("urls_index", templateVars);
  }
  res.render("register");
});

/** direct to urls/:id page */
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    res.status(400).send("please login or register");
  }

  if (!urlDatabase[userId][req.params.id]) {
    res.status(400).send("you don't have this url");
  }

  const user = users[userId];

  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[userId][req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  Object.keys(urlDatabase).forEach((userId) => {
    for (let key in urlDatabase[userId]) {
      if (Object.prototype.hasOwnProperty.call(urlDatabase[userId], key)) {
        if (key === req.params.id) {
          res.status(301).redirect(urlDatabase[userId][key]);
        }
      }
    }
  });
});

/**random id number function */
app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  console.log("userId: ", userId);

  if (!userId) {
    res.status(400).send("please login or register");
  }

  const shortId = generateRandomString();
  console.log(urlDatabase);
  console.log("before urls add parms id: ", urlDatabase[userId]);
  console.log("user find: ", users.userId);
  console.log("shortId: ", shortId);
  console.log("longURL: ", req.body.longURL);
  // console.log("urlDatabase[userId][shortId]:", urlDatabase[userId]);
  urlDatabase[userId][shortId] = req.body.longURL;
  console.log("after urls add parms id: ", urlDatabase[userId]);
  res.redirect(`urls/${shortId}`);
});

/**login*/
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(403).send("please provide email and password");
  }

  let foundUser = getUserByEmail(email, users);
  console.log("foundUser: ", foundUser);
  console.log(users);

  if (!foundUser) {
    res.status(403).send("Invaild email/password");
  }
  console.log("foundUser.password: ", foundUser.password);
  console.log("password: ", password);
  console.log("compare result: ", bcrypt.compareSync(password, foundUser.password));

  if (!bcrypt.compareSync(password, foundUser.password)) {
    res.status(403).send("Invaild email/password");
  }

  req.session.userId = foundUser.id;
  console.log("login session.userId: ", req.session.userId);
  res.redirect("/urls");
});

/**logout*/
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
/**delete url */
app.post("/urls/:id/delete", (req, res) => {

  const userId = req.session.userId;
  if (!userId) {
    res.status(400).send("please login or register");
  }

  if (!urlDatabase[userId][req.params.id]) {
    res.status(400).send("you don't have this url");
  }

  delete urlDatabase[userId][req.params.id];

  res.redirect("/login");
});

/** update urls link */
app.post("/urls/:id", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    res.status(400).send("please login or register");
  }

  if (!urlDatabase[userId][req.params.id]) {
    res.status(400).send("you don't have this url");
  }

  urlDatabase[userId][req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    res.status(400).send("please provide username and password");
  }

  let foundUser = getUserByEmail(email, users);

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
  console.log(users);
  req.session.userId = id;
  urlDatabase[id] = {};
  res.redirect("urls");
});
