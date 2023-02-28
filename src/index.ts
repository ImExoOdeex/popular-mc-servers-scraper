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

	for (let i = config.startPage; i <= config.finalPage; i++) {
		percentDone = (i / config.finalPage) * 100;
		console.log(`${percentDone.toFixed(0)}% | ${i}/${config.finalPage}`);

		await page.goto(`https://minecraft-mp.com/servers/players/${i >= 2 ? i + "/" : ""}`, {
			waitUntil: "domcontentloaded"
		});

		const table = await page.$(".table");

		const trs = await table?.$$("tbody tr");
		if (!trs?.length) {
			console.log("No servers detected! Stopping loop!");
			break;
		}

		for (const tr of trs) {
			console.log(serverID);

			const tds = await tr.$$("td");

			const td = tds[1];
			const divs = await td.$$("div");
			const div = divs[divs.length - 1];
			const buttons = await div?.$$("button");
			const button = buttons[0];
			const strong = await button.$("strong");
			const server: string = (await strong?.evaluate((node) => node.innerHTML)).replace(":25565", "");

			const tags: string[] = [];

			if (config.generateTags) {
				const tagsTd = tds[4];
				const tagsByClass = await tagsTd.$$(".badge");
				console.log("tagsByClass", tagsByClass);

				tagsByClass.map(async (t) => {
					const tag = await t.evaluate((node) => node.innerHTML);
					console.log(tag);

					tags.push(tag);
				});
			}

			let icon;

			if (server.includes("Private Server")) {
				privateServers++;
				continue;
			} else if (/^\d/.test(server)) {
				ipOnlyServers++;
				continue;
			} else {
				if (config.generateIcons) {
					const imgTd = tds[0];
					const image = await imgTd.$("img");
					const imageSrc = await image?.evaluate((node) => node.getAttribute("src"));

					if (imageSrc) {
						const imageURL = `https://minecraft-mp.com${imageSrc}`;

						const pageNewFavicon = await browser.newPage();
						const response = await pageNewFavicon.goto(imageURL, {
							timeout: 0,
							waitUntil: "domcontentloaded"
						});
						const imageBuffer = await response?.buffer();

						if (config.iconsSaveType === "base64") {
							if (imageBuffer) {
								icon = "data:image/png;base64," + imageBuffer.toString("base64");
							}
						} else {
							if (imageBuffer) {
								if (!fs.existsSync(config.dirname)) {
									await fs.promises.mkdir(config.dirname);
								}
								if (!fs.existsSync(config.dirname + "/" + config.faviconDirname)) {
									await fs.promises.mkdir(config.dirname + "/" + config.faviconDirname);
								}
								await fs.promises.writeFile(
									`./${config.dirname}/${config.faviconDirname}/${server.toLowerCase()}.webp`,
									imageBuffer ?? ""
								);
								icon = `${server.toLowerCase()}.webp`;
							}
						}
						pageNewFavicon.close();
					}
				}

				serverArray.push(
					config.generateIcons && config.generateTags
						? { id: serverID, server, tags, icon }
						: config.generateIcons
						? { id: serverID, server, icon }
						: config.generateTags
						? { id: serverID, server, tags }
						: { id: serverID, server }
				);
				serverID++;
			}
		}
	}

	console.log(`Private servers: ${privateServers}\nServers without domain: ${ipOnlyServers}`);

	/* 
		Saving servers to the file
		uwu
	*/

	try {
		if (fs.existsSync(`./${config.dirname}/${config.filename}.json`)) {
			fs.writeFileSync("./export/servers.json", "", {
				encoding: "utf-8"
			});
		}

		if (!fs.existsSync(config.dirname)) {
			fs.mkdirSync(config.dirname);
		}

		fs.writeFileSync(`./${config.dirname}/${config.filename}.json`, JSON.stringify(serverArray), {
			encoding: "utf-8"
		});

		console.log(`Saved ${serverArray.length} servers to /${config.dirname}/${config.filename}.json!`);
	} catch (err) {
		console.error(err);
	}

	await browser.close();
}

main().catch((err) => `app crashed: ${err}`);
