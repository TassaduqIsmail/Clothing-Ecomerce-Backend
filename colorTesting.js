const axios = require("axios");
const fs = require("fs");
const path = require("path");
const getColors = require("get-image-colors");
const Color = require("color");

// URL of the image to analyze
const imageUrl = "https://original.pk/cdn/shop/products/412epZR6GmL.jpg";

// Function to download an image from a URL
async function downloadImage(url, filepath) {
  const response = await axios({
    url,
    responseType: "arraybuffer",
  });
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, response.data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Predefined colors and their attributes
const colorAttributes = {
  "#000000": ["mystery", "elegance", "seriousness", "go for sure"],
  "#808080": ["Quiet", "shy", "quiet", "hidden"],
  "#FFFFFF": ["Purity", "festive", "elegant", "cleanliness", "honesty", "Soft"],
  "#FFA500": ["Energy", "vitality"],
  "#FFFF00": ["Heat", "closeness", "flow", "emotion", "light"],
  "#008000": ["Growth", "freshness", "optimism", "health", "nature", "Calm", "plenty"],
  "#0000FF": ["Calm", "peaceful", "comfortable", "romantic", "Cold", "quiet", "calm", "security"],
  "#800080": ["Wealth", "prestige", "mystery", "uniqueness"],
  "#FFC0CB": ["Feminine", "childish", "mannequin", "romantic", "sweet"],
  "#FF0000": ["Power", "femininity", "passion", "temptation", "heart", "War"]
};

// Function to calculate the Euclidean distance between two colors in RGB space
function colorDistance(color1, color2) {
  const rDiff = color1.red() - color2.red();
  const gDiff = color1.green() - color2.green();
  const bDiff = color1.blue() - color2.blue();
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// Function to find the closest predefined color
function findClosestColor(color) {
  let closestColor = null;
  let minDistance = Infinity;
  Object.keys(colorAttributes).forEach((hex) => {
    const predefinedColor = Color(hex);
    const distance = colorDistance(color, predefinedColor);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = hex;
    }
  });
  return closestColor;
}

// Function to analyze the image
async function analyzeImage() {
  try {
    const filepath = path.resolve(__dirname, "downloaded_image.jpg");
    await downloadImage(imageUrl, filepath);
    console.log("Image downloaded to:", filepath);

    // Get the colors from the image
    const colors = await getColors(filepath);

    // Get the top 5 colors
    const topColors = colors.slice(0, 5).map((color) => color.hex());

    console.log("Top 5 colors in the image:", topColors);

    // Use a Set to ensure unique attributes
    const matchedAttributesSet = new Set();
    topColors.forEach((hex) => {
      const closestColor = findClosestColor(Color(hex));
      if (closestColor && colorAttributes[closestColor]) {
        colorAttributes[closestColor].forEach(attr => matchedAttributesSet.add(attr));
      }
    });

    // Convert the Set to an array
    const matchedAttributes = Array.from(matchedAttributesSet);
    return matchedAttributes

    console.log("Matched attributes in the image:", matchedAttributes);
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

// Analyze the image
// analyzeImage();


module.exports = analyzeImage





// const axios = require("axios");
// const fs = require("fs");
// const path = require("path");
// const getColors = require("get-image-colors");
// const Color = require("color");

// // URL of the image to analyze
// const imageUrl = "https://original.pk/cdn/shop/products/412epZR6GmL.jpg";

// // Function to download an image from a URL
// async function downloadImage(url, filepath) {
//   const response = await axios({
//     url,
//     responseType: "arraybuffer",
//   });
//   return new Promise((resolve, reject) => {
//     fs.writeFile(filepath, response.data, (err) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

// // Predefined colors and their attributes
// const colorAttributes = {
//   "#000000": ["mystery", "elegance", "seriousness", "go for sure"],
//   "#808080": ["Quiet", "shy", "quiet", "hidden"],
//   "#FFFFFF": ["Purity", "festive", "elegant", "cleanliness", "honesty", "Soft"],
//   "#FFA500": ["Energy", "vitality"],
//   "#FFFF00": ["Heat", "closeness", "flow", "emotion", "light"],
//   "#008000": ["Growth", "freshness", "optimism", "health", "nature", "Calm", "plenty"],
//   "#0000FF": ["Calm", "peaceful", "comfortable", "romantic", "Cold", "quiet", "calm", "security"],
//   "#800080": ["Wealth", "prestige", "mystery", "uniqueness"],
//   "#FFC0CB": ["Feminine", "childish", "mannequin", "romantic", "sweet"],
//   "#FF0000": ["Power", "femininity", "passion", "temptation", "heart", "War"]
// };

// // Function to calculate the Euclidean distance between two colors in RGB space
// function colorDistance(color1, color2) {
//   const rDiff = color1.red() - color2.red();
//   const gDiff = color1.green() - color2.green();
//   const bDiff = color1.blue() - color2.blue();
//   return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
// }

// // Function to find the closest predefined color
// function findClosestColor(color) {
//   let closestColor = null;
//   let minDistance = Infinity;
//   Object.keys(colorAttributes).forEach((hex) => {
//     const predefinedColor = Color(hex);
//     const distance = colorDistance(color, predefinedColor);
//     if (distance < minDistance) {
//       minDistance = distance;
//       closestColor = hex;
//     }
//   });
//   return closestColor;
// }

// // Function to analyze the image
// async function analyzeImage() {
//   try {
//     const filepath = path.resolve(__dirname, "downloaded_image.jpg");
//     await downloadImage(imageUrl, filepath);
//     console.log("Image downloaded to:", filepath);

//     // Get the colors from the image
//     const colors = await getColors(filepath);

//     // Get the top 5 colors
//     const topColors = colors.slice(0, 5).map((color) => color.hex());

//     console.log("Top 5 colors in the image:", topColors);

//     // Find the closest predefined colors and gather their attributes
//     const matchedAttributes = topColors.reduce((acc, hex) => {
//       const closestColor = findClosestColor(Color(hex));
//       if (closestColor && colorAttributes[closestColor]) {
//         acc.push(...colorAttributes[closestColor]);
//       }
//       return acc;
//     }, []);

//     console.log("Matched attributes in the image:", matchedAttributes);
//   } catch (error) {
//     console.error("Error processing image:", error);
//   }
// }

// // Analyze the image
// analyzeImage();







// const axios = require("axios");
// const fs = require("fs");
// const path = require("path");
// const getColors = require("get-image-colors");

// // URL of the image to analyze
// const imageUrl =
//   "https://res.cloudinary.com/ds8wtc0yi/image/upload/v1715178930/v3lcpnuclskge2i99ni2.jpg";

// // Function to download an image from a URL
// async function downloadImage(url, filepath) {
//   const response = await axios({
//     url,
//     responseType: "arraybuffer",
//   });
//   return new Promise((resolve, reject) => {
//     fs.writeFile(filepath, response.data, (err) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

// async function analyzeImage() {
//   try {
//     const filepath = path.resolve(__dirname, "downloaded_image.jpg");
//     await downloadImage(imageUrl, filepath);
//     console.log("Image downloaded to:", filepath);

//     // Get the colors from the image
//     const colors = await getColors(filepath);

//     // Map the colors to hex format
//     const topColors = colors.map((color) => color.hex());

//     console.log("Top colors in the image:", topColors);
//   } catch (error) {
//     console.error("Error processing image:", error);
//   }
// }

// // Analyze the image
// analyzeImage();

// const Jimp = require("jimp");
// const axios = require("axios");
// const fs = require("fs");
// const path = require("path");

// // URL of the image to analyze
// const imageUrl =
//   "https://res.cloudinary.com/ds8wtc0yi/image/upload/v1714469513/haveALooks/096292b303b210adcbc43a194be2e4d5_oncvow.jpg";
// //   "https://res.cloudinary.com/ds8wtc0yi/image/upload/v1715178930/v3lcpnuclskge2i99ni2.jpg";

// // Function to download an image from a URL
// async function downloadImage(url, filepath) {
//   const response = await axios({
//     url,
//     responseType: "arraybuffer",
//   });
//   return new Promise((resolve, reject) => {
//     fs.writeFile(filepath, response.data, (err) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

// async function analyzeImage() {
//   try {
//     const filepath = path.resolve(__dirname, "downloaded_image.jpg");
//     await downloadImage(imageUrl, filepath);
//     console.log("Image downloaded to:", filepath);

//     // Read the downloaded image using Jimp
//     const image = await Jimp.read(filepath);

//     // Process the image to get color information
//     const width = image.bitmap.width;
//     const height = image.bitmap.height;
//     const colorCounts = {};

//     for (let x = 0; x < width; x++) {
//       for (let y = 0; y < height; y++) {
//         const color = Jimp.intToRGBA(image.getPixelColor(x, y));
//         const colorKey = `${color.r},${color.g},${color.b}`;

//         if (colorCounts[colorKey]) {
//           colorCounts[colorKey]++;
//         } else {
//           colorCounts[colorKey] = 1;
//         }
//       }
//     }

//     // Get the top 5 most frequent colors
//     const topColors = Object.entries(colorCounts)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5)
//       .map(([color, count]) => {
//         const [r, g, b] = color.split(",").map(Number);
//         return { color: { r, g, b }, count };
//       });

//     console.log("Top 5 colors:", topColors);
//   } catch (error) {
//     console.error("Error processing image:", error);
//   }
// }

// // Analyze the image
// analyzeImage();
