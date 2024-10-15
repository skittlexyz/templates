import readline from 'readline';
import clc from "cli-color";
import figlet from "figlet";
import fs from "fs";
import util from "node:util";
import { exec } from "node:child_process";

const execPromisified = util.promisify(exec);

async function ps(command) {
    try {
        const { stdout, stderr } = await execPromisified(command);
        if (stderr) return stderr;
        return stdout;
    } catch (error) {
        return null;
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

let shouldExit = false;

function handleExit() {
    shouldExit = true;
    rl.close();
}

process.on('SIGINT', handleExit);

const link = (url, label) => {
    return `\x1b]8;;${url}\x1b\\${label}\x1b]8;;\x1b\\`;
}

let templates;

try {
    const data = fs.readFileSync("./templates.json", "utf8");
    templates = JSON.parse(data);
} catch (err) {
    console.log(clc.red("  [!] An error has occured while reading the templates."));
    process.exit();
}

function banner() {
    console.log(
        clc.yellow(figlet.textSync(" templates!", {
            font: "Graffiti",
            horizontalLayout: "default",
            verticalLayout: "default",
            width: 80,
            whitespaceBreak: true,
        })),
        "\n\n  A system of pre-made projects by " +
        clc.yellow.underline(link("https://github.com/skittlexyz/", "github.com/skittlexyz")) +
        "\n"
    );
}

async function promptUser(text) {
    return new Promise((resolve) => {
        rl.question(clc.yellow(text), async (input) => {
            if (input == "easteregg") {
                console.log("\n  " + clc.yellow.bold("[i] Hello from the dev! Thanks for reading my code and using it, i appreciate it!\n"))
                await promptUser("  [i] Press Enter to continue!\n");
            } 
            resolve(input);
        });
    });
}

async function options() {
    while (true) {
        for (let i = 0; i < templates.length; i++) {
            console.log(`  ${clc.yellow(`[${i + 1}]`)} ${link(templates[i].url, templates[i].name)}: ${templates[i].description}`);
        }
        console.log();

        const input = await promptUser("  [i] Enter option: ");

        if (!isNaN(input) && input >= 1 && input <= templates.length || input == "easteregg") {
            if (input == "easteregg") {
                process.stdout.write("\x1b[2J\x1b[H");
                banner();
                continue;
            };
            return templates[input - 1];
        } else {
            process.stdout.write("\x1b[2J\x1b[H");
            banner();
            console.log(clc.red("  [!] Invalid option. Please try again.\n"));
        }
    }
}


(async () => {
    process.stdout.write("\x1b[2J\x1b[H");

    banner();

    if (!await ps("git --version")) {
        console.log(clc.red("  [!] Git must be installed!\n"));
        process.exit();
    }

    await options().then(async (template) => {
        if (template) {
            console.log(clc.green(`\n  [i] Downloading ${template.name}!\n`));
            await ps(`git clone ${template.url}`);
            console.log(clc.green("  [i] Done!\n"));
        } else {
            console.log(clc.red("  [!] No template selected."));
        }
    });

    rl.close();

    if (!shouldExit) {
        process.exit();
    }
})();
