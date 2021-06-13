import fs from "fs";
import crypto from "crypto";
import Path from "path";

class ReportCoverage {

    /**
     * Retrieve a new middleware callback for the endpoint.
     * @returns {(function(*=, *=, *): Promise<void>)|*}
     */
    get middleware() {
        return async (req, res, next) => {
            if (!req.body) {
                next(new Error("Missing body from endpoint request"));
                return;
            }

            const root = ".nyc_output";
            if (!fs.existsSync(root)) fs.mkdirSync(root, {recursive : true});

            let hash = crypto.randomBytes(4).toString('hex');
            let filename = req.body.file.replaceAll(/[./]/g, "_") + "-" + req.body.date + "-" + hash + ".json";

            fs.writeFileSync(Path.join(root, filename), JSON.stringify(req.body.coverage, null, 2));
            res.end();
        }
    }
}

export default ReportCoverage;