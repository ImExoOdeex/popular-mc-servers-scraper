type configType = {
	dirname: string;
	faviconDirname: string;
	filename: string;
	finalPage: number;
	startPage: number;
	generateIcons: boolean;
	iconsSaveType: "base64" | "file";
	generateTags: boolean;
};

const config: configType = {
	dirname: "export",
	faviconDirname: "favicons",
	filename: "servers",
	finalPage: 120, // could do also infinite, cause it will stop when servers ends
	startPage: 1,
	generateIcons: true,
	iconsSaveType: "base64",
	generateTags: true
};

export default config;
