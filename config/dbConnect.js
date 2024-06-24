const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect('mongodb+srv://annajessica272:annajessica@vinedeo.2nj2hyd.mongodb.net/buythelooks?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("DAtabase error");
  }
};
module.exports = dbConnect;
