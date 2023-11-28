
var displayName;
var uid_firebase;
var database;
var storageRef;
var photoURL;
var projName;
var currentPageNumber = 1;
var selectedObjects = [];
var totalSteps
const videoSupportedFormats = ['mp4', 'webm', 'mov'];
const imageSupportedFormats = ['jpg', 'jpeg', 'img', 'png'];
const audioSupportedFormats = ['mp3', 'ogg', 'wav'];
const docSupportedFormats = ['pdf'];
const modelSupportedFormats = ['glb', 'gltf'];
firebaseConfigure();

$(document).ready(function () {
    $('#cloudAssetList').hide();
    $('.tab').on('click', function () {
        $('.tab-row > div').each(function () {
            if ($(this).hasClass("active-tab")) $(this).removeClass("active-tab");
        })
        $(this).addClass("active-tab");
    });

    toggleAddStepBtn();
    $('#stepsHeading,#stepsDescription').on('input', function () { $('#addStep').show(); })
});

function toggleAddStepBtn() {
    console.log(currentPageNumber, $('#steps-lists > div').length, $('#stepsHeading').val() != '')
    if (currentPageNumber == $('#steps-lists > div').length || currentPageNumber == $('#steps-lists > div').length + 1) $('#addStep').show();
    else $('#addStep').hide();
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

function addMainModelToProject() {
    console.log("insideeeeeeee", uid_firebase, projName);
    database.ref('ajnastep/' + uid_firebase + '/' + projName + '/main_model').once('value', function (snapshot) {
        var main_model_name = snapshot.val().name;
        var main_model_url = snapshot.val().url;
        let div_el = document.createElement('div');
        div_el.setAttribute('class', 'ModelAsset');
        div_el.innerHTML = "<div class=\"exploreAsset\" style=\"bottom: 0px\" data-object-url='" + main_model_url + "' data-object-name='" + main_model_name + "'><i class=\"fas fa-sm fa-external-link-alt\"></i></div>";
        let bbylon_ele = document.createElement('babylon');
        let bbl_el_id = 'bbl_main_' + main_model_name;
        bbylon_ele.setAttribute('id', bbl_el_id);
        div_el.append(bbylon_ele);
        $('.MainModelRow').append(div_el);
        var s = document.createElement('script');
        s.setAttribute('src', "https://preview.babylonjs.com/viewer/babylon.viewer.js");
        s.setAttribute('crossorigin', 'anonymous');
        div_el.appendChild(s);
        s.onload = function () {
            let req_el = document.getElementById(bbl_el_id);
            console.log(req_el);
            let viewer = new BabylonViewer.DefaultViewer(req_el, {
                model: main_model_url
            });
        };

    })
}

$('#backButton').on('click', function () { window.location.href = '/Steps' });

$('#yoursDiv').on('click', function () {
    $('#cloudAssetList').hide();
    $('#yourAssetList').show();
});
$('#cloudDiv').on('click', function () {
    $('#yourAssetList').hide();
    $('#cloudAssetList').show();
});
document.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
}, false);

document.addEventListener('drop', handleFileDrop, false);

function activateNavigationBtns() {
    console.log("Activating buttons");
    // $('#addStep').on('click', goToNextPage);
    // $('#leftArrow').on('click', goToPrevPage);
    // $('.stepsBtn').show();
}

function deactivateNavigationBtns() {
    // $('.stepsBtn').hide();
    console.log("Deactivating buttons");
    // console.log($('#addStep'));
    // $('#addStep').off("click").unbind("click");
    // console.log($('#addStep'));
    // $('#leftArrow').off("click");
}

activateNavigationBtns();
$('#addStep').on('click', goToNextPage);
// $('#leftArrow').on('click', goToPrevPage);

function firebaseConfigure() {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    storageRef = firebase.storage().ref();
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            uid_firebase = user.uid;
            var providerData = user.providerData;
            console.log(photoURL);
            $('#user_img').attr('src', photoURL);

            database.ref('ajnastep/' + uid_firebase).once("value", function (snapshot) {
                if (snapshot.val()) {
                    var projects = Object.keys(snapshot.val());

                    if (projects.includes(projName)) {
                        listAssets();
                        addMainModelToProject();
                        $("#projectName").html(projName);

                        if (Object.keys(snapshot.val()[projName]).includes('steps')) {
                            var steps = snapshot.val()[projName].steps;
                            for (let i = 1; i < steps.length; i++) {
                                addStepsToLeftSidebar(steps[i].stepH);
                            }

                            if (steps.length >= 2) {
                                $("#step1").addClass("activeStep");
                            }
                            retrieveFromFirebase(currentPageNumber, projName);
                        }
                    }
                    else {
                        console.log("false");
                        alert("Inavlid Project..Please create a Project First.")
                        window.location.href = "/Steps";
                    }
                }
                else {
                    console.log("false");
                    alert("Project Does not Exist!!..Please create a Project First.")
                    window.location.href = "/Steps";
                }
            });
        }
        else {
            console.log("user not logged in");
            window.location.assign("/logout");
        }
    });
}

function goToNextPage() {

    deactivateNavigationBtns(); // to deactive simultaneous clicks

    var stepsH = $('#stepsHeading').val();
    var stepsD = $('#stepsDescription').val();
    $('.VideoAssetRow').empty();
    $('.ModelAssetRow').empty();
    $('.ImageAssetRow').empty();
    $('#steps-lists > div').removeClass("activeStep");
    if (stepsH || stepsD) {
        if (currentPageNumber == ($('#steps-lists > div').length + 1)) {
            addStepsToLeftSidebar(stepsH);
        }
        updateToFirebase(projName, stepsH, stepsD, currentPageNumber, function () {
            currentPageNumber += 1;
            $("#stepNum").html(currentPageNumber);
            $("#step" + currentPageNumber).addClass("activeStep");
            retrieveFromFirebase(currentPageNumber, projName);
        });
    } else {
        toastr['warning']('Enter step details!', '', { positionClass: 'toast-bottom-left' });
    }

    activateNavigationBtns(); // activate for navigation
}


function updateToFirebase(pjName, stepsH, stepsD, pgno, callback) {
    database.ref('ajnastep/' + uid_firebase + '/' + pjName + '/steps/' + pgno).update({
        stepH: stepsH,
        stepD: stepsD
    }, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            // success
            $("#step" + pgno + " b").html(stepsH);
            if (selectedObjects.length) {
                for (let i in selectedObjects) {
                    database.ref('ajnastep/' + uid_firebase + '/' + pjName + '/steps/' + pgno + '/assets/' + Object.keys(selectedObjects[i])[0]).update({
                        url: selectedObjects[i][Object.keys(selectedObjects[i])[0]],
                        fileType: selectedObjects[i]["type"],
                        px: 0,
                        py: 0,
                        pz: 0,
                        qx: 0,
                        qy: 0,
                        qz: 0,
                        qw: 0,
                        sx: 0,
                        sy: 0,
                        sz: 0,
                        isLoaded: "false"
                    }, function (error) {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log("success");
                        }
                    });
                    if (i == selectedObjects.length - 1) {
                        selectedObjects.length = 0;
                        callback();
                    }
                }
            }
            else {
                callback();
            }
        }
    });

}

function retrieveFromFirebase(pgno, pjName) {
    selectedObjects.length = 0;
    database.ref('ajnastep/' + uid_firebase + '/' + pjName + '/steps/' + pgno).once("value", function (snapshot) {
        if (snapshot.val()) {
            $('#stepsHeading').val(snapshot.val().stepH);
            $('#stepsDescription').val(snapshot.val().stepD);
        } else {
            $('#stepsHeading').val('');
            $('#stepsDescription').val('');
        }
    });
    database.ref('ajnastep/' + uid_firebase + '/' + pjName + '/steps/' + pgno + '/assets').once("value", function (snapshot) {
        if (snapshot.val()) {
            for (let i in snapshot.val()) {
                var tempObj = {};
                tempObj[i] = snapshot.val()[i]["url"];
                tempObj["type"] = snapshot.val()[i]["fileType"];
                selectedObjects.push(tempObj);
            }
            console.log(selectedObjects);
            retrieveAssets();
        }
    });

    toggleAddStepBtn();
}

function addStepsToLeftSidebar(stepHeading) {
    if (stepHeading.length > 20) stepHeading = stepHeading.substr(0, 18) + "...";
    var stepElementStr = "<div class=\"step-number\">" + ($('#steps-lists > div').length + 1) + "</div>\
							<li><b>"+ stepHeading + "</b></li>\
						</div>";
    stepElementStr = "<div class=\"col-md-12\" id=step" + ($('#steps-lists > div').length + 1) + ">" + stepElementStr;
    $('#steps-lists').append(stepElementStr);
    $("#step" + ($('#steps-lists > div').length)).on("click", update);
}

function update() {
    $('.VideoAssetRow').empty();
    $('.ModelAssetRow').empty();
    $('.ImageAssetRow').empty();
    $('#steps-lists > div').removeClass("activeStep");
    currentPageNumber = parseInt(this.id.substr(4));
    $("#stepNum").html(currentPageNumber);
    $(this).addClass("activeStep");
    retrieveFromFirebase(currentPageNumber, projName);
}

function listAssets() {
    $('#cloudAssetList').empty();
    $('#yourAssetList').empty();
    database.ref('ajnastep/Assets/3DModels').once("value", function (snapshot) {
        for (let i in snapshot.val()) {
            let mdl_name = i;
            if (mdl_name.length > 20) mdl_name = mdl_name.substr(0, 20) + '...';
            $('#cloudAssetList').append('<li>\
							<div class="listElement">\
								<div class="assetElement">\
									<img src="'+ snapshot.val()[i].model2dimageURL + '" alt="' + i + '"></img>\
								</div>\
								<div class="assetInfo">\
									<span class="assetName"><a href="#" data-toggle="tooltip" data-placement="top" title="'+i+'"><i class="fas fa-lg fa-cube"></i> '+ mdl_name + '</a></span>\
									<span class="addBtnSpan" data-object-name="'+ i + '" data-type="' + snapshot.val()[i].type + '" data-url="' + snapshot.val()[i].url + '"><i class="fas fa-plus"></i> Add</span>\
								</div>\
							</div>\
						</li>');
        }
    });
    database.ref('ajnastep/Assets/videos').once('value', function (snapshot) {
        for (let i in snapshot.val()) {
            var vid_name = i;
            if (vid_name.length > 20) vid_name = vid_name.substr(0, 20) + '...';
            $('#cloudAssetList').append('<li>\
							<div class="listElement">\
								<div class="assetElement">\
									<video src="'+ snapshot.val()[i].url + '" controls></video>\
								</div>\
								<div class="assetInfo">\
									<span class="assetName"><a href="#" data-toggle="tooltip" data-placement="top" title="'+i+'"><i class="fas fa-lg fa-film"></i> '+ vid_name +'</a></span>\
									<span class="addBtnSpan" data-object-name="'+ i + '" data-type="' + snapshot.val()[i].type + '" data-url="' + snapshot.val()[i].url + '"><i class="fas fa-plus"></i> Add</span>\
								</div>\
							</div>\
						</li>');
        }
    });
    database.ref('ajnastep/Assets/images').once('value', function (snapshot) {
        for (let i in snapshot.val()) {
            var img_name = i;
            if (img_name.length > 20) img_name = img_name.substr(0, 20) + '...';
            $('#cloudAssetList').append('<li>\
							<div class="listElement">\
								<div class="assetElement">\
									<img src="'+ snapshot.val()[i].url + '" alt="' + i + '"></img>\
								</div>\
								<div class="assetInfo">\
									<span class="assetName"><a href="#" data-toggle="tooltip" data-placement="top" title="'+i+'"><i class="far fa-lg fa-image"></i> '+ img_name + '</a></span>\
									<span class="addBtnSpan" data-object-name="'+ i + '" data-type="' + snapshot.val()[i].type + '" data-url="' + snapshot.val()[i].url + '"><i class="fas fa-plus"></i> Add</span>\
								</div>\
							</div>\
						</li>');
        }
        // document.querySelectorAll("span.addBtnSpan").forEach(elem => elem.addEventListener('click', addAsset));
    });

    database.ref('storageinfo/' + uid_firebase).once("value", function (snapshot) {
        for (let i in snapshot.val()) {
            if (modelSupportedFormats.includes(snapshot.val()[i]['fileType'])) {
                let mdl_name = i;
                if (mdl_name.length > 20) mdl_name = mdl_name.substr(0, 20) + '...';

                if (snapshot.val()[i].model2dimageURL) {
                    $('#yourAssetList').append('<li>\
							<div class="listElement">\
								<div class="assetElement">\
									<img src="'+ snapshot.val()[i]['model2dimageURL'] + '" alt="' + i + '"></img>\
								</div>\
								<div class="assetInfo">\
									<span class="assetName"><a href="#" data-toggle="tooltip" data-placement="top" title="'+i+'"><i class="fas fa-lg fa-cube"></i> '+ mdl_name + '</a></span>\
									<span class="addBtnSpan" data-object-name="'+ i + '" data-type="' + snapshot.val()[i].fileType + '" data-url="' + snapshot.val()[i]['url'] + '"><i class="fas fa-plus"></i> Add</span>\
								</div>\
							</div>\
						</li>');
                } else {
                    let li_el = document.createElement('li');
                    let div_listEle = document.createElement('div');
                    let div_assetEle = document.createElement('div');
                    let div_assetInfo = document.createElement('div');
                    let bbl_el = document.createElement('babylon');
                    let span_0 = document.createElement('span');
                    let span_1 = document.createElement('span');
                    div_listEle.setAttribute('class', 'listElement');
                    div_assetEle.setAttribute('class', 'assetElement');
                    div_assetInfo.setAttribute('class', 'assetInfo');
                    span_0.setAttribute('class', 'assetName');
                    span_1.setAttribute('class', 'addBtnSpan');
                    span_1.setAttribute('data-url', snapshot.val()[i]['url']);
                    span_1.setAttribute('data-type', snapshot.val()[i].fileType);
                    span_1.setAttribute('data-object-name', i);
                    span_0.innerHTML = '<a href="#" data-toggle="tooltip" data-placement="top" title="'+i+'"><i class="fas fa-lg fa-cube"></i> '+ mdl_name + '</a>';
                    span_1.innerHTML = "<i class=\"fas fa-plus\"></i> Add";
                    bbl_el.setAttribute('id', 'bbl_el_' + i);
                    div_assetInfo.appendChild(span_0);
                    div_assetInfo.appendChild(span_1);
                    div_assetEle.appendChild(bbl_el);
                    div_listEle.appendChild(div_assetEle);
                    div_listEle.appendChild(div_assetInfo);
                    li_el.appendChild(div_listEle);
                    $('#yourAssetList').append(li_el);
                    var s = document.createElement('script');
                    s.setAttribute('src', "https://preview.babylonjs.com/viewer/babylon.viewer.js");
                    s.setAttribute('crossorigin', 'anonymous');
                    div_assetEle.appendChild(s);
                    s.onload = function () {
                        let req_el = document.getElementById('bbl_el_' + i);
                        let viewer = new BabylonViewer.DefaultViewer(req_el, {
                            model: snapshot.val()[i]['url']
                        });
                    };
                }
                
            }
            else if (videoSupportedFormats.includes(snapshot.val()[i]['fileType'])) {
                var vid_name = i;
                if (vid_name.length > 20) vid_name = vid_name.substr(0, 20) + '...';
                $('#yourAssetList').append('<li>\
							<div class="listElement">\
								<div class="assetElement">\
									<video src="'+ snapshot.val()[i]['url'] + '" controls></video>\
								</div>\
								<div class="assetInfo">\
									<span class="assetName"><a href="#" data-toggle="tooltip" data-placement="top" title="'+i+'"><i class="fasf fa-lg fa-film"></i> '+ vid_name +'</a></span>\
									<span class="addBtnSpan" data-object-name="'+ i + '" data-type="' + snapshot.val()[i].fileType + '" data-url="' + snapshot.val()[i]['url'] + '"><i class="fas fa-plus"></i> Add</span>\
								</div>\
							</div>\
						</li>');
            }
            else if (imageSupportedFormats.includes(snapshot.val()[i]['fileType'])) {
                var img_name = i;
                if (img_name.length > 20) img_name = img_name.substr(0, 20) + '...';
                $('#yourAssetList').append('<li>\
							<div class="listElement">\
								<div class="assetElement">\
									<img src="'+ snapshot.val()[i]['url'] + '" alt="' + i + '"></img>\
								</div>\
								<div class="assetInfo">\
									<span class="assetName"><a href="#" data-toggle="tooltip" data-placement="top" title="'+i+'"><i class="far fa-lg fa-image"></i> '+ img_name + '</a></span>\
									<span class="addBtnSpan" data-object-name="'+ i + '" data-type="' + snapshot.val()[i].fileType + '" data-url="' + snapshot.val()[i]['url'] + '"><i class="fas fa-plus"></i> Add</span>\
								</div>\
							</div>\
						</li>');
            } else if (audioSupportedFormats.includes(snapshot.val()[i]['fileType'])) {
                var img_name = i;
                if (img_name.length > 20) img_name = img_name.substr(0, 20) + '...';
                $('#yourAssetList').append('<li>\
							<div class="listElement">\
								<div class="assetElement">\
									<img src="../images/audioAsset.jpg" alt="' + i + '"></img>\
								</div>\
								<div class="assetInfo">\
									<span class="assetName"><a href="#" data-toggle="tooltip" data-placement="top" title="'+i+'"><i class="fas fa-lg fa-music"></i> '+ img_name + '</a></span>\
									<span class="addBtnSpan" data-object-name="'+ i + '" data-type="' + snapshot.val()[i].fileType + '" data-url="' + snapshot.val()[i]['url'] + '"><i class="fas fa-plus"></i> Add</span>\
								</div>\
							</div>\
						</li>');
            }
        }
    });

}

function addAsset() {
    var tempObject = {};
    tempObject[$(this).data('object-name')] = $(this).data('url');
    let asset_id = $(this).data('url');
    let object_name = $(this).data('object-name');
    if (modelSupportedFormats.includes($(this).data('type'))) {
        tempObject["type"] = $(this).data('type');
        selectedObjects.push(tempObject);
        console.log(selectedObjects);
        let div_el = document.createElement('div');
        div_el.setAttribute('class', 'ModelAsset');
        div_el.innerHTML = "<div class=\"deleteAsset\" data-object-name='" + object_name + "'><i class=\"fas fa-times\"></i></div>\
				<div class=\"exploreAsset\" style=\"bottom: 0px\" data-object-url='" + asset_id + "' data-object-name='" + object_name + "'><i class=\"fas fa-sm fa-external-link-alt\"></i></div>";
        let bbylon_ele = document.createElement('babylon');
        let bbl_el_id = 'bbl_' + $(this).data('object-name');
        bbylon_ele.setAttribute('id', bbl_el_id);
        div_el.append(bbylon_ele);
        $('.ModelAssetRow').append(div_el);
        var s = document.createElement('script');
        s.setAttribute('src', "https://preview.babylonjs.com/viewer/babylon.viewer.js");
        s.setAttribute('crossorigin', 'anonymous');
        div_el.appendChild(s);
        s.onload = function () {
            let req_el = document.getElementById(bbl_el_id);
            console.log(req_el);
            let viewer = new BabylonViewer.DefaultViewer(req_el, {
                model: asset_id
            });
        };
    } else if (imageSupportedFormats.includes($(this).data('type'))) {
        tempObject["type"] = $(this).data('type');
        selectedObjects.push(tempObject);
        $('.ImageAssetRow').append('<div class="ImageAsset">\
					<div class="deleteAsset" data-object-name="'+ object_name + '"><i class="fas fa-times"></i></div>\
								<img src="'+ $(this).data('url') + '"\
									alt="" />\
							</div>');
    } else if (videoSupportedFormats.includes($(this).data('type'))) {
        // video add
        tempObject["type"] = $(this).data('type');
        selectedObjects.push(tempObject);
        $('.VideoAssetRow').append('<div class="VideoAsset">\
					<div class="deleteAsset" data-object-name="'+ object_name + '"><i class="fas fa-times"></i></div>\
								<video src="'+ $(this).data('url') + '"\
									controls />\
							</div>');
    } else if (audioSupportedFormats.includes($(this).data('type'))) {
        // audio add
        tempObject["type"] = $(this).data('type');
        selectedObjects.push(tempObject);
        $('.AudioAssetRow').append('<div class="AudioAsset">\
					<div class="deleteAsset" data-object-name="'+ object_name + '"><i class="fas fa-times"></i></div>\
                        <img src="../images/audioAsset.jpg"></img>\
							</div>');
    }

    $('#addStep').show();
}

function retrieveAssets() {
    for (let i in selectedObjects) {
        let objectName = Object.keys(selectedObjects[i])[0];
        let url = selectedObjects[i][objectName];
        if (modelSupportedFormats.includes(selectedObjects[i]["type"])) {
            let div_el = document.createElement('div');
            div_el.setAttribute('class', 'ModelAsset');
            div_el.innerHTML = "<div class=\"deleteAsset\" data-object-name='" + objectName + "'><i class=\"fas fa-times\"></i></div>\
					<div class=\"exploreAsset\" style=\"bottom: 0px\"data-object-url='" + url + "' data-object-name='" + objectName + "'><i class=\"fas fa-sm fa-external-link-alt\"></i></div>";
            let bbylon_ele = document.createElement('babylon');
            let bbl_el_id = 'bbl_' + objectName;
            bbylon_ele.setAttribute('id', bbl_el_id);
            div_el.append(bbylon_ele);
            $('.ModelAssetRow').append(div_el);
            var s = document.createElement('script');
            s.setAttribute('src', "https://preview.babylonjs.com/viewer/babylon.viewer.js");
            s.setAttribute('crossorigin', 'anonymous');
            div_el.appendChild(s);
            s.onload = function () {
                let req_el = document.getElementById(bbl_el_id);
                let viewer = new BabylonViewer.DefaultViewer(req_el, {
                    model: url
                });
            };
        }
        else if (imageSupportedFormats.includes(selectedObjects[i]["type"])) {
            $('.ImageAssetRow').append('<div class="ImageAsset">\
					<div class="deleteAsset" data-object-name="'+ objectName + '"><i class="fas fa-times"></i></div>\
								<img src="'+ url + '"\
									alt="" />\
							</div>');

        }
        else if (videoSupportedFormats.includes(selectedObjects[i]["type"])) {
            $('.VideoAssetRow').append('<div class="VideoAsset">\
					<div class="deleteAsset" data-object-name="'+ objectName + '"><i class="fas fa-times"></i></div>\
								<video src="'+ url + '"\
									controls />\
							</div>');
        }
    }
}

function handleFileDrop(evt) {

    evt.stopPropagation();
    evt.preventDefault();
    var fileList = evt.dataTransfer.files || evt.target.files;
    var file = fileList[0];

    var metadata = {
        'contentType': file.type
    };

    var uploadTask = storageRef.child(uid_firebase + '/' + file.name).put(file, metadata);

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
            case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;

            case 'storage/canceled':
                // User canceled the upload
                break;

            case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
        }
    }, function () {
        // Upload completed successfully
        $("#model_load_bar").css("width", "0%");
        $('#model_load_bar_percent').text("0%");
        $("#model_load_bar_container").hide();
        console.log('Upload Completed');
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            let fileExt = file.name.split(".").pop();
            if (fileExt != 'glb' && fileExt != 'gltf') {                        // if img or video, directly upload
                console.log("File is not model");
                database.ref('storageinfo/' + uid_firebase + '/' + file.name.split(".")[0]).set({
                    fileName: file.name.split(".")[0],
                    fileType: file.name.split(".").pop(),
                    url: downloadURL
                });
                listAssets();
                swal(
                    'File uploaded Successfully!!',
                    'Uploaded File has been stored in your account',
                    'success'
                ).catch(swal.noop)
            } else {
                var viewer;
                console.log("File is model");
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
                $('#model-preview-div').show();
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
                    console.log("Viewer:", viewer);
                };
                $('#confirmModelUpload').off();
                $('#cancelModelUpload').off();
                $('#confirmModelUpload').on('click', function () {
                    console.log(file);
                    if (viewer.sceneManager.scene.activeCamera) {
                        console.log("Creating screenshot");
                        BABYLON.Tools.CreateScreenshotUsingRenderTarget(
                            viewer.sceneManager.scene.getEngine(),
                            viewer.sceneManager.scene.activeCamera,
                            { width: 600, height: 400 },
                            function (data) {
                                storageRef
                                    .child(uid_firebase + '/model2dimages/' + file.name.split(".")[0] + '.png')
                                    .put(dataURItoBlob(data))
                                    .then((snapshot) => {
                                        snapshot.ref.getDownloadURL().then(function (downloadURL2) {
                                            database.ref('storageinfo/' + uid_firebase + '/' + file.name.split(".")[0]).set({
                                                fileName: file.name.split(".")[0],
                                                fileType: file.name.split(".").pop(),
                                                url: downloadURL,
                                                model2dimageURL: downloadURL2
                                            });
                                            listAssets();
                                        });
                                    });
                                $('#openAttachmentModal').modal('hide');
                                swal(
                                    'File uploaded Successfully!!',
                                    'Uploaded File has been stored in your account',
                                    'success'
                                ).catch(swal.noop);
                                $('#model-preview').empty();
                            }
                        );
                    }
                });
                $('#cancelModelUpload').on('click', function () {
                    storageRef.child(uid_firebase + '/' + file.name).delete().then(() => {
                        $('#openAttachmentModal').modal('hide');
                        swal(
                            'Upload Cancelled!',
                            'File upload is cancelled',
                            'error'
                        ).catch(swal.noop);
                        $('#model-preview').empty();
                    }).catch((error) => {
                        console.log("Uh-oh, an error occurred!");
                    });
                });
                $('#openAttachmentModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            }
        });
    });


}

$(document).on('click', '.deleteAsset', function () {
    console.log($(this).data('object-name'));
    // check in objects
    for (let i in selectedObjects) {
        if (Object.keys(selectedObjects[i])[0] == $(this).data('object-name')) {
            database.ref('ajnastep/' + uid_firebase + '/' + projName + '/steps/' + currentPageNumber + '/assets/' + Object.keys(selectedObjects[i])[0]).remove();
            selectedObjects.splice(i, 1);
        }
    }
    $(this).parent().remove();
});

$(document).on('click', '.exploreAsset', function () {
    console.log($(this).data('object-url'));
    // check in objects
    localStorage.setItem("exploreModel_url", $(this).data('object-url'));
    localStorage.setItem("exploreModel_name", $(this).data('object-name'));
    // window.location.href = '/exploreModel';
    window.open("/exploreModel", "_blank");
});

$(document).on('click', 'span.addBtnSpan', addAsset);

$('#qrCode').on('click', function () {
    jQuery('#output').qrcode(projName);
    // the lib generate a canvas under target, you should get that canvas, not #output
    // And put the code here would ensure that you can get the canvas, and canvas has the image.
    var canvas = document.querySelector("#output canvas");
    var img = canvas.toDataURL("image/png");
    // Create an anchor, and set its href and download.
    var dl = document.createElement('a');
    dl.setAttribute('href', img);
    dl.setAttribute("download", projName + '_QR.png');
    // simulate a click will start download the image.
    dl.click();
});

$('#downloadJson').on('click', function () {
    //Build a JSON array containing Customer records.
    database.ref('ajnastep/' + uid_firebase + '/' + projName + '/steps').once("value", function (snapshot) {
        var db_data = snapshot.val();
        var db_data_keys = Object.keys(db_data);
        var modified_data = {};

        for (let i in db_data_keys) {
            modified_data[db_data_keys[i]] = db_data[db_data_keys[i]]
        }

        var file_data = {
            "user_id": uid_firebase,
            "project_name": projName,
            "data": modified_data
        }

        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(file_data));
        var el = document.createElement("a");

        el.setAttribute("href", "data:" + data);
        el.setAttribute("download", projName + '.json');
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
    });
})

