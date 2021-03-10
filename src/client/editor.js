const FileOps = require("./modules/FileOps.js");
const Menu = require("./modules/Menu.js");

window.onload = async ()=> {
    window.menu = new Menu("#menu");

    window.parameters = {};
    const parameters = window.location.search.substr(1).split("&");
    for (const parameter of parameters){
        const split = parameter.split(/=/);
        window.parameters[split[0]] = split[1] ?? "";
    }
    console.log(window.parameters);

    let fileOps = new FileOps();
    await fileOps.loadClient();

    try {
        let r = await fileOps.create(window.parameters.fileId, "game file");
        console.log(r);
        let t = await fileOps.rename(r.id, "new.json");
        console.log(t);
    } catch (err){
        console.log(err);
    }
}
