module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {


        if (message.author.bot) return;

        if (message.content.indexOf(this.client.config.prefix) !== 0) return;

        //Seperate command name from arguments
        const args = message.content.slice(this.client.config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        //Check whether the command or alias exist
        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
        if (!cmd) return;

        console.log(`${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`);
        cmd.run(message, args);

    }
}
