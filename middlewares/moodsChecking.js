const axios = require("axios");
const fs = require("fs");
const path = require("path");
const getColors = require("get-image-colors");
const Color = require("color");



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
async function moodChecking(filepath) {
  try {
    // const filepath = path.resolve(__dirname, "downloaded_image.jpg");
    // await downloadImage(imageUrl, filepath);
    // console.log("Image downloaded to:", filepath);

    if (!fs.existsSync(filepath)) {
        // throw new Error("Image file does not exist.");
        console.log("Image file does not exist.");
      }


    const colors = await getColors(filepath);

    const topColors = colors.slice(0, 5).map((color) => color.hex());

    // console.log("Top 5 colors in the image:", topColors);

    const matchedAttributesSet = new Set();
    topColors.forEach((hex) => {
      const closestColor = findClosestColor(Color(hex));
      if (closestColor && colorAttributes[closestColor]) {
        colorAttributes[closestColor].forEach(attr => matchedAttributesSet.add(attr));
      }
    });

    const matchedAttributes = Array.from(matchedAttributesSet);
    return matchedAttributes

    // console.log("Matched attributes in the image:", matchedAttributes);
  } catch (error) {
    console.error("Error processing image:", error);
  }
}



module.exports = moodChecking