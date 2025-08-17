const mongoose = require("mongoose");

const QCReportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: Number,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    address: {
      type: String,      
    },
    aadharFront: {
      type: String,      
    },
    aadharBack: {
      type: String,      
    },
    signOfUser: {
      type: String,      
    },
    wallet: {
      type: Number,
    },
    is_Active: {
      type: Boolean,
    },
    agreementAccepted: {
      type: Boolean,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    isLoggedIn: {
      type: Boolean,
    },
    mailSend: {
      type: Boolean,
    },
    userType: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    completedWork: {
      type: Array,
    },
    pendingWork: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QC", QCReportSchema);
