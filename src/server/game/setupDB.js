import sqlite3 from "sqlite3";
import fs from "fs";

/**
 * Create the database file.
 * Deletes any previous file already there.
 */
async function setupDB(dbPath, dbScriptPath){
    if (fs.existsSync(dbPath)){
        fs.unlinkSync(dbPath);
    }

    // Setup the database connection
    const db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
            throw new Error(`Could not connect to database: ${dbPath}`);
        }
    });

    await populateDB(db, dbScriptPath);
    db.close();
    console.log("DONE WITH DB SETUP");
}

function populateDB(db, dbScriptPath){
    return new Promise((resolve, reject)=> {
        const sql = fs.readFileSync(dbScriptPath);

        console.log(sql.toString());
        db.exec(sql.toString(), (err)=>{
            if (err) reject(err);
            resolve();
        });
    });
}

export default setupDB;
