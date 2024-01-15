const assert = require("chai").assert;

const { getUserByEmail } = require("../helper.js");

const testUsers = {
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

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });
});

describe("getUserByEmail undefined", function () {
  it("should return a undefined with invalid email", function () {
    const user = getUserByEmail("fake@example.com", testUsers);
    // Write your assert statement here
    assert.isNull(user, 'no user undefined');

  });
});