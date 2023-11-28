var storageRef, database, displayName, photoURL, uid_firebase, firestoreDb;
let clientsC, userC, authC;

function firebaseConfigure() {
	firebase.initializeApp(firebaseConfig);
	storageRef = firebase.storage().ref();
	database = firebase.database();
	firestoreDb = firebase.firestore();
	clientsC = firestoreDb.collection("clients");
	userC = firestoreDb.collection("users");
	authC = firestoreDb.collection("auth");

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

			getCurrentUserData(getSalesDashboardData);

			$(".dropdown-trigger").dropdown();
		} else {
			window.location.assign("/logout");
		}

	});
}

function getCurrentUserData(next) {

	userC.doc(uid_firebase).get()
		.then(snapshot => {
			currentUserData = snapshot.data();
		})
		.then(() => {
			if(currentUserData.role != 'SuperAdmin') {
				window.location.assign("/logout");
			} else {
				next();
			}
		});
}

firebaseConfigure();

function abbreviateNumber(value) {
	var newValue = value;
	if(value >= 1000) {
		var suffixes = ["", "K", "M", "B", "T"];
		var suffixNum = Math.floor(("" + value).length / 3);
		var shortValue = '';
		for(var precision = 2; precision >= 1; precision--) {
			shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
			var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
			if(dotLessShortValue.length <= 2) {break;}
		}
		if(shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
		newValue = shortValue + suffixes[suffixNum];
	}
	return newValue;
}

function getSalesDashboardData() {
	userC.where("role", "==", "SalesAdmin").get().then((salesQuerySnapshot) => {
		salesQuerySnapshot.forEach((doc) => {
			// doc.data() is never undefined for query doc snapshots
			let data = doc.data();
			let customerCount = 0, revenueCount = 0;

			clientsC.where("salesAdminDocID", "==", doc.id).where("orderApproved", "==", true)
				.get().then((clientsQuerySnapshot) => {
					clientsQuerySnapshot.forEach((clientDoc) => {
						let clientData = clientDoc.data();
						customerCount += 1;
						revenueCount += parseInt(clientData.cost);
					})
				}).then(() => {
					addSalesAdminCard(doc.id, data.name, data.email, customerCount, abbreviateNumber(revenueCount));
				})
		});
	}).then(() => {

	});
}

function addSalesAdminCard(salesUserID, name, email, custCount, revenue) {
	let divCount = $(".sales-admin-body > div").length + 1;
	let stringHTMl = `<div class="sales-admin-account">
		<div class="sales-more waves-effect dropdown-trigger" data-target="dropdown${divCount}">
			<img src="/images/Group 295.svg" alt="" />
		</div>
		<ul id="dropdown${divCount}" class="dropdown-content">
			<li class="list-body">
				<a class="adminDetailsBtn" docID=${salesUserID}>
					<img src="/images/Vectori.svg" class="dd-icon" />More&nbsp;Details
				</a>
			</li>
			<li class="list-body">
				<a class="removeAdminBtn" docID=${salesUserID}>
					<img src="/images/Groupr.svg" class="dd-icon" />Remove&nbsp;Admin
				</a>
			</li>
		</ul>
		<div class="sales-acc">
			<div class="sale-acc-logo">
				<div class="logo sample"></div>
			</div>
			<div class="sales-acc-detail">
				<div class="sales-acc-name-text">${name}</div>
				<div class="sales-acc-name-email">${email}</div>
			</div>
		</div>
		<div class="sales-account-dets">
			<div class="cstmr-counts">
				<div class="cstmr-num">${custCount}</div>
				<div class="cstmr-num-text">Total customers</div>
			</div>
			<div class="sales-price">
				<div class="sales-price-num">${revenue}</div>
				<div class="sales-price-num-text">
					Total Revenue Generate
				</div>
			</div>
		</div>
	</div>`;

	$(".sales-admin-body").append(stringHTMl);
	$(".dropdown-trigger").dropdown();
}

$(document).on("click", ".removeAdminBtn", function () {
	let docID = $(this).attr('docID');

	userC.doc(docID).delete().then(() => {
		swal(
			'Success',
			'Sales Admin deleted',
			'success'
		).catch(swal.noop);
		$(this).parent().parent().parent().remove();
	}).catch((error) => {
		console.error("Error updating document: ", error);
	});
});

$(document).on("click", ".adminDetailsBtn", function () {
	let docID = $(this).attr('docID');

	localStorage.setItem("salesAdminDocID", docID);
	localStorage.setItem("detailsType", "salesAdmin");
	window.location.assign("/clients");

});

function isEmail(email) {
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}

$('#addSalesAdminBtn').on('click', function () {
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
	let email = $('#adminEmail').val();
	if(!isEmail(email)) {
		swal(
			'Error',
			'Not a valid Email',
			'error'
		).catch(swal.noop);
		return;
	}

	addSalesAdmin(email, name);
})

function addSalesAdmin(email, name) {
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
			sendMailToAddSalesAdmin(res_data.email, res_data.pwd);
			addUserDataToFirestore(res_data.name, res_data.email, res_data.uid)
		},
		error: function (error) {
			console.log(error);
		}
	});
}

async function sendMailToAddSalesAdmin(email_id, pwd) {
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
			html: `Welcome to Ajnasuite Remote Assistance<br><br>You have been assigned as the Sales Admin for AjnaSuite <br><br>
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
				"Sales Admin Added!",
				"Credentials has been sent to the email ID",
				"success",
			).catch(swal.noop);
		}
		else {
			swal(
				"Error",
				"Unable to add Sales Admin. Please try again later.",
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
		role: "SalesAdmin",
		companyName: "AjnaLens"
	}).then(() => {
		console.log("Document successfully written!");
	}).catch((error) => {
		console.error("Error writing document: ", error);
	});
}

// ======================================== FrontEnd JS ========================================

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