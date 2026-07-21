const bcrypt = require("bcrypt");

(async () => {
  const hash = await bcrypt.hash("12345", 10);
  console.log(hash);
})();