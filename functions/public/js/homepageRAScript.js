$('#editProfBtn').on('click', function () {
    window.open('/profile', "_self");
})

$('#resetPasswordBtn').on('click', function () {
    sendPasswordReset();
});

document.getElementById("enterCode").addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
        $('#joinSubmit').click();
    }
});

document.getElementById("roomNum").addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
        if (document.getElementById("roomName").value != "")
            $('#createSubmit').click();
    }
});

// for input 
$(".field-wrapper .field-placeholder").on("click", function () {
    $(this).closest(".field-wrapper").find("input").focus();
});
$(".field-wrapper input").on("keyup", function () {
    var value = $.trim($(this).val());
    if (value) {
        $(this).closest(".field-wrapper").addClass("hasValue");
    } else {
        $(this).closest(".field-wrapper").removeClass("hasValue");
    }
});

$("#roomIdShare").on("click", function () {
    var copyText = document.getElementById("roomIdShare");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
    $("#myTooltip").html('<i class="fas fa-check"></i> Copied to clipboard');
    setTimeout(() => {
        $("#myTooltip").html("Copy to clipboard");
    }, 3000);
});

// main js script
var date = new Date();
var hour = date.getHours();
if (hour < 12) {
    $("#greeting").text("Good Morning");
} else if (hour < 17) {
    $("#greeting").text("Good Afternoon");
} else {
    $("#greeting").text("Good Evening");
}
var displayName, email, photoURL;

var database, uid, shareRoomNo;
firebase.initializeApp(firebaseConfig);
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        console.log(user);
        uid = user.uid;
        displayName = user.displayName;
        email = user.email;
        var emailVerified = user.emailVerified;
        photoURL = user.photoURL || "./images/user2.png";
        var isAnonymous = user.isAnonymous;
        uid = user.uid;
        var providerData = user.providerData;
        console.log(displayName);
        $('#user_name').append(displayName);
        $('#user-info-name b').text(displayName);
        $('#user-info-email b').text(email);
        $('#user_img').attr('src', photoURL);
        addProjectsFromFirebase();
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        const firestoreDb = firebase.firestore();
        const userC = firestoreDb.collection("users");
        userC.doc(uid).get().then(snapshot => {
            let data = snapshot.data()
            $('#user-info-group b').text(data.companyName);
            let route;
            if (data.email == "ajnasuite@ajnalens.com") {
                route = "/super-admin-dashboard";
            }
            else if (data.role == "SalesAdmin") {
                route = "/sales-admins-dashboard";
            }
            else if (data.role == "CompanyAdmin") {
                route = "/client-admin-dashboard";
            }
            const htmlString = `<a href="${route}" style='color: black'>
            <div class="col-md-12">
                <li><i class="fa fas fa-solid fa-user-tie"></i> <b>Admin Dashboard</b></li>
           </div>
            </a>`;
            if (data.role != "ClientUser") {
                $('#sidebar-nav-menu').append(htmlString);
            }

        }).catch((error) => {
            firebase.auth.signOut().then(() => {
                window.location.assign("/logout");
            })
        })


    }
    else {
        console.log("user not logged in");
        firebase.auth().signOut().then(() => {
            window.location.assign("/logout");
        });
    }
});
database = firebase.database();

$('#logoutDiv').on('click', function () {
    firebase.auth().signOut().then(() => {
        window.location.assign("/logout");
    });
});

$('#homeDiv').on('click', function () { window.location.href = '/dashboard' });

$('#modalSettings').on('show.bs.modal', function (e) {
    $('#audioDevices').empty();
    $('#videoDevices').empty();
    $('#videoDevices').append("<option value=''>--Select Video Device--</option>");
    $('#audioDevices').append("<option value=''>--Select Audio Device--</option>");
    getDevices(function (devices) {

        devices.audios.forEach(function (audio) {
            $("<option/>", {
                value: audio.value,
                text: audio.name.substring(0, 30) + "...",
            }).appendTo("#audioDevices");
        });
        devices.videos.forEach(function (video) {
            $("<option/>", {
                value: video.value,
                text: video.name,
            }).appendTo("#videoDevices");
        });
    });
});

$("#sendEmailBtn").on("click", () => {
    sendEmail();
    $("#share_room_modal").modal("hide");
});


async function sendEmail() {
    await database.ref('savedRooms/' + uid + '/' + shareRoomNo).once("value", function (snapshot) {
        fetch("/sendEmail", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "CSRF-Token": Cookies.get("XSRF-TOKEN"),
            },
            body: JSON.stringify({
                subject: "Invitation to join AjnaSuite room",
                to: $("#emailList").val(),
                html: 'You are invited to join the room for Remote Assistance<br><br>Room Number: ' + shareRoomNo + '<br>Room Password: ' + snapshot.val().roomPass + '<br><a href="https://ajnasuite.ajnalens.com">Location</a>'
            }),
        }).then((response) => {
            // console.log(response.status); // 200
            // console.log(response.statusText); // OK
            if (response.status === 200) {
                swal(
                    "Email Invite Sent!",
                    "Invitation has been sent to the mail IDs!",
                    "success",
                ).catch(swal.noop);
            }
            else {
                swal(
                    "Email Invite Not Sent!",
                    "Some Error Occured in Sharing Meeting Room",
                    "error",
                ).catch(swal.noop);
            }
        });
    });
}

var actionCodeSettings = {
    url: 'https://cs5337.web.app/profile',
    handleCodeInApp: false
};
function sendPasswordReset() {
    firebase.auth().sendPasswordResetEmail(email, actionCodeSettings)
        .then(() => {
            swal(
                "Reset Link Sent!",
                "Reset Password Link has been sent to your Email Address.!!",
                "success",
            ).catch(swal.noop);
            // console.log("sent");
            // // Password reset email sent!
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
            // ..
        });
}

function addProjectsFromFirebase() {
    $('.project-items-row').empty();
    database.ref('savedRooms/' + uid).once("value", function (snapshot) {
        var db_obj = snapshot.val();
        for (let i in db_obj) {
            $('.project-items-row').append("<div class=\"project-item\" proj_room=\"" + i + "\">\
						<div class=\"editDiv\">\
							<div class=\"row-md-12\"><div class=\"col-md-12 deleteProj\">Delete</div></div>\
                            <div class=\"row-md-12\"><div class=\"col-md-12 shareRoom\">Share</div></div>\
						</div>\
						<div class=\"col-md-12\" style=\"margin-top: 15px;\">\
							<div style=\"display: inline-block;\"><span class=\"proj-date\">"+ db_obj[i]['date'] + "</span></div>\
							<div style=\"float: right;\" class=\"proj-opt-btn\"><i class=\"fas fa-lg fa-ellipsis-h\"></i></div>\
						</div>\
						<div class=\"name-div col-md-12\">\
							<div class=\"proj-name\"><b>"+ db_obj[i]['projName'] + "</b></div>\
							<div class=\"proj-roomno\">Room no. "+ i + "</div>\
						</div>\
						<div class=\"enterRoom col-md-12\">\
							<a href=\"javascript:saveRoom('"+ i + "');\">Enter Room <i class=\"fas fa-arrow-right\"></i></a>\
						</div>\
					</div>");
        }
        $('.proj-opt-btn').on('click', function () {
            // console.log($(this).parent().parent().find('.editDiv'));
            $(this).parent().parent().find('.editDiv').toggle();
        });
        $('.deleteProj').on('click', function () {
            var roomNo = $(this).parent().parent().parent().attr('proj_room');
            database.ref('savedRooms/' + uid + '/' + roomNo).remove();
            database.ref('authRooms/' + roomNo).remove();
            $(this).parent().parent().parent().remove();
        });
        $('.shareRoom').on('click', function () {
            shareRoomNo = $(this).parent().parent().parent().attr('proj_room');
            document.getElementById('roomIdShare').value = "https://CS5337.web.app/join/" + shareRoomNo;
            $("#share_room_modal").modal("show");
        });
    });
}

function saveRoom(roomNo) {
    $("#modalEnter").modal("show");
    $("#roomNo").html(roomNo);


    // database.ref('savedRooms/' + uid + '/' + roomNo + '/data').once("value", function (snapshot) {
    //     if (snapshot.val()) {
    //         database.ref('rooms/' + roomNo).set(snapshot.val(), function (error) {
    //             if (error) {
    //                 console.log(error);
    //             }
    //             else {
    //                 //   "Loaded Objects"
    //                 window.location.href = "/join/" + roomNo;
    //             }
    //         });
    //     }
    //     else {
    //         window.location.href = "/join/" + roomNo;
    //     }

    // });

}

function getDevices(next) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        // do something with the stream
        navigator.mediaDevices.enumerateDevices().then(function (items) {
            items.filter(function (item) {
                return ["audioinput", "videoinput"].indexOf(item.kind) !== -1
            })
                .map(function (item) {
                    return {
                        name: item.label,
                        value: item.deviceId,
                        kind: item.kind,
                    }
                })
            var videos = []
            var audios = []
            for (var i = 0; i < items.length; i++) {
                var item = items[i]
                if ("videoinput" == item.kind) {
                    var name = item.label
                    var value = item.deviceId
                    if (!name) {
                        name = "camera-" + videos.length
                    }
                    videos.push({
                        name: name,
                        value: value,
                        kind: item.kind
                    })
                }
                if ("audioinput" == item.kind) {
                    var name = item.label
                    var value = item.deviceId
                    if (!name) {
                        name = "microphone-" + audios.length
                    }
                    audios.push({
                        name: name,
                        value: value,
                        kind: item.kind
                    })
                }
            }
            next({ videos: videos, audios: audios })
        })
    })
        .catch(e => {
            alert(e);
        });

}

$(document).mouseup(function (e) {
    var container = $(".editDiv");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

// commented for modal use
// document.querySelector("#create").addEventListener('click', function () {
// 	var createCode = Math.floor(Math.random()*1000);
// 	window.open('/join/'+createCode, "_self");
// });

document.querySelector("#createSubmit").addEventListener('click', function () {

    database.ref("authRooms/" + $('#roomNum').val()).once("value", function (snapshot) {
        if (snapshot.val() == null) {
            // for listing user's rooms
            database.ref('savedRooms/' + uid + '/' + $('#roomNum').val()).set({
                roomNo: $('#roomNum').val(),
                roomPass: $('#roomPass').val(),
                date: curr_date,
                projName: $('#roomName').val()
            }, function (error) {
                if (error) {
                    console.log(error);
                }
                else {
                    addProjectsFromFirebase();
                    $('#modalCreate').modal('hide');
                }
            });

            // for creating authRooms
            database.ref('authRooms/' + $('#roomNum').val()).update({
                room_id: $('#roomNum').val(),
                password: $('#roomPass').val()
            }, function (error) {
                if (error) {
                    console.log(error);
                }
                else {
                    $('#modalCreate').modal('hide');
                }
            });
            // end of if
        }
        else if (snapshot.val() != null) {
            swal(
                "Room Already Exist!",
                "Please Create Another Room",
                "error",
            ).catch(swal.noop);
        }
    });

});

document.getElementById('joinSubmit').addEventListener('click', function () {
    var joinCode = $('#enterCode').val();
    var joinPass = $('#enterPass').val();

    if (joinCode && joinPass) {
        database.ref('authRooms/' + joinCode).once("value", function (snapshot) {
            if (snapshot.val()) {
                if (snapshot.val().password == joinPass) {
                    document.cookie = "roomPass=" + joinPass;
                    window.open('/join/' + joinCode, "_self");
                }
                else {
                    swal(
                        "Incorrect Password",
                        "Please Enter Correct Password to Join this Room",
                        "error",
                    ).catch(swal.noop);
                }
            }
            else {
                swal(
                    "Room Does not Exist",
                    "Please Create a Room First",
                    "error",
                ).catch(swal.noop);
            }
        });
    }
    else {
        swal(
            "Empty Credentials",
            "Please Enter Room No/Password",
            "error",
        ).catch(swal.noop);
    }

});

document.getElementById('enterSubmit').addEventListener('click', function () {
    var joinCode = $('#roomNo').html();
    var joinPass = $('#enterPassword').val();

    if (joinCode && joinPass) {
        database.ref('authRooms/' + joinCode).once("value", function (snapshot) {
            if (snapshot.val()) {
                if (snapshot.val().password == joinPass) {
                    document.cookie = "roomPass=" + joinPass;
                    window.open('/join/' + joinCode, "_self");
                }
                else {
                    swal(
                        "Incorrect Password",
                        "Please Enter Correct Password to Join this Room",
                        "error",
                    ).catch(swal.noop);
                }
            }
            else {
                swal(
                    "Room Does not Exist",
                    "Please Create a Room First",
                    "error",
                ).catch(swal.noop);
            }
        });
    }
    else {
        swal(
            "Empty Credentials",
            "Please Enter Room No/Password",
            "error",
        ).catch(swal.noop);
    }

});

document.getElementById('saveDeviceSubmit').addEventListener('click', function () {
    var videoId = $('#videoDevices').val();
    var audioId = $('#audioDevices').val();
    localStorage.setItem("Audio", audioId);
    localStorage.setItem("Video", videoId);
    $('#modalSettings').modal('hide');

});