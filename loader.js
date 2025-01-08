/**
 * @typedef OutDiagnosticMsg 
 * @property {string} filePath
 * @property {number} line 
 * @property {number} start 
 * @property {number} length 
 * @property {string} message 
 */

std.loadScript("./core.js");

var assembler = new zgassembler();

assembler.fileUtils.ReadFile = (filePath) => {
	const file = std.open(filePath, "r");
	let value, temp = [];
	while ((value = file.getByte()) >= 0) {
		temp.push(value);
	}

	const buffer = new Uint8Array(temp);
	file.close();
	return buffer;
}

assembler.fileUtils.SaveFile = (filePath, data) => {
	const file = std.open(filePath, "wb");
	file.write(data.buffer, 0, data.length);
	file.close();
}

assembler.fileUtils.PathType = (filePath) => {
	const temp = os.stat(filePath)[0];
	if (temp === null)
		return "none";

	if (temp.mode & os.S_IFREG)
		return "file";

	if (temp.mode & os.S_IFDIR)
		return "folder";

	return "none";
}

assembler.fileUtils.ShowMessage = (message) => {
	console.log(message);
}

assembler.fileUtils.BytesToString = (bytes) => {
	const temp = "./temp.data";
	assembler.fileUtils.SaveFile(temp, bytes);

	const tempFile = std.open(temp, "r");
	const result = tempFile.readAsString();
	tempFile.close();
	return result;
}

/**
 * @function Compile file
 * 
 */
async function BuildFile(option) {
	let tempFile = std.open("args", "r");
	let text = tempFile.readAsString();
	args = text.split("\n");
	let SourceFile = args[0];
	let output = args[1];
	let platform = args[2];
	let outmode = args[3];
	var temp = parseInt(args[4], 16);
	if (temp>255) {
		fill = 0xFF;
	} else {
		fill = temp;
	}
	console.log(SourceFile);
	assembler.SwitchLanguage("en");
	assembler.SwitchPlatform(platform);
	/**@type {Uint8Array} */
	buffer = assembler.fileUtils.ReadFile(SourceFile);
	text = assembler.fileUtils.BytesToString(buffer);
	/**@type {Int16Array | undefined} */
	const result = await assembler.CompileText(text, SourceFile);
	if (result) {
		let fileData = new Uint8Array(result.map(val => val === -1 ? fill : val));
		assembler.fileUtils.SaveFile(output, fileData);
	}

	/**@type {OutDiagnosticMsg[]} */
	let errors = assembler.diagnostic.GetExceptions();
	for (let i = 0; i < errors.length; i++) {
		const e = errors[i];
		console.log(`File: ${e.filePath}`);
		console.log(`Line: ${e.filePath}`);
		console.log(e.message + "\n");
	}

	errors = assembler.diagnostic.GetWarnings();
	for (let i = 0; i < errors.length; i++) {
		const e = errors[i];
		console.log(`File: ${e.filePath}`);
		console.log(`Line ${e.filePath}`);
		console.log(e.message + "\n");
	}
}

/**
 * 
 * @param {Int16Array} data 
 */
function ProcessResult(data) {
	const fileData = new Uint8Array(data.length);
	for (let i = 0; i < data.length; i++) {
		if (data[i] < 0)
			fileData[i] = 0;
		else
			fileData[i] = data[i];
	}
	return fileData;
}

BuildFile();