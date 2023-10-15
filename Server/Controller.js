const Data = require("./data");

class Controller {
  handleMess(str) {
    console.log(str);
    let keys = str.split("==");
    console.log(keys);
    return str;
  }

  convertBytesToJSON(str) {
    str = str + ""; // chuyển sang dạng string
    let data = JSON.parse(str);
    return data;
  }
}

module.exports = Controller;
