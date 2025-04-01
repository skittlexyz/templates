import readline from 'readline';
import clc from 'cli-color';
import figlet from 'figlet';
import fs from 'fs';
import util from 'node:util';
import { exec } from 'node:child_process';
import pathModule from 'path';

const execPromisified = util.promisify(exec);

const TEMPLATES_URL = "https://cdn.statically.io/gh/skittlexyz/templates/refs/heads/main/templates.json";

async function ps(command) {
    try {
        const { stdout, stderr } = await execPromisified(command);
        if (stderr) return stderr;
        return stdout;
    } catch (error) {
        if (error.message.includes("already exists and is not an empty directory")) {
            console.log(clc.red("  [!] Directory already exists and isn't empty."));
            return null;
        }
        console.error("Error executing command:", error);
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
            resolve(input.trim());  // Ensure we resolve with trimmed input
        });
    });
}

async function options() {
    while (true) {
        for (let i = 0; i < templates.length; i++) {
            console.log(`  ${clc.yellow(`[${i + 1}]`)} ${link(templates[i].url, templates[i].name)}: ${templates[i].description}`);
        }
        console.log();
        console.log(`  ${clc.red("[X] Exit.")}\n`);

        const input = await promptUser("  [i] Enter option: ");

        if (input.toLowerCase() === "x") {
            process.stdout.write("\x1b[2J\x1b[H");
            process.exit();
        } else if (!isNaN(input) && input >= 1 && input <= templates.length || input == "easteregg") {
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

function isValidPath(path) {
    const pathRegex = /^(\/|([a-zA-Z]:\\))([^\0<>:"|?*]+(\\[^\0<>:"|?*]+)*)*$/;
    return pathRegex.test(path);
}

async function checkAndCreateDirectory(path, folderName) {
    try {
        // If path is empty, use current directory
        const basePath = path === "" ? process.cwd() : path;
        
        if (!isValidPath(basePath)) {
            return null;
        }

        const resolvedPath = pathModule.resolve(basePath);
        const templateDirName = folderName.toLowerCase().replace(" ", "_") + "-template";
        const fullPath = pathModule.join(resolvedPath, templateDirName);

        try {
            const stats = await fs.promises.stat(resolvedPath);
            if (!stats.isDirectory()) {
                return null;
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                await fs.promises.mkdir(resolvedPath, { recursive: true });
            } else {
                return null;
            }
        }

        return fullPath;
    } catch (error) {
        return null;
    }
}

(async () => {
    try {
        templates = await fetch(TEMPLATES_URL);
        templates = await templates.json();

        process.stdout.write("\x1b[2J\x1b[H");

        banner();

        if (!await ps("git --version")) {
            console.log(clc.red("  [!] Git must be installed!\n"));
            process.exit();
        }

        await options().then(async (template) => {
            if (template) {
                // Asking the user for the path input
                await promptUser("  [i] Enter the path to clone the template folder (empty for current directory): ").then(async (path) => {
                    const result = await checkAndCreateDirectory(path, template.name);
                    if (result) {
                        console.log(clc.green(`\n  [i] Downloading ${template.name}!\n`));
                        const cloneResult = await ps(`git clone ${template.url} ${result}`);
                        if (cloneResult) console.log(clc.green("  [i] Done!"));
                    } else {
                        console.log(clc.red("  [!] Invalid path or unable to create the directory."));
                    }
                })
            } else {
                console.log(clc.red("  [!] No template selected."));
            }
        });

    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        rl.close();
        console.log("");
        if (!shouldExit) {
            process.exit();
        }
    }
})();
