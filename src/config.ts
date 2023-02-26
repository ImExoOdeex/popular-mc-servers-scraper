type configType = {
	dirname: string;
	faviconDirname: string;
	filename: string;
	finalPage: number;
	startPage: number;
	generateIcons: boolean;
	iconsSaveType: "base64" | "file";
};

const config: configType = {
	dirname: "export",
	faviconDirname: "favicons",
	filename: "servers",
	finalPage: 112, // could do also infinite, cause it will stop when servers ends
	startPage: 0,
	generateIcons: true,
	iconsSaveType: "base64"
};

export default config;
