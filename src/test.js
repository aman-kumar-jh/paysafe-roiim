const axios = require("axios");
const btoa = require("btoa");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({
	region: "ap-south-1",
	apiVersion: "2012-08-10",
});
const KEY_PAIR =
	"private-7751:B-qa2-0-5f031cdd-0-302d0214496be84732a01f690268d3b8eb72e5b8ccf94e2202150085913117f2e1a8531505ee8ccfc8e98df3cf1748";
const API_KEY = btoa(KEY_PAIR);

const register = async (DATA, callback) => {
	var body = {
		merchantCustomerId: DATA.merchantRefNum,
		locale: "en_US",
		firstName: DATA.name,
		lastName: "Smith",
		dateOfBirth: {
			year: 1981,
			month: 10,
			day: 24,
		},
		email: "john.smith@email.com",
		phone: "777-444-8888",
	};

	axios
		.post("https://api.test.paysafe.com/paymenthub/v1/customers", body, {
			headers: {
				"Content-Type": "application/json",
				Authorization: "Basic " + API_KEY,
				Simulator: "EXTERNAL",
				"Access-Control-Allow-Origin": "*",
			},
		})
		.then((res) => {
			console.log(res.data);

			const params = {
				Item: {
					UserId: {
						S: DATA.merchantRefNum,
					},
					CustomerId: {
						S: res.data.id,
					},
				},
				TableName: "paysafe-user",
			};

			dynamodb.putItem(params, function (err, data) {
				if (data) {
					console.log(data);
					callback(null, { message: "successful" });
				} else if (err) {
					console.log(err);
					callback(null, err);
				}
			});

			//callback(null,res.data);
		})
		.catch((err) => {
			console.log(err);
			callback(null, err);
		});
};

exports.handler = (event, context, callback) => {
	const DATA = event.data;

	const refNum = event.data.merchantRefNum;

	const params = {
		Key: {
			UserId: {
				S: refNum,
			},
		},
		TableName: "paysafe-user",
	};

	dynamodb.getItem(params, function (err, data) {
		if (data) {
			console.log(data);
			if (data.Item) {
				callback(null, { message: "successful" });
			} else {
				register(DATA, callback);
			}
		} else if (err) {
			console.log(err);
			callback(null, err);
		}
	});
};
