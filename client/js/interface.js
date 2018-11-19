$(document).ready(() => {
	$("#new_ship").click(() => {
		let new_ship_code = `[${$("#new_ship_code").val()}]`;
		let new_ship_JSON = JSON.parse(new_ship_code);

		console.log(new_ship_JSON);
	});
});