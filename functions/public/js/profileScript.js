
var displayName;
var uid_firebase;
var storageRef;
var database;
var photoURL;
var updatedPhotoURL;
var email;
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

$("#upload-btn").on("click", function () {
    $("#upload-btn-hidden").click();
});

document.getElementById('upload-btn-hidden').addEventListener('change', handleFileSelect, false);

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];
    console.log(file);

    var metadata = {
        'contentType': file.type
    };

    var uploadTask = storageRef.child("tempURLs/" + file.name).put(file, metadata);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function (snapshot) { }, function (error) {
        console.log(error)
    }, function () {
        console.log('Upload Completed');
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            console.log('File available at', downloadURL);
            updatedPhotoURL = downloadURL;
            $("#u_image").attr("src", updatedPhotoURL);
        });
    });

}

firebase.initializeApp(firebaseConfig);
storageRef = firebase.storage().ref();
database = firebase.database();
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(user);
        // User is signed in.
        console.log("user is signed in!!");
        displayName = user.displayName;
        email = user.email;
        var emailVerified = user.emailVerified;
        photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        uid_firebase = user.uid;
        var providerData = user.providerData;
        $("#u_image").attr("src", photoURL);
        $("#u_name").val(displayName);
        $("#u_email").val(email);
        $("#updateProfile").on("click", function () {
            user.updateProfile({
                displayName: $("#u_name").val(),
                photoURL: updatedPhotoURL
            }).then(function () {
                swal({
                    text: "Success!",
                    title: "Profile Successfully Updated!!",
                    icon: "success",
                    allowOutsideClick: false
                })
                    .then((redirectToLogin) => {
                        if (redirectToLogin) {
                            window.location.assign("/dashboard");
                        } else {
                            window.location.assign("/profile");
                        }
                    });
            }).catch(function (error) {
                console.log(error);
            });
        });
    }
    else {
        console.log("user not logged in"); s
        window.location.assign("/logout");
    }
});

