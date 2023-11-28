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

            getCurrentUserData(getAllSalesData);

            $(".dropdown-trigger").dropdown();
        } else {
            window.location.assign("/logout");
        }

    });
}

function getAllSalesData() {
    $('#clientTableBody').empty();
    clientsC.where("salesAdminDocID", "==", currentUserData.userID).get().then((snapshot) => {
        snapshot.forEach(doc => {
            let data = doc.data();
            addToClientTable(doc.id, data.createdOn, data.companyName, abbreviateNumber(parseInt(data.cost)), data.storageAllotted, data.seatsAllotted, data.orderApproved);
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

function getCurrentUserData(next) {

    userC.doc(uid_firebase).get()
        .then(snapshot => {
            currentUserData = snapshot.data();
        })
        .then(() => {
            if(currentUserData.role != 'SalesAdmin') {
                window.location.assign("/logout");
            }
            next();
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

function addToClientTable(docID, date, name, cost, storage, seats, status) {
    let divCount = $("#clientTableBody > tr").length + 1;

    let statusLabel = `<span data-badge-caption="" class="new badge green">Created</span>`
    let dropdownList = `<li class="list-body">
        <a class="updateRequestBtn" data-docID=${docID}>
            <img src="/images/Vectori.svg" class="dd-icon" />Update&nbsp;Request
        </a>
    </li>`;
    if(!status) {
        statusLabel = `<span data-badge-caption="" class="new badge yellow">In Progress</span>`;
        dropdownList += `<li class="list-body">
            <a class="deleteAdminBtn" docID=${docID}>
                <img src="/images/Groupr.svg" class="dd-icon" />Remove&nbsp;Request
            </a>
        </li>`;
    }

    let htmlString = `<tr>
		<td class="light">${date}</td>
		<td>${name}</td>
		<td class="light">${cost}</td>
		<td class="light">${storage} GB</td>
		<td class="light">${seats}</td>
		<td>${statusLabel}</td>
		<td>
            <div class="sales-more waves-effect dropdown-trigger" data-target="dropdown${divCount}">
                <img src="/images/Group 295.svg" alt="" />
            </div>
            <ul id="dropdown${divCount}" class="dropdown-content">
            ${dropdownList}
            </ul>
        </td>   
	</tr>`;

    $('#clientTableBody').append(htmlString);
    $(".dropdown-trigger").dropdown();
}

$(document).on("click", '.updateRequestBtn', function () {
    let docID = $(this).attr("data-docID");
    clientsC.doc(docID).get().then(snapshot => {
        clientData = snapshot.data();
        $('#org-name').val(clientData.companyName);
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
        $('#accountRequestModal').modal('open');
        $('#saveModalData').text("Request Update");
        $('#saveModalData').attr("data-docID", docID);

    })
});

$("#saveModalData").on('click', function () {
    let docID = $(this).attr("data-docID");
    let featuresList = [
        $('#annotationCheck').is(":checked"),
        $('#pdfCheck').is(":checked"),
        $('#model3dCheck').is(":checked"),
        $('#recordingCheck').is(":checked"),
        $('#imageCheck').is(":checked"),
        $('#chatCheck').is(":checked"),
        $('#videoCheck').is(":checked")
    ]

    let newClientData = {
        companyName: $('#org-name').val(),
        name: $('#client-name').val(),
        adminEmail: $('#admin-email').val(),
        contactno: $('#phone-no').val(),
        cost: $('#cost').val(),
        seatsAllotted: $('#seats-allotted').val(),
        minutesAllotted: $('#minutes-allotted').val(),
        storageAllotted: $('#storage-allotted').val(),
        updatedOn: curr_date,
        orderApproved: false,
        features: featuresList,
        salesAdminEmail: currentUserData.email,
        salesAdminName: currentUserData.name
    }

    if(docID) {
        clientsC.doc(docID).update(newClientData)
            .then(() => {
                $(this).removeAttr("data-docID");
                $('#clientReqForm')[0].reset();
            }).catch((error) => {
                // The document probably doesn't exist.
                console.error("Error updating document: ", error);
            });
    } else {
        newClientData['createdOn'] = curr_date;
        newClientData['salesAdminEmail'] = currentUserData.email;
        newClientData['salesAdminName'] = currentUserData.name;
        clientsC.add(newClientData)
            .then(() => {
                $('#clientReqForm')[0].reset();
            }).catch((error) => {
                // The document probably doesn't exist.
                console.error("Error updating document: ", error);
            });
    }

    $('#saveModalData').text("Send Request");
});

$('#addClientRequest').on('click', function () {
    $('#clientReqForm')[0].reset();
    $('#accountRequestModal').modal('open');
})

// ======================================== FrontEnd JS ========================================
$(".dropdown-trigger").dropdown();

$(document).ready(function () {
    $(".modal").modal();
    $('select').formSelect();
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