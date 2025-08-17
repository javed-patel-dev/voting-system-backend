const mongoose = require("mongoose");
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address.`,
      },
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
      required: true,
    },
    aadharFront: {
      type: String,
      default: "",
      required: true,
    },
    aadharBack: {
      type: String,
      default: "",
      required: true,
    },
    signOfUser: {
      type: String,
      default: "",
      required: true,
    },
    wallet: {
      type: Number,
      default: 30,
    },
    is_Active: {
      type: Boolean,
      default: false,
    },
    agreementAccepted: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    mailSend: {
      type: Boolean,
      default: false,
    },
    userType: {
      type: String,
      default: "user",
    },
    ipAddress: {
      type: String,
      default: "192.168.27.5",
    },
    completedWork: {
      type: Array,
      default: [],
    },
    pendingWork: {
      type: Array,
      default:  [...Array(500).keys()].map((i) => i+1 ),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", customerSchema);
