import puppeteer from "puppeteer";
import fs from "fs";
import config from "./config";

async function main() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	const serverArray = [];
	let serverID = 1;
	let privateServers = 0;
	let ipOnlyServers = 0;
	let percentDone = 0;

	for (let i = 1; i <= config.finalPage; i++) {
		percentDone = (i / config.finalPage) * 100;
		console.log(`${percentDone.toFixed(0)}% | ${i}/${config.finalPage}`);

		await page.goto(
			`https://minecraft-mp.com/servers/players/${i >= 2 ? i + "/" : ""}`,
			{
				waitUntil: "domcontentloaded"
			}
		);

		const table = await page.$(".table");

		const trs = await table?.$$("tbody tr");
		if (!trs?.length) {
			return console.log("unable to find `tr` in tbody");
		}

		for (const tr of trs) {
			const tds = await tr.$$("td");
			const td = tds[1];
			const divs = await td.$$("div");
			const div = divs[divs.length - 1];
			const buttons = await div?.$$("button");
			const button = buttons[0];
			const strong = await button.$("strong");
			const server: string = (
				await strong?.evaluate((node) => node.innerHTML)
			).replace(":25565", "");

			if (server.includes("Private Server")) {
				privateServers++;
			} else if (/^\d/.test(server)) {
				ipOnlyServers++;
			} else {
				serverArray.push({ id: serverID, server });
				serverID++;
			}
		}
	}

	console.log(
		`Private servers: ${privateServers}\nServers without domain: ${ipOnlyServers}`
	);

	try {
		if (fs.existsSync(`./${config.dirname}/${config.filename}.json`)) {
			fs.writeFileSync("./export/servers.json", "", {
				encoding: "utf-8"
			});
		}

		if (!fs.existsSync(config.dirname)) {
			fs.mkdirSync(config.dirname);
		}

		fs.writeFileSync(
			`./${config.dirname}/${config.filename}.json`,
			JSON.stringify(serverArray),
			{
				encoding: "utf-8"
			}
		);

		console.log(
			`Saved ${serverArray.length} servers to /${config.dirname}/${config.filename}.json!`
		);
	} catch (err) {
		console.error(err);
	}
}

main().catch((err) => `app crashed: ${err}`);
