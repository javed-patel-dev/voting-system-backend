// services/VoteService.js
import { Vote } from "../../Models/Votes.js";

// Create a new document
export const create = async (data) => {
  return Vote.create(data);
};

// Delete (destroy)
export const destroy = async (filter) => {
  return Vote.deleteMany(filter); // or deleteOne if single
};
