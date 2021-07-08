import fs from "fs";
import jsonschema from "jsonschema";
import {root, multipleChoice, category, column, cell} from "./json_schema/description_model.js";

const text = fs.readFileSync("test/data/21-07-07.json").toString();
const instance = JSON.parse(text);

const v = new jsonschema.Validator();
v.addSchema(cell);
v.addSchema(category);
v.addSchema(multipleChoice);
v.addSchema(column);
v.addSchema(root);

console.log(v.validate(instance, root));
