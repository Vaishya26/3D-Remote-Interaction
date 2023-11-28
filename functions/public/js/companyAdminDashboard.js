
var storageRef, database, displayName, photoURL, uid_firebase, firestoreDb, currentUserData;
let clientsC, userC, authC;

function firebaseConfigure() {
	firebase.initializeApp(firebaseConfig);
	storageRef = firebase.storage().ref();
	database = firebase.database();
	firestoreDb = firebase.firestore();
	clientsC = firestoreDb.collection("clients");
	userC = firestoreDb.collection("users");
	authC = firestoreDb.collection("clients");
	firebase.auth().onAuthStateChanged(function (user) {
		if(user) {
			// User is signed in.
			displayName = user.displayName;
			var email = user.email;
			var emailVerified = user.emailVerified;
			photoURL = user.photoURL;
			var isAnonymous = user.isAnonymous;
			uid_firebase = user.uid;
			var providerData = user.providerData;

			getCurrentUserData(getCompanyData);

			$(".dropdown-trigger").dropdown();
		} else {
			// console.log("user not logged in");
			window.location.assign("/logout");
		}

	});
}

function getCurrentUserData(next) {

	userC.doc(uid_firebase).get()
		.then(snapshot => {
			currentUserData = snapshot.data();
			$(".name").append(currentUserData.name)
			$(".position").append(currentUserData.role)

		})
		.then(() => {
			if(currentUserData.role != 'CompanyAdmin') {
				window.location.assign("/logout");
			} else {
				next();
			}
		});
}

firebaseConfigure();

function getCompanyData() {
	getCompanyMembers();
	clientsC.where("companyName", "==", currentUserData.companyName).get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				console.log(doc.id, '=>', doc.data());
				let companyData = doc.data();
				$('#time-analog').attr("aria-valuenow", "10");
				$('#time-analog').attr("aria-valuemax", companyData.storageAllotted);
				$('#time-analog').attr("style", "--value: calc(10 / " + companyData.storageAllotted + " * 100); --final: 10");
			});

		});

}

async function getCompanyMembers() {
	const snapshot = await userC.where("companyName", "==", currentUserData.companyName).get()
	snapshot.forEach(doc => {
		const usersData = doc.data();
		let htmlString;


		let roleStr, divCount = $('.ml-ul > li').length + 1;

		if(usersData.role == "CompanyAdmin") roleStr = "Admin";
		else roleStr = "User";

		if(usersData.email == currentUserData.email)
			htmlString = `<li class="member admin">`
		else
			htmlString = `<li class="member">`

		htmlString += `<div class="member-idt">
					<div class="member-icon">
						<div class="logo"></div>
					</div>
					<div class="member-name">${usersData.name}</div>
				</div>
				<div class="member-role dropdown-trigger waves-effect" data-target="dropdown${divCount}"
					href="#">
					<div class="member-role-text roleText${divCount}">${roleStr}</div>
					<div class="member-role-arrow">
						<img src="/images/Vector 36.svg" alt="" />
					</div>
				</div>
				<ul docID=${doc.id} id="dropdown${divCount}" class="dropdown-content">
					<li>
						<form action="#">
							<p class="list-body">
								<label>
									<input name="group${divCount}" docID=${doc.id} textDivID="roleText${divCount}" type="radio" class="with-gap changeRoleDropdown"
										value="Admin" />
									<span>Admin</span>
								</label>
							</p>
							<p class="list-body">
								<label>
									<input class="with-gap changeRoleDropdown"  docID=${doc.id} textDivID="roleText${divCount}" name="group${divCount}" type="radio"
										value="User" />
									<span>User</span>
								</label>
							</p>
						</form>
					</li>
					<li class="divider" tabindex="-1"></li>
					<li class="list-body">
						<a href="javascript:void(0);" style="display: flex; color: red">
							<i class="material-icons">delete</i>Remove
						</a>
					</li>
				</ul>
			</li>`;


		if(usersData.email == currentUserData.email)
			$('.ml-ul').prepend(htmlString);
		else
			$('.ml-ul').append(htmlString);
		$(".dropdown-trigger").dropdown();
		$('input:radio[name="group' + divCount + '"][value="' + roleStr + '"]').attr('checked', true);
	})

}

$(document).on('change', '.changeRoleDropdown', function () {
	let role = $(this).val();
	let textDivID = $(this).attr('textDivID');
	let docID = $(this).attr('docID');

	let dbRole = {"User": "ClientUser", "Admin": "ClientAdmin"}

	$('.' + textDivID).text(role);

	userC.doc(docID).update({role: dbRole[role]})
		.then(() => {
			swal(
				'Role Changed',
				'',
				'success'
			).catch(swal.noop)
		});
});

function isEmail(email) {
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}

$('#addClientUserBtn').on('click', function () {
	// user input name
	let name = $('#userName').val();
	if(name.length==0){
		swal(
			'Error',
			'Name field is empty',
			'error'
		).catch(swal.noop);
		return ;
	}
	// user input email
	let email = $('#userEmail').val();
	if(!isEmail(email)) {
		swal(
			'Error',
			'Not a valid Email',
			'error'
		).catch(swal.noop);
		return;
	}

	addClientUser(email,name);
})

function addClientUser(email, name) {
	const data = {
		email: email,
		name: name
	}

	$.ajax({
		url: "https://ajnasuite.ajnalens.com/addUser",
		type: 'POST',
		data: JSON.stringify(data),
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"CSRF-Token": Cookies.get("XSRF-TOKEN")
		},
		cache: false,
		contentType: "application/json; charset=utf-8",
		processData: true,
		success: function (response) {
			let res_data = JSON.parse(response).data;
			console.log(res_data);
			sendMailToAddUser(res_data.email, res_data.pwd)
			addUserDataToFirestore(res_data.name, res_data.email, res_data.uid)
		},
		error: function (error) {
			console.log(error);
		}
	});

}

async function sendMailToAddUser(email_id, pwd) {
	await fetch("/sendEmail", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"CSRF-Token": Cookies.get("XSRF-TOKEN"),
		},
		body: JSON.stringify({
			subject: "Welcome to AjnaSuite",
			to: email_id,
			html: `Welcome to Ajnasuite Remote Assistance<br><br>Collaborate with your teammates here. <br><br>
				<h4>Your Credentials:</h4><br>
				Email: <h6>${email_id}</h6><br>
				Password: <h6>${pwd}</h6><br><br>
				It is recommended to change your password.<br><br>
				<h6><a href="https://ajnasuite.ajnalens.com">Click here to redirect</a></h6>`
		}),
	}).then((response) => {
		// console.log(response.status); // 200
		// console.log(response.statusText); // OK
		if(response.status === 200) {
			swal(
				"User Added!",
				"Credentials has been sent to the email ID",
				"success",
			).catch(swal.noop);
		}
		else {
			swal(
				"Error",
				"Unable to add user. Please try again later.",
				"error",
			).catch(swal.noop);
		}
	});
}

function addUserDataToFirestore(name, email, uid) {
	userC.doc(uid).set({
		name: name,
		email: email,
		userID: uid,
		role: "ClientUser",
		companyName: currentUserData.companyName
	}).then(() => {
		console.log("Document successfully written!");
	}).catch((error) => {
		console.error("Error writing document: ", error);
	});
}


// ======================================== FrontEnd JS ========================================
$(".dropdown-trigger").dropdown({
	onCloseStart: function (e) {
		console.log($(e).find("img").attr("src", "/static/Vector 36.svg"));
		console.log(
			$(e)
				.find(".member-role-text")
				.text(
					$("#" + $(e).attr("data-target"))
						.find("form")
						.serialize()
						.split("=")[1]
				)
		);
	},
});
$(document).ready(function () {
	$(".modal").modal();
});
$(".member-role.dropdown-trigger.waves-effect").click(function () {
	$(this).find("img").attr("src", "/static/Vector 40.svg");
});
// $("[data-target='dropdown1']").parent().remove()
$(".sales-price-num").each(function () {
	$(this).text(parseInt($(this).text()).toLocaleString());
});
$(".time-num").text(parseInt($(".time-num").text()).toLocaleString());
