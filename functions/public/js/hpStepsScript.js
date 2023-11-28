
document.querySelector("#createSubmit").addEventListener('click', function () {
    var main_model = $('#models').val();
    if (main_model == "") {
        swal(
            'Model not selected',
            'Select a main model for the project',
            'warning'
        ).catch(swal.noop);
    } else if (! $('#projName').val()) {
        swal(
            'Project name can\'t be empty!',
            'Enter name for the project',
            'warning'
        ).catch(swal.noop);
    } else {
        database.ref('ajnastep/' + uid + '/' + $('#projName').val()).set({
            date: curr_date,
            main_model: { name: $("#models option:selected").text(), url: $("#models option:selected").val() },
            dataset: false
        }, function (error) {
            if (error) {
                console.log(error);
            }
            else {
                addProjectsFromFirebase();
                $('#createProjModal').modal('hide');
            }
        });
    }
});

document.getElementById('custom-upload').addEventListener('click', function () {
    document.getElementById("real-upload").click();
});

document.getElementById('real-upload').addEventListener('change', handleFileSelect, false);

$('#editProfBtn').on('click', function () {
    window.open('/profile', "_self");
})

document.getElementById("projName").addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
        if (document.getElementById("projName").value != "")
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

var database, uid, storageRef;
firebase.initializeApp(firebaseConfig);
database = firebase.database();
storageRef = firebase.storage().ref();
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        console.log(user);
        displayName = user.displayName;
        email = user.email;
        var emailVerified = user.emailVerified;
        photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        uid = user.uid;
        var providerData = user.providerData;
        console.log(displayName);
        $('#user_name').append(displayName);
        $('#user-info-name b').text(displayName);
        $('#user-info-email b').text(email);
        $('#user_img').attr('src', photoURL);

        addProjectsFromFirebase();
        listModels();

    }
    else {
        console.log("user not logged in");
        firebase.auth().signOut().then(() => {
            window.location.assign("/logout");
        });
    }
});

$('#logoutDiv').on('click', function () {
    firebase.auth().signOut().then(() => {
        window.location.assign("/logout");
    });
})

$('#homepageDiv').on('click', function () { window.location.href = '/dashboard' });

function addProjectsFromFirebase() {
    $('.project-items-row').empty();
    database.ref('ajnastep/' + uid).once("value", function (snapshot) {
        var db_obj = snapshot.val();
        for (let i in db_obj) {
            $('.project-items-row').append("<div class=\"project-item\" proj=\"" + i + "\">\
                <div class=\"editDiv\">\
                    <div class=\"col-md-12 deleteProj\">Delete</div>\
                </div>\
                <div class=\"col-md-12\" style=\"margin-top: 15px;\">\
                    <div style=\"display: inline-block;\"><span class=\"proj-date\">"+ db_obj[i]['date'] + "</span></div>\
                    <div style=\"float: right;\" class=\"proj-opt-btn\"><i class=\"fas fa-lg fa-ellipsis-h\"></i></div>\
                </div>\
                <div class=\"name-div col-md-12\">\
                    <div class=\"proj-name\"><b>"+ i + "</b></div>\
                </div>\
                <div class=\"enterRoom col-md-12\">\
                    <a href=\"javascript:openProj('"+ i + "');\">Open Project <i class=\"fas fa-arrow-right\"></i></a>\
                </div>\
            </div>");
        }
        $('.proj-opt-btn').on('click', function () {
            // console.log($(this).parent().parent().find('.editDiv'));
            $(this).parent().parent().find('.editDiv').toggle();
        });
        $('.deleteProj').on('click', function () {
            var pname = $(this).parent().parent().attr('proj');
            database.ref('ajnastep/' + uid + '/' + pname).remove();
            $(this).parent().parent().remove();
        });
    });
}

function openProj(proj) {
    console.log(proj);
    window.location.href = "/Steps/" + proj;
}

function listModels() {
    $('#models').empty().append('<option value="">-- Select Main Model --</option>');

    database.ref('storageinfo/' + uid).once("value", function (snapshot) {
        let assets = snapshot.val();
        for (let i in assets) {
            if (assets[i].fileType == 'glb' || assets[i].fileType == 'gltf') {
                let assetName = i;
                if (assetName.length > 30) {
                    assetName = assetName.substring(0, 30) + "..."
                }
                $('#models').append('<option value="' + assets[i].url + '">' + assetName + '</option>');
            }
        }
    });

}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    $('#createProjModal').modal('hide');
    var file = evt.target.files[0];

    // TRial starts here========================
    var metadata = {
        'contentType': file.type
    };

    let fileExt = file.name.split(".").pop();
    if (fileExt != 'glb' && fileExt != 'gltf') {
        swal(
            'Error!',
            'Please select glb/gltf model only!',
            'success'
        ).catch(swal.noop);

        return;
    }

    var uploadTask = storageRef.child(uid + '/' + file.name).put(file, metadata);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function (snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = parseInt((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        progress += "%";
        $("#model_load_bar_container").show();
        $("#model_load_bar").css("width", progress);
        $('#model_load_bar_percent').text(progress);
        console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');

    }, function (error) {

        switch (error.code) {
            case 'storage/unauthorized':					// User doesn't have permission to access the object
                break;

            case 'storage/canceled':						// User canceled the upload
                break;

            case 'storage/unknown':							// Unknown error occurred, inspect error.serverResponse
                break;
        }
    }, function () {
        // Upload completed successfully
        $("#model_load_bar").css("width", "0%");
        $('#model_load_bar_percent').text("0%");
        $("#model_load_bar_container").hide();
        $('#modelPreviewModal').modal('show');
        console.log('Upload Completed');
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {

            var viewer;
            let div_assetEle = document.createElement('div');
            let bbl_el = document.createElement('babylon');
            div_assetEle.setAttribute('class', 'assetElement');
            bbl_el.setAttribute('id', 'bbl_preview');
            div_assetEle.appendChild(bbl_el);
            $('#model-preview').append(div_assetEle);
            var s = document.createElement('script');
            s.setAttribute('src', "https://preview.babylonjs.com/viewer/babylon.viewer.js");
            s.setAttribute('crossorigin', 'anonymous');
            div_assetEle.appendChild(s);
            s.onload = function () {
                let req_el = document.getElementById('bbl_preview');
                viewer = new BabylonViewer.DefaultViewer(req_el, {
                    model: downloadURL,
                    camera: {
                        behaviors: {
                            autoRotate: {
                                idleRotationSpeed: 0
                            }
                        }
                    },
                });
            };
            $('#confirmModelUpload').off();
            $('#cancelModelUpload').off();
            $('#confirmModelUpload').on('click', function () {
                if (viewer.sceneManager.scene.activeCamera) {
                    BABYLON.Tools.CreateScreenshotUsingRenderTarget(
                        viewer.sceneManager.scene.getEngine(),
                        viewer.sceneManager.scene.activeCamera,
                        { width: 600, height: 400 },
                        function (data) {
                            storageRef
                                .child(uid + '/model2dimages/' + file.name.split(".")[0] + '.png')
                                .put(dataURItoBlob(data))
                                .then((snapshot) => {
                                    snapshot.ref.getDownloadURL().then(function (downloadURL2) {
                                        database.ref('storageinfo/' + uid + '/' + file.name.split(".")[0]).set({
                                            fileName: file.name.split(".")[0],
                                            fileType: file.name.split(".").pop(),
                                            url: downloadURL,
                                            model2dimageURL: downloadURL2
                                        });
                                    });
                                })
                                .then(() => {
                                    listModels();
                                });
                            $('#modelPreviewModal').modal('hide');
                            swal(
                                'File uploaded Successfully!!',
                                'Uploaded File has been stored in your account',
                                'success'
                            ).catch(swal.noop);
                            $('#model-preview').empty();
                            
                            $('#real-upload').val('');
                            $('#createProjModal').modal('show');
                        }
                    );
                }
            });
            $('#cancelModelUpload').on('click', function () {
                storageRef.child(uid + '/' + file.name).delete().then(() => {
                    swal(
                        'Upload Cancelled!',
                        'File upload is cancelled',
                        'error'
                    ).catch(swal.noop)
                }).catch((error) => {
                    console.log("Uh-oh, an error occurred!");
                });
                $('#modelPreviewModal').modal('hide');
                $('#real-upload').val('');
                $('#model-preview').empty();
                $('#createProjModal').modal('show');
            });
        });

    });
}

$(document).mouseup(function (e) {
    var container = $(".editDiv");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

