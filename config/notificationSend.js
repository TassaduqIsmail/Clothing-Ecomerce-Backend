const admin = require("./firebaseAuth");

const sendNotification = (token, noti) => {
  const payload = {
    notification: {
      title: noti.title,
      body: noti.body,
    },
  };

  admin
    .messaging()
    .sendToDevice(token, payload)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
};

module.exports = sendNotification;
