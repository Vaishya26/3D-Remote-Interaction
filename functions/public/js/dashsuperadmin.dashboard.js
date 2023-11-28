var storageRef, database, displayName, photoURL, uid_firebase, firestoreDb;
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

			getCurrentUserData(getMainDashboardData);
		} else {
			window.location.assign("/logout");
		}

	});
}

firebaseConfigure();

function addRequestRecord(docID, companyName, adminEmail, salesAdminName, salesAdminEmail, isNew) {
	if(isNew) reqString = `Create account request for ${companyName}&nbsp;`
	else reqString = `Update account request for ${companyName}&nbsp;`
	let requestHTMLString = `
	<li class="request">
		<div style="display: flex; align-items: center">
			<div class="request-img member-icon">
				<!-- <img src="/images/Group 308.svg" class="logo"/> -->
				<div class="logo"></div>
			</div>
			<div class="request-cname">
				<div class="request-cname-text">
					${reqString}
				</div>
			</div>
			<div class="request-name">
				(By&nbsp;
				<div class="request-name-text">${salesAdminName}</div>
				)
			</div>
		</div>
		<div style="display: flex; align-items: center" isNew=${isNew} adminEmail=${adminEmail} salesAdminEmail=${salesAdminEmail} companyName=${companyName} docID="${docID}">
			<div class="see-detes">
				<div class="see-details-btn" >See Details</div>
			</div>
			<div class="approve">
				<img class="logo-tick" src="/images/Group 308.svg" />
			</div>
			<div class="reject">
				<img class="logo-tick" src="/images/Group 309.svg" />
			</div>
		</div>
	</li>`

	$('#request-list').append(requestHTMLString);
}

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

$(document).on('click', '.approve', function () {
	let docID = $(this).parent().attr('docID');
	let salesAdminEmail = $(this).parent().attr('salesAdminEmail');
	let companyName = $(this).parent().attr('companyName');
	let adminEmail = $(this).parent().attr('adminEmail');
	let isNew = $(this).parent().attr('isNew');

	updateOrderStatus(docID, companyName, adminEmail, salesAdminEmail, isNew)
	$(this).parent().parent().remove();
})

function getMainDashboardData() {
	let clientCount = 0;
	let revenueCount = 0;
	$('#request-list').empty();
	clientsC.get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			// doc.data() is never undefined for query doc snapshots
			let data = doc.data();
			if(data.orderApproved) {
				clientCount += 1;
				revenueCount += parseInt(data.cost);
			} else {
				if(data.createdOn === data.updatedOn)
					addRequestRecord(doc.id, data.companyName, data.adminEmail, data.salesAdminName, data.salesAdminEmail, true);
				else
					addRequestRecord(doc.id, data.companyName, data.adminEmail, data.salesAdminName, data.salesAdminEmail, false);
			}
		});
		$('.total-clients-nums').html(clientCount);
		$('.total-revenue').html(abbreviateNumber(revenueCount));
	});
}

function getCurrentUserData(next) {

	userC.doc(uid_firebase).get()
		.then(snapshot => {
			currentUserData = snapshot.data();
		})
		.then(() => {
			if(currentUserData && currentUserData.role != 'SuperAdmin') {
				window.location.assign("/logout");
			} else {
				next();
			}
		})
}

$(document).on("click", '.see-details-btn', function () {
	let docID = $(this).parent().parent().attr("docID");
	clientsC.doc(docID).get().then(snapshot => {
		clientData = snapshot.data();
		let isNewRequest = true;
		if(clientData.createdOn != clientData.updatedOn)
			isNewRequest = false;
		$('#org-name').val(clientData.companyName);
		$('#client-name').val(clientData.name);
		$('#admin-email').val(clientData.adminEmail);
		$('#phone-no').val(clientData.contactno);
		$('#cost').val(clientData.cost);
		$('#seats-allotted').val(clientData.seatsAllotted);

		let featuresList = clientData.features;
		$('#annotationCheck').attr('checked', featuresList[0])
		$('#pdfCheck').attr('checked', featuresList[1])
		$('#model3dCheck').attr('checked', featuresList[2])
		$('#recordingCheck').attr('checked', featuresList[3])
		$('#imageCheck').attr('checked', featuresList[4])
		$('#chatCheck').attr('checked', featuresList[5])
		$('#videoCheck').attr('checked', featuresList[6])

		$('#minutes-allotted').val(clientData.minutesAllotted);
		$('#minutes-allotted').formSelect();
		$('#storage-allotted').val(clientData.storageAllotted);
		$('#storage-allotted').formSelect();
		$(function () {
			M.updateTextFields();
		});
		$('#requestDetailsModal').modal('open');
		$('#approveReq').attr("docID", docID);
		$('#approveReq').off();
		$('#approveReq').on("click", function () {
			updateOrderStatus(docID, clientData.companyName,clientData.name, clientData.adminEmail, clientData.salesAdminEmail, isNewRequest);
		});


	})
});

function updateOrderStatus(docID, companyName,name, adminEmail, salesAdminEmail, isNewRequest) {
	clientsC.doc(docID).update({
		orderApproved: true
	}).then(() => {
		swal(
			'Success',
			'Order approved',
			'success'
		).catch(swal.noop);

		if(isNewRequest) {
			sendRequestConfirmationMail(salesAdminEmail, companyName);
			addCompanyAdmin(name, adminEmail, companyName);
		}

	}).catch((error) => {
		// The document probably doesn't exist.
		console.error("Error updating document: ", error);
	});
}

function addCompanyAdmin(name, email, companyName) {
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
			sendMailToAddAdmin(res_data.email, res_data.pwd)
			addUserDataToFirestore(res_data.email, res_data.uid, companyName, name)
		},
		error: function (error) {
			console.log(error);
		}
	});

}

async function sendRequestConfirmationMail(email_id, companyName) {
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
			html: `<h2>Congratulations!</h2> <br><br>
				<h5>Your Order Request for ${companyName} has been confirmed by the Super Admin.</h5><br>
				
				<h6>Check your clients status <a href="https://ajnasuite.ajnalens.com">here</a></h6>`
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

async function sendMailToAddAdmin(email_id, pwd) {
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
			html: `Welcome to Ajnasuite Remote Assistance<br><br>Collaborate with your teammates here. You have been assigned as Admin of your company account in AjnaSuite.<br><br>
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

function addUserDataToFirestore(email, uid, companyName, name) {
	userC.doc(uid).set({
		name: name,
		email: email,
		userID: uid,
		role: "CompanyAdmin",
		companyName: companyName
	}).then(() => {
		console.log("Document successfully written!");
	}).catch((error) => {
		console.error("Error writing document: ", error);
	});
}

let makeAdminsTableRecord = (name, adminID, sales, salesReq) => {
	return "<tr>\
                <td>"+ name + "</td>\
                <td>"+ adminID + "</td>\
                <td>"+ sales + "</td>\
                <td>"+ salesReq + "</td>\
                <td><span onclick=deleteAdmin('"+ adminID + "')><i class=\"bi bi-trash-fill\"></i></span></td>\
            </tr>"
}

function getSalesAdmins() {
	const adminsC = userC.where("role", "==", "SalesAdmin");

	adminsC.get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			// doc.data() is never undefined for query doc snapshots
			let data = doc.data();
			$('#admin-table-body').append(makeAdminsTableRecord(data.name, data.userID, data.totalSales, data.pendingSales))
		});
	});
}

// ======================================== FrontEnd JS ========================================
$(".dropdown-trigger").dropdown();
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
var _seed = Date.now();
function rand(min, max) {
	min = valueOrDefault(min, 0);
	max = valueOrDefault(max, 0);
	_seed = (_seed * 9301 + 49297) % 233280;
	return min + (_seed / 233280) * (max - min);
}

function valueOrDefault(params, defaultValue) {
	return params === undefined ? defaultValue : params;
}
function numbers(config) {
	var cfg = config || {};
	var min = valueOrDefault(cfg.min, 0);
	var max = valueOrDefault(cfg.max, 100);
	var from = valueOrDefault(cfg.from, []);
	var count = valueOrDefault(cfg.count, 8);
	var decimals = valueOrDefault(cfg.decimals, 8);
	var continuity = valueOrDefault(cfg.continuity, 1);
	var dfactor = Math.pow(10, decimals) || 0;
	var data = [];
	var i, value;

	for(i = 0; i < count; ++i) {
		value = (from[i] || 0) + rand(min, max);
		if(rand() <= continuity) {
			data.push(Math.round(dfactor * value) / dfactor);
		} else {
			data.push(null);
		}
	}

	return data;
}
var l = [];
const days = ["S", "M", "T", "W", "T", "F", "S"];
for(var i = 0; i < 70; i++) {
	if(i % 10 == 0) {
		l[i] = days[i / 10];
	} else {
		l[i] = "";
	}
}
const ctx = document.getElementById("myChart").getContext("2d");
const myChart = new Chart(ctx, {
	type: "line",
	data: {
		labels: l,
		datasets: [
			{
				data: numbers({
					count: l.length - 40,
					min: 0,
					max: 100,
				}),
				borderColor: "rgba(255, 255, 255,1)",
				borderWidth: 1,
				tension: 1,
			},
		],
	},
	options: {
		elements: {
			point: {
				radius: 0,
			},
		},
		plugins: {
			tooltip: {
				callbacks: {
					label: function (context) {
						return context.parsed.y;
					},
				},
			},
			legend: {
				display: false,
			},
		},
		responsive: true,
		aspectRatio: $(".canv").innerWidth() / $(".canv").innerHeight(),
		scales: {
			y: {
				ticks: {
					display: false,
				},
				grid: {
					drawBorder: false,
					color: function (context) {
						const chart = context.chart;
						const {ctx, chartArea} = chart;
						const gradient = ctx.createLinearGradient(
							0,
							chartArea.bottom,
							0,
							chartArea.top
						);
						gradient.addColorStop(0, " #787ff6");
						gradient.addColorStop(0.5, "rgba(255,255,255, 0.5)");
						gradient.addColorStop(1, " #787ff6");
						return gradient;
					},
				},
			},
			x: {
				grid: {
					drawBorder: false,
					color: function (context) {
						const chart = context.chart;
						const {ctx, chartArea} = chart;
						const gradient = ctx.createLinearGradient(
							chartArea.left,
							0,
							chartArea.right,
							0
						);
						gradient.addColorStop(0, " #787ff6");
						gradient.addColorStop(0.5, "rgba(255,255,255, 0.5)");
						gradient.addColorStop(1, " #787ff6");
						return gradient;
					},
				},
				ticks: {
					callback: function (val, index) {
						return index % 10 === 0 ? this.getLabelForValue(val) : "";
					},
					color: [
						"rgba(255,255,255,0.5)",
						"rgba(255,255,255,0.5)",
						"rgba(255,255,255,0.5)",
						"rgba(255,255,255,0.5)",
						"rgba(255,255,255,0.5)",
						"rgba(255,255,255,1)",
						"rgba(255,255,255,0.5)",
					],
				},
			},
		},
	},
});
