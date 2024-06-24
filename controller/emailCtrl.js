// app.post('/forget-password', (req, res) => {
//     const { email } = req.body;

//     // Check if email exists in the database
//     const user = users.find((user) => user.email === email);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Generate a random verification code
//     const verificationCode = Math.floor(100000 + Math.random() * 900000);

//     // Send verification code to the user's email
//     sendVerificationEmail(email, verificationCode)
//       .then(() => {
//         // Store verification code in the database or a cache
//         // For simplicity, we'll just log it here
//         console.log(`Verification code for ${email}: ${verificationCode}`);
//         res.status(200).json({ message: 'Verification code sent successfully' });
//       })
//       .catch((error) => {
//         console.error('Error sending verification code:', error);
//         res.status(500).json({ message: 'Internal server error' });
//       });
//   });

//   // POST endpoint to verify the verification code
//   app.post('/verify-code', (req, res) => {
//     const { email, code } = req.body;

//     // Check if the verification code matches the one sent to the user
//     // For simplicity, we'll just compare it with the hard-coded value
//     if (code !== '123456') {
//       return res.status(401).json({ message: 'Invalid verification code' });
//     }

//     // Verification code is valid
//     res.status(200).json({ message: 'Verification code verified successfully' });
//   });

// Function to send verification email
const orderEmail = async (
  orderNumber,
  orderStatus,
  totalAmount,
  items,
  email,
  userName
) => {
  const now = new Date();

  // Format the date
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = now.toLocaleDateString(undefined, dateOptions);

  // Format the time
  const timeOptions = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };
  const formattedTime = now.toLocaleTimeString(undefined, timeOptions);
  // console.log(items);
  const orderTemp = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order - ${orderNumber}</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              background-color: #000000;
              color: #ffffff;
              text-align: center;
              padding: 20px;
          }
          .header h1 {
              margin: 0;
              font-size: 24px;
          }
          .content {
              padding: 20px;
          }
          .content h2 {
              text-align: center;
              color: #dfca5d;
          }
          .order-details {
              margin-top: 20px;
          }
          .order-details p {
              margin: 10px 0;
              font-size: 16px;
          }
          .items {
              width: 100%;
              margin-top: 20px;
              border-collapse: collapse;
          }
          .items td, .items th {
              border: 1px solid #dddddd;
              text-align: left;
              padding: 8px;
          }
          .items th {
              background-color: #f2f2f2;
          }
          .total {
              text-align: right;
              font-size: 18px;
              font-weight: bold;
              margin-top: 20px;
          }
          .footer {
              background-color: #000000;
              color: #ffffff;
              text-align: center;
              padding: 10px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>BuyTheLook</h1>
          </div>
          <div class="content">
              <h2>Your Order ${orderNumber}</h2>
              <div class="order-details">
                  <p>Hi, ${userName}</p>
                  <p>Thank you for your order. Your order is currently <strong>${orderStatus}</strong>.</p>
                  <p>Order Date: ${formattedDate}</p>
                  <p>Order Time: ${formattedTime}</p>
              </div>
              <table class="items">
                  <thead>
                      <tr>
                          <th>Image</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Quantity</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${items
                        .map(
                          (item) => `
                          <tr>
                              <td><img src="${
                                item.product.images[0].url
                              }" alt="${
                            item.title
                          }" style="width: 50px; height: 50px;"></td>
                              <td>${item.product.title}</td>
                              <td>${item.product.category}</td>
                              <td>$${item.product.price * item.count}</td>
                              <td>${item.count}</td>
                          </tr>
                      `
                        )
                        .join("")}
                  </tbody>
              </table>
              <p class="total">Total Amount: $${totalAmount}</p>
          </div>
          <div class="footer">
              <p>Thank you for shopping with BuyTheLook!</p>
          </div>
      </div>
  </body>
  </html>`;

  sendVerificationEmail(email, orderTemp, "You have A New Order");
};

const nodemailer = require("nodemailer");
const sendVerificationEmail = async (email, resetURL, subject) => {
  console.log("email hn ", email);
  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      // user: 'anna.jessica272@gmail.com',
      user: "hasibanees9@gmail.com",
      pass: "rlfw qxru izen keue",
      // pass: 'idkc zvcr rqit wypm',
    },
  });

  // Define email options
  const mailOptions = {
    from: "hasibanees9@gmail.com",
    to: email,
    text: `Hey User${resetURL}`,
    subject: subject,
    html: resetURL,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, orderEmail };
