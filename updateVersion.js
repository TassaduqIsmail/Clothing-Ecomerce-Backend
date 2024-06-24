const fs = require("fs");
const path = "./version.json"; // Adjust the path if necessary

function updateVersion(type) {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading version file:", err);
      return;
    }

    let version = JSON.parse(data);

    switch (type) {
      case "major":
        version.YYY += 1;
        version.ZZZ = 1;
        break;
      case "minor":
        version.ZZZ += 1;
        break;
      default:
        console.error("Unknown version type");
        return;
    }

    fs.writeFile(path, JSON.stringify(version, null, 2), "utf8", (err) => {
      if (err) {
        console.error("Error writing version file:", err);
        return;
      }
      console.log(
        `Version updated to ${version.XXX}.${version.YYY}.${version.ZZZ}`
      );
    });
  });
}

const type = process.argv[2];
updateVersion(type);
