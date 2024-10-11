const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);

async function ps(command) {
    const { stdout, stderr } = await exec(command);
    if (stderr) return stderr;
    return stdout ? stdout : null;
}

module.exports = { ps };