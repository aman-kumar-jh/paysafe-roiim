import React from "react";
import "./App.css";
import axios from "axios";

const intitalState = {
	name: "",
	email: "",
	amount: "",
	username: "",

	name_error: "",
	email_error: "",
	amount_error: "",
	username_error: "",
};

class App extends React.Component {
	state = intitalState;

	checkout = () => {
		//const paysafe = window.paysafe.checkout.min;
		const str =
			"public-7751:B-qa2-0-5f031cbe-0-302d021500890ef262296563accd1cb4aab790323d2fd570d30214510bcdacdaa4f03f59477eef13f2af5ad13e3044";
		const KEY = btoa(str);
		window.paysafe.checkout.setup(
			KEY,

			{
				currency: "USD",
				amount: this.state.amount * 100,
				customer: {
					firstName: this.state.name,
					lastName: "Dee",
					email: this.state.email,
					phone: "1234567890",
					dateOfBirth: {
						day: 1,
						month: 7,
						year: 1990,
					},
				},
				billingAddress: {
					nickName: this.state.name,
					street: "India",
					street2: "India",
					city: "India",
					zip: "95014",
					country: "IN",
					state: "CA",
				},
				locale: "en_US",
				environment: "TEST",
				merchantRefNum: this.state.username,
				canEditAmount: false,
				merchantDescriptor: {
					dynamicDescriptor: "XYZ",
					phone: "1234567890",
				},
				displayPaymentMethods: ["card"],
				paymentMethodDetails: {
					paysafecard: {
						consumerId: "1232323",
					},
					vippreferred: {
						consumerId: "550726575",
						accountId: "1679688456",
					},
				},
			},
			(instance, error, result) => {
				if (result && result.paymentHandleToken) {
					result["merchantRefNum"] = this.state.username;
					result["currency"] = "USD";
					axios
						.post(
							"https://n5np1597r7.execute-api.ap-south-1.amazonaws.com/dev/payment",
							{
								data: result,
							}
						)
						.then((res) => {
							console.log(res);
							if (res.data.message === "successful") {
								instance.showSuccessScreen(res.data.paymentId);
							} else {
								instance.showFailureScreen();
							}
						})
						.catch((err) => {
							console.log(err);
							instance.showFailureScreen();
							if (instance.isOpen()) instance.close();
						});
				} else {
					alert("something went wrong,Please try again");
					this.setState(intitalState);
					// Handle the error
				}
			},
			(stage, expired) => {
				//console.log(stage);
				switch (stage) {
					case "PAYMENT_HANDLE_NOT_CREATED": // Handle the scenario
					case "PAYMENT_HANDLE_CREATED": // Handle the scenario
					case "PAYMENT_HANDLE_REDIRECT": // Handle the scenario
					case "PAYMENT_HANDLE_PAYABLE": // Handle the scenario
					default: // Handle the scenario
				}
				this.setState(intitalState);
			}
		);
	};

	saveUser = () => {
		const body = { userId: this.state.username, name: this.state.name };
		axios
			.post(
				"https://n5np1597r7.execute-api.ap-south-1.amazonaws.com/dev/create-customer",
				body
			)
			.then((res) => console.log(res))
			.catch((err) => console.log(err));
	};

	changeUserName = (e) => {
		this.setState({ username: e.target.value });
	};

	changeName = (e) => {
		this.setState({ name: e.target.value });
	};

	changeEmail = (e) => {
		this.setState({ email: e.target.value });
	};

	changeAmount = (e) => {
		this.setState({ amount: e.target.value });
	};

	validForm = () => {
		let error_happen = false;
		const REG = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		if (this.state.username === "") {
			error_happen = true;
			this.setState({ username_error: "Enter Valid Username" });
		}
		if (this.state.name === "") {
			error_happen = true;
			this.setState({ name_error: "Enter Valid Name" });
		}

		if (this.state.email === "" || !REG.test(this.state.email)) {
			error_happen = true;
			this.setState({ currenccy_error: "Enter Valid Email" });
		}
		if (this.state.amount <= 0) {
			error_happen = true;
			this.setState({ amount_error: "Amount should be greater than 0" });
		}

		if (error_happen) return false;
		return true;
	};

	makePayment = (e) => {
		if (this.validForm()) {
			this.checkout();
		}
	};

	render() {
		return (
			<div className="center ui container">
				<form className="ui form">
					<h4 className="ui dividing header">Information</h4>
					<div className="field">
						<div className="two fields">
							<div className="field">
								<div className="error">{this.state.username_error}</div>
								<label>Username</label>
								<input
									type="text"
									name="username"
									placeholder="Username"
									value={this.state.username}
									onChange={this.changeUserName}
								/>
							</div>
							<div className="field">
								<div className="error">{this.state.name_error}</div>
								<label>Name</label>
								<input
									type="text"
									name="lastName"
									placeholder="Name"
									onChange={this.changeName}
									value={this.state.name}
								/>
							</div>
						</div>
					</div>
					<div className="two field">
						<div className="field">
							<div className="error">{this.state.currenccy_error}</div>

							<label>Email</label>
							<input
								type="text"
								name="amount"
								placeholder="email address"
								value={this.state.email}
								onChange={this.changeEmail}
							/>
						</div>
						<div className="field">
							<div className="error">{this.state.amount_error}</div>
							<label>Amount($)</label>
							<input
								type="text"
								name="amount"
								placeholder="AMOUNT"
								value={this.state.amount}
								onChange={this.changeAmount}
							></input>
						</div>
					</div>
					<div className="ui button" onClick={this.makePayment} tabIndex="0">
						Donate
					</div>
				</form>
			</div>
		);
	}
}

export default App;
