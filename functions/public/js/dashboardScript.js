(() => {

$('#editProfBtn').on('click', function () {
    window.open('/profile', "_self");
})

$('#releasesDiv').on('click', function () { window.location.href = '/releases' });
$('#supportDiv').on('click', function () { window.location.href = '/support' });
$('#updateFormDiv').on('click', function () { window.location.href = '/push_update' });
$('#createNewSceneBtn').on('click', function () { 
    localStorage.removeItem('sceneData');
    window.location.href = '/createscene'
 });

$('#editorDiv').on('click', function () {
    $('#sceneSelect').empty().append("<option value=''>-- Select Scene --</option");
    database.ref('storageinfo/' + uid_firebase + '/Scenes').once('value', snapshot => {
        for (let sceneName in snapshot.val()) {
            $('#sceneSelect').append("<option value='" + sceneName + "'>" + sceneName + "</option")
        }
    }).then(() => {
        $('#openSceneModal').modal('show');
    });
});

$('#openSelectedSceneBtn').on('click', function() {
    if( !$('#sceneSelect').val() ){
        swal(
            'Error!!',
            'Select a scene from the list to open',
            'error'
        ).catch(swal.noop);
    } else {
        database.ref('storageinfo/' + uid_firebase + '/Scenes/' + $('#sceneSelect').val()).once('value', snapshot => {
            let sceneObj =  snapshot.val()
            sceneObj['name'] = $('#sceneSelect').val();
            localStorage.setItem('sceneData', JSON.stringify(sceneObj));
        }).then(() => {
            window.location.href = '/createscene';
        });
    }
})


$('#redirect_RM').on('click', function () {
    window.location.href = '/RemoteAssistance';
});

$('#redirect_Steps').on('click', function () {
    window.location.href = '/Steps';
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
var displayName, email, photoURL, uid_firebase;

var database, uid, isAdmin;
firebase.initializeApp(firebaseConfig);
storageRef = firebase.storage().ref();
database = firebase.database();
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        console.log(user);
        displayName = user.displayName;
        email = user.email;
        isAdmin = (email == 'ajnasuite@ajnalens.com');

        if (isAdmin) $('#updateFormDiv').css("display", "block");

        var emailVerified = user.emailVerified;
        photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        uid_firebase = user.uid;
        var providerData = user.providerData;
        console.log(displayName);
        $('#user_name').append(displayName);
        $('#user-info-name b').text(displayName);
        $('#user-info-email b').text(email);
        $('#user_img').attr('src', photoURL);
    }
    else {
        console.log("user not logged in");
        firebase.auth().signOut().then(() => {
            window.location.assign("/logout");
        });
    }
});
// database = firebase.database();

function listObjects() {
    $('#assetList').empty();
    $('#assetList').append('<option value="">--Select To Delete Asset--</option>');

    //ObjectRef For specific logged user
    var listRef = storageRef.child(uid_firebase + "/");

    // Find all the prefixes and items.
    listRef.listAll().then(function (res) {
        res.items.forEach(function (itemRef) {
            var objectPath = itemRef.location.path;
            var objName = objectPath.split("/")[1];
            if (objName.length > 30) {
                objName = objName.substring(0, 30) + "..."
            }

            $('#assetList').append('<option value="' + objectPath + '">' + objName + '</option>');
        });
    }).catch(function (error) {
        console.log("Error in listing firebase objects");
    });

}

$('#logoutDiv').on('click', function () {
    firebase.auth().signOut().then(() => {
        window.location.assign("/logout");
    });
});

$('#assets').on('show.bs.modal', function (e) {
    listObjects();
});
$("select[id='assetList']").change(function () {
    var downloadPath = $(this).val();
    var fileNameExt = downloadPath.split("/")[1];
    var fileName = fileNameExt.split(".")[0];
    var fileExt = fileNameExt.split(".").pop();
    $('#assets').modal('hide');
    console.log($(this).val());
    storageRef.child(downloadPath).delete().then(function () {
        database.ref('storageinfo/' + uid_firebase + '/' + fileName).remove();
        swal(
            'Deleted!!',
            'Selected File ' + fileName + ' has been succeddfully deleted from your account.',
            'success'
        ).catch(swal.noop)
    }).catch(function (error) {
        alert(error);
    });

});

})();
