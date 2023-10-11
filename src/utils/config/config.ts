import { CONFIG } from "../../@types";

let config: CONFIG;

try {
  config = require("../../../config.json");
} catch (error) {
  config = {
    maintenance_mode: false,
  };
}

export { config };
