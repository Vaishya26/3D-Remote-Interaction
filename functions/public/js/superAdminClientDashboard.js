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

			getCurrentUserData();
			if(localStorage.getItem("detailsType") == "salesAdmin") {
				let docID = localStorage.getItem("salesAdminDocID");
				getSalesAdminsClientsData(docID);
			} else {
				getAllSalesData();
			}

			$(".dropdown-trigger").dropdown();
		} else {
			// console.log("user not logged in");
			window.location.assign("/logout");
		}

	});
}

function getAllSalesData() {
	$('#clientTableBody').empty();
	clientsC.where("orderApproved", "==", true).get().then((snapshot) => {
		snapshot.forEach(doc => {
			let data = doc.data();
			addToClientTable(data.createdOn, data.companyName, data.salesAdminName, abbreviateNumber(parseInt(data.cost)), data.storageAllotted, data.seatsAllotted);
		})
	});
}

$(document).ready(function () {
	$('#search1').on('keyup change clear', function () {
		var input, filter, table, tr, td, i, txtValue;
		input = $('#search1').val();
		filter = input.toUpperCase();
		tableBody = document.getElementById("clientTableBody");
		tr = tableBody.getElementsByTagName("tr");

		// Loop through all table rows, and hide those who don't match the search query
		for(i = 0; i < tr.length; i++) {
			td = tr[i].getElementsByTagName("td");
			let found = false;
			for(let j = 0; j < td.length; j++) {
				if(td[j]) {
					txtValue = td[j].textContent || td[j].innerText;
					if(txtValue.toUpperCase().indexOf(filter) > -1) {
						found = true
					} else {
						tr[i].style.display = "none";
					}
				}
			}

			if(found) {
				tr[i].style.display = "";
			} else {
				tr[i].style.display = "none";
			}
		}
	});

})

function getCurrentUserData() {

	userC.doc(uid_firebase).get()
		.then(snapshot => {
			currentUserData = snapshot.data();
		})
		.then(() => {
			if(currentUserData.role != 'SuperAdmin') {
				window.location.assign("/logout");
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

function getSalesAdminsClientsData(docID) {
	$('#clientTableBody').empty();
	clientsC.where("salesAdminDocID", "==", docID).where("orderApproved", "==", true).get().then((snapshot) => {
		snapshot.forEach(doc => {
			let data = doc.data();
			console.log(data)
			addToClientTable(data.requestedDateString, data.companyName, data.salesAdminName, abbreviateNumber(parseInt(data.cost)), data.storageOption, data.seatsAllotted);
		})
	});
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

function addToClientTable(date, name, adminName, cost, storage, seats) {
	let htmlString = `<tr>
		<td class="light">${date}</td>
		<td>${name}</td>
		<td>${adminName}</td>
		<td class="light">${cost}</td>
		<td class="light">${storage} GB</td>
		<td class="light">${seats}</td>
	</tr>`;

	$('#clientTableBody').append(htmlString);
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

window.onbeforeunload = function () {
	localStorage.removeItem("detailsType");
	localStorage.removeItem("salesAdminDocID");
};