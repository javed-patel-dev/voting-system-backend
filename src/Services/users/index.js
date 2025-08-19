// services/UserService.js
import { User } from "../../Models/users.js";

// Find one document
export const findOne = async (filter = {}, projection = null, options = {}) => {
  return User.findOne(filter, projection, options);
};

// Create a new document
export const create = async (data) => {
  return User.create(data);
};

// Update one document
export const updateOne = async (filter, update, options = {}) => {
  return User.updateOne(filter, update, options);
};

// Find and count all (pagination + sorting)
export const findAndCountAll = async (
  filter = {},
  sort = {},
  page = 1,
  limit = 10,
  projection = null
) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    User.find(filter, projection).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { data, total };
};

// Delete (destroy)
export const destroy = async (filter) => {
  return User.deleteMany(filter); // or deleteOne if single
};
