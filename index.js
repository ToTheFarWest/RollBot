const Discord = require("discord.js");
const fs = require("fs");
var logger = require("winston");
const klaw = require("klaw");
const path = require("path");
const Enmap = require("enmap");

class RollBot extends Discord.Client {
    constructor(options) {
        super(options);
        this.config = require("./config.json");

        this.commands = new Enmap();
        this.aliases = new Enmap();
    }

    async clean(client, text){
        if (text && text.constructor.name == "Promise")
            text = await text;
        if (typeof evaled !== "string")
            text = require("util").inspect(text, {depth: 0});

        text = text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203))
            .replace(client.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");

        return text;
    }

    loadCommand(commandPath, commandName) {
        try {
            const props = new (require(`${commandPath}${path.sep}${commandName}`))(client);
            console.log(`Loading Command: ${props.help.name}. 👌`);
            props.conf.location = commandPath;
            if (props.init) {
                props.init(client);
            }
            client.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    }
}

const client = new RollBot();

const init = async () => {
    //Command Handler
    klaw("./commands").on("data", (item) => {
        const cmdFile = path.parse(item.path);
        if (!cmdFile.ext || cmdFile.ext !== ".js") return;
        const response = client.loadCommand(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
        if (response) console.log(response);
    });

    //Event Handler
    await fs.readdir("./events/", (err, evtFiles) => {
        if (err) console.error(err);
        console.log(`Loading a total of ${evtFiles.length} events`);
        evtFiles.forEach(file => {
            const eventName = file.split('.')[0];
            const event = new (require(`./events/${file}`))(client);
            client.on(eventName, (...args) => event.run(...args));
        });

    });
    client.login(client.config.token);
};

init();
