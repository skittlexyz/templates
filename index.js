const prompt = require("prompt-sync")();
const ps = require("./ps").ps;
const clc = require("cli-color");
const figlet = require("figlet");

(async () => {
    let input = prompt(clc.yellow("Enter text: "));
    const result = await ps(`echo ${input}`);
    if (result) console.log(clc.red(result));
})();

console.log(
    clc.blue(figlet.textSync("Boo!", {
        font: "Graffiti",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 80,
        whitespaceBreak: true,
    }))
);
