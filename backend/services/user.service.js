import User from "../models/user.model.js";

const createUser = async ({
  fullname,
  email,
  password,
  role,
  avatar,
  googleId,
}) => {
  if (!fullname || !fullname.firstname || !email || !password) {
    throw new Error("All fields are required");
  }

  const user = await User.create({
    fullname: {
      firstname: fullname.firstname,
      lastname: fullname.lastname || "",
    },
    email,
    password,
    role: role || "user",
    avatar: avatar || "",
    googleId,
  });

  return user;
};

export default {
  createUser,
};
