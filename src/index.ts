import puppeteer from "puppeteer";

async function main() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("https://minecraft-mp.com/servers/players/", {
		waitUntil: "domcontentloaded"
	});

	const table = await page.$(".table");

	const trs = await table?.$$("tbody tr");
	if (!trs?.length) {
		return console.log("unable to find `tr` in tbody");
	}

	for (const tr of trs) {
		const tds = await tr.$$("td");
		const td = tds[1];
		const divs = await td.$$("div");

		// last div from array
		const div = divs[divs.length - 1];
		const buttons = await div?.$$("button");
		const button = buttons[0];
		const strong = await button.$("strong");
		const server = await strong?.evaluate((node) => node.innerHTML);
		console.log(server);
	}
}

main().catch((err) => `app crashed: ${err}`);
