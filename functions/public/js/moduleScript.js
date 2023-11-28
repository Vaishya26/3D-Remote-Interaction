// (() => {
// variables required for physics
var currentStreamId;
let syncCross = 0;
var boxBody;
var bodyVelocity;
var parentCamera;
// variables required for authTransfer
var displayName;
var uid_firebase;
var storageRef;
var database;
// var firestore_db;
var photoURL;
var currentPdfObject = null;
var pageNum = 1;
var localStreamList = [];
var remoteStreamList = [];
var tempCheckSS = [];
var startTime;
var endTime;
const videoSupportedFormats = ["mp4", "ogg", "webm", "mov"];
const imageSupportedFormats = ["jpg", "jpeg", "img", "png", "ajnaxstream", "assistelem"];
const docSupportedFormats = ["pdf"];
let testArr = [];
// For Agora
var rtc = {
    client: null,
    localTracks: {
        videoTrack: null,
        audioTrack: null,
        screenTrack: null
    },
    localTrackState: {
        videoTrackMuted: false,
        audioTrackMuted: false
    },
    screenClient: null,
    // joined: false,
    // published: false,
    // localStream: null,
    // screenStream: null,
    // remoteStreams: [],
    params: {},
};
var rtm = {
    client: null,
    channel: null,
};
var camera, scene, renderer, control, loader_font;
var isMouseDown = false,
    onPointerDownMouseX = 0,
    onPointerDownMouseY = 0,
    lon = 0,
    onPointerDownLon = 0,
    lat = 0,
    onPointerDownLat = 0,
    phi = 0,
    theta = 0;
var animationList, avatarMixer;
var loadingScreenDone = false;
var listener; //for spatial Audio Global Listener
var mediaRecorder;
var recordedChunks = [];
const mixers = [];
const clock = new THREE.Clock();
var raycaster,
    mouse = { x: 0, y: 0 };
var localAudio = true;
var drawArrow = false;
var playVideo = false;
var screenshare = false;
var arrowCounter = 0;
var user_id = null;
var clock2, deltaTime, totalTime, keyboard;
// for asset packer
var files = [];
var fileblobs = [];
var gltf;
var remainingfilestoprocess = 0;
var glbfilename;
var outputBuffers;
var bufferMap;
var bufferOffset;
var defaultMeshPositions = {};
var modelMeshes = {};
var labelsS = [];
let selectedTile = "";
let selectedTileLink = "";
let textValueForAnnotation = "";


const refGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const refMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const refCube = new THREE.Mesh(refGeometry, refMaterial);

firebaseConfigure();


// Event Listener for Conference Config Buttons
document.getElementById("logout").addEventListener("click", disconnect);
// document.getElementById("showScreenshotsBtn").addEventListener("click", showScreenshots);
document.querySelectorAll("#imgBG").forEach((elem) => elem.addEventListener("click", changeBG));

// document.getElementById("custom-upload").addEventListener("click", function() {
//     document.getElementById("real-upload").click();
// });

document.getElementById("closeInfoModal").addEventListener("click", function () {
    $("#openInfoModal").modal("hide");
});

document.getElementById("submitSaveRoom").addEventListener("click", function () {
    var today = new Date();
    var curr_date =
        today.getDate() +
        " " +
        monthNames3Letter[today.getMonth()] +
        " " +
        today.getFullYear();
    database.ref("rooms/" + room).once("value", function (snapshot) {
        if (snapshot.exists()) {
            database.ref("savedRooms/" + uid_firebase + "/" + room).set({
                data: snapshot.val(),
                date: curr_date,
                projName: $("#projName").val(),
            },
                function (error) {
                    if (error) {
                        alert(error);
                    } else {
                        window.location.href = "/dashboard";
                    }
                },
            );
        } else {
            window.location.href = "/dashboard";
        }
    });
    $("#saveRoomModal").modal("hide");
});

document.getElementById("switchDeviceSubmit").addEventListener("click", function () {
    var videoId = $("#videoDevices").val();
    var audioId = $("#audioDevices").val();

    // for video
    if (videoId) {
        rtc.localTracks.videoTrack.setDevice(videoId).then(() => {
            swal(
                "Success",
                "Media device (Camera) changed",
                "success",
            ).catch(swal.noop);
        }).catch(e => {
            swal(
                "Failed",
                "error" + e,
                "error",
            ).catch(swal.noop);
        });
    }

    //for audio
    if (audioId) {
        rtc.localTracks.audioTrack.setDevice(audioId).then(() => {
            swal(
                "Success",
                "Media device (Microphone) changed",
                "success",
            ).catch(swal.noop);
        }).catch(e => {
            swal(
                "Failed",
                "Some Error Occurred",
                "error",
            ).catch(swal.noop);
        });
    }


    $("#openSettingsModal").modal("hide");
    $("#more-opts-modal").modal("hide");
});

$('#switchRes').on('click', function () {
    const resVal = $("#setResolution").val();
    if (!resVal) {
        swal(
            "Warning",
            "Select resolution",
            "warning",
        ).catch(swal.noop);
        return;
    }
    rtc.localTracks.videoTrack.setEncoderConfiguration(resVal)
        .then(() => {
            swal(
                "Success",
                "Resolution changed to " + resVal.split('_')[0],
                "success",
            ).catch(swal.noop);
        }).catch(e => {
            swal(
                "Failed",
                "error" + e,
                "error",
            ).catch(swal.noop);
        });
    $("#openSettingsModal").modal("hide");
    $("#more-opts-modal").modal("hide");

})
$(document).on("click", "#obj-people", function (event) {
    $('#sidebar-right-object').css("right", "0");
});
$(document).on("click", "#close_sidebar_btn", function () {
    $('#sidebar-right-object').css("right", "-360px");
})
$(document).on("click", ".ss_img", function () {
    // console.log($(this).data('ssname'));
    loadAnnotatedFile($(this).data("ssname"));
    $("#screenshot_modal").hide();
});

$("#openLibraryModal").on("show.bs.modal", function (e) {
    document.removeEventListener("mousewheel", onDocumentMouseWheel, false);
});

$("#openLibraryModal").on("hidden.bs.modal", function (e) {
    document.addEventListener("mousewheel", onDocumentMouseWheel, false);
});

$("#openAttachmentModalTV").on("show.bs.modal", function (e) {
    $("#tempDiv").css({ display: "none" });
    // listObjectsTV();
});

$("#screenshot_modal").on("show.bs.modal", function (e) {
    document.removeEventListener("mousewheel", onDocumentMouseWheel, false);
});

$("#screenshot_modal").on("hidden.bs.modal", function (e) {
    document.addEventListener("mousewheel", onDocumentMouseWheel, false);
});

$("#openAnnotationModal").on("show.bs.modal", function (e) {
    document.removeEventListener("mousewheel", onDocumentMouseWheel, false);
});

$("#openAnnotationModal").on("hidden.bs.modal", function (e) {
    document.addEventListener("mousewheel", onDocumentMouseWheel, false);
});

$("#openSettingsModal").on("show.bs.modal", function (e) {
    $("#audioDevices").empty();
    $("#videoDevices").empty();
    $("#videoDevices").append(
        "<option value=''>--Select Video Device--</option>",
    );
    $("#audioDevices").append(
        "<option value=''>--Select Audio Device--</option>",
    );
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

$(".draggableModal").draggable().resizable();
$(".draggableModal").on("dragstop", function (event, ui) {
    $(".custom-modal").css({
        top: " calc( " +
            $(".custom-modal").css("top") +
            " + " +
            $(".draggableModal").css("top") +
            ")",
        left: " calc( " +
            $(".custom-modal").css("left") +
            " + " +
            $(".draggableModal").css("left") +
            ")",
    });
    $(".draggableModal").css({
        top: "0px",
        left: "0px",
    });
});
$("#speechToText").on("shown.bs.modal", function () {
    $("body").removeClass("modal-open");
    $(".custom-modal").removeClass("modal");
});

// Event Listeners for Model Transformations
//rotate
$("#r").click(function () {
    control.visible = true;
    control.setMode("rotate");
    // $("#r").attr("src", "/images/RotationW.png");
    // $("#r").css("background-color", "black");
    // $("#t").attr("src", "/images/Position.png");
    // $("#t").css("background-color", "white");
    // $("#s").attr("src", "/images/Scale.png");
    // $("#s").css("background-color", "white");
    // $("#tempDiv").css({ display: "none" });
});

//translate
$("#t").click(function () {
    control.visible = true;
    control.setMode("translate");
    // $("#r").attr("src", "/images/Rotation.png");
    // $("#r").css("background-color", "white");
    // $("#t").attr("src", "/images/PositionW.png");
    // $("#t").css("background-color", "black");
    // $("#s").attr("src", "/images/Scale.png");
    // $("#s").css("background-color", "white");
    // $("#tempDiv").css({ display: "none" });
});

//scale
$("#s").click(function () {
    control.visible = true;
    control.setMode("scale");
    // $("#r").attr("src", "/images/Rotation.png");
    // $("#r").css("background-color", "white");
    // $("#t").attr("src", "/images/Position.png");
    // $("#t").css("background-color", "white");
    // $("#s").attr("src", "/images/ScaleW.png");
    // $("#s").css("background-color", "black");
    // $("#tempDiv").css({ display: "none" });
});

//scale
function goToFront(object) {
    scene.background = null;
    scene.getObjectByName("MainModel").visible = false;
    renderer.outputEncoding = null;
    renderer.physicallyCorrectLights = false;
    renderer.toneMapping = null;

    scene.getObjectByName("assistelem_2021").visible = true;
    renderer.domElement.addEventListener("click", raycast, false);

    // make avatars hide
    for (let i = 0; i < scene.children.length; i++) {
        if (scene.children[i].userData.type == 'avatar') {
            scene.children[i].visible = false;
        }
    }

    var cwd = new THREE.Vector3();

    if (object.userData.type == "avatar") {
        object.getWorldDirection(cwd);
        cwd.multiplyScalar(-0.3 * 5);
        cwd.add(object.position);
        camera.position.copy(cwd);
        // if (object.userData.type == "ajnax") camera.position.z = camera.position.z + 0.25;
        camera.lookAt(object.position);
        var tempDisplacement = camera.position.x - 2.5;
        database.ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
            .update({
                px: tempDisplacement.toFixed(6),
                py: camera.position.y.toFixed(6),
                pz: camera.position.z.toFixed(6),
                qx: camera.quaternion.x.toFixed(6),
                qy: camera.quaternion.y.toFixed(6),
                qz: camera.quaternion.z.toFixed(6),
                qw: camera.quaternion.w.toFixed(6),
            });
    } else if (object.userData.type == "ajnax") {
        currentStreamId = object.userData.id;
        scene.background = new THREE.VideoTexture(document.getElementById("remoteVideo" + object.userData.id));
        $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
        $('.toolbar-btn-ajnax').show();
        $("#x").hide();
        $("#x").off("click");
        // pinScreen(object.userData.id, object);
        // object.getWorldDirection(cwd);
        // cwd.multiplyScalar(-0.2 * (Math.max(object.scale.x, object.scale.y, object.scale.z)));
    } else {
        object.getWorldDirection(cwd);
        cwd.multiplyScalar(0.15 * (Math.max(object.scale.x, object.scale.y, object.scale.z)));
        cwd.add(object.position);
        camera.position.copy(cwd);
        // if (object.userData.type == "ajnax") camera.position.z = camera.position.z + 0.25;
        camera.lookAt(object.position);
        var tempDisplacement = camera.position.x - 2.5;
        database.ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
            .update({
                px: tempDisplacement.toFixed(6),
                py: camera.position.y.toFixed(6),
                pz: camera.position.z.toFixed(6),
                qx: camera.quaternion.x.toFixed(6),
                qy: camera.quaternion.y.toFixed(6),
                qz: camera.quaternion.z.toFixed(6),
                qw: camera.quaternion.w.toFixed(6),
            });
    }

}

function ajnaxTeleport(id) {
    console.log("inside ajnaxteleport", id);
    scene.background = null;
    scene.getObjectByName("MainModel").visible = false;
    renderer.outputEncoding = null;
    renderer.physicallyCorrectLights = false;
    renderer.toneMapping = null;

    // make avatars hide
    for (let i = 0; i < scene.children.length; i++) {
        if (scene.children[i].userData.type == 'avatar') {
            scene.children[i].visible = false;
        }
    }

    // make remote assist elem hide
    scene.getObjectByName("assistelem_2021").visible = false;
    renderer.domElement.removeEventListener("click", raycast, false);


    currentStreamId = id;
    scene.background = new THREE.VideoTexture(document.getElementById("remoteVideo" + id));
    $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
    $('.toolbar-btn-ajnax').show();
    $("#unpinScreen").hide();
    $("#x").hide();
    $("#x").off("click");
}
$("#frontSpawn").click(function () {
    goToFront(control.object);
});

// disperse Model
$("#disperseBtn").on("click", function () {
    database
        .ref("rooms/" + room + "/" + control.object.name)
        .once("value", (snapshot) => {
            if (snapshot.val().dispersed == "false") {
                database
                    .ref("rooms/" + room + "/" + control.object.name)
                    .update({ dispersed: "true" });

                for (
                    let i = 0; i < modelMeshes[control.object.name]["mesh_list"].length; i++
                ) {
                    var meshDataObj = {};
                    meshDataObj.modelName =
                        modelMeshes[control.object.name]["mesh_list"][i];
                    var meshObj = scene.getObjectByName(meshDataObj.modelName);
                    meshDataObj.px = meshObj.position.x.toFixed(6);
                    meshDataObj.py = meshObj.position.y.toFixed(6);
                    meshDataObj.pz = meshObj.position.z.toFixed(6);
                    meshDataObj.sx = meshObj.scale.x.toFixed(6);
                    meshDataObj.sy = meshObj.scale.y.toFixed(6);
                    meshDataObj.sz = meshObj.scale.z.toFixed(6);
                    meshDataObj.qx = meshObj.quaternion.x.toFixed(6);
                    meshDataObj.qy = meshObj.quaternion.y.toFixed(6);
                    meshDataObj.qz = meshObj.quaternion.z.toFixed(6);
                    meshDataObj.qw = meshObj.quaternion.w.toFixed(6);
                    meshDataObj.fileType = "ModelMesh";
                    meshDataObj.parentModelName = control.object.name;

                    database
                        .ref("rooms/" + room + "/" + meshDataObj.modelName)
                        .update(meshDataObj);
                }
            }
        });
});

// Restore Model
$("#restoreBtn").on("click", function () {
    database
        .ref("rooms/" + room + "/" + control.object.name)
        .once("value", (snapshot) => {
            if (snapshot.val().dispersed == "true") {
                database.ref("rooms/" + room + "/" + control.object.name).update({
                    dispersed: "false",
                });

                for (
                    let i = 0; i < modelMeshes[control.object.name]["mesh_list"].length; i++
                ) {
                    sendDeleteModel(
                        modelMeshes[control.object.name]["mesh_list"][i],
                        room,
                    );
                }
            }
        });
});

// play custom video
$("#play").click(function () {
    playVideo = !playVideo;
    var selectedVideoObject = control.object.name;
    if (playVideo) {
        sendStatus(selectedVideoObject, "1");
    } else {
        sendStatus(selectedVideoObject, "0");
    }
});

// next page of PDF
$("#next").click(function () {
    var selectedPdfObjectName = control.object.name;
    var pdfData = control.object.userData;
    if (pdfData.currentPage < pdfData.pdfObject._pdfInfo.numPages) {
        // pageNum++;
        sendPage(selectedPdfObjectName, pdfData.currentPage + 1);
    }
});

// previous page of PDF
$("#previous").click(function () {
    var selectedPdfObjectName = control.object.name;
    var pdfData = control.object.userData;
    if (pdfData.currentPage > 0) {
        // pageNum--;
        sendPage(selectedPdfObjectName, pdfData.currentPage - 1);
    }
});

const tile = (
    tileName,
    link,
    id,
) => `<div data-id=${id} data-name=${tileName} data-link=${link} id=${id} class="tile annotate-tile">
        <div class="annotate-image">
        <img src="${link}" class="tile-image">
        </div>
        </div>`;
$("#submitLibrary").click(function (event) {
    document.getElementById("real-upload").click();
    // document.getElementById(selectedTileLibrary.split(" ").join("")).children[0].style.backgroundColor = "#e7e7e7";
    // selectedTileLibrary = "";
    // $("#openLibraryModal").modal("hide");
});
$(document).on("click", ".add-element", function (event) {
    console.log(event.target);
    database.ref("storageinfo/" + uid_firebase + "/" + event.target.parentNode.parentNode.dataset.name).on("value", (snapshot) => {
        var cwd = new THREE.Vector3();
        camera.getWorldDirection(cwd);
        cwd.multiplyScalar(0.3);
        cwd.add(camera.position);
        sendModel(
            snapshot.val().url,
            cwd.x,
            cwd.y,
            cwd.z,
            camera.quaternion.x,
            camera.quaternion.y,
            camera.quaternion.z,
            camera.quaternion.w,
            1,
            1,
            1,
            snapshot.val().fileName,
            snapshot.val().fileType,
            room,
        );
    });
    $("#openLibraryModal").modal("hide");
});
let topAnnotate;
let leftAnnotate;
let openAnnotate = false;

function populateAnnotations() {
    let rowTiles = "";
    storageRef
        .child("annotations/images")
        .listAll()
        .then(function (res) {
            res.items.forEach(function (itemRef) {
                itemRef.getDownloadURL().then(function (url) {
                    let name = itemRef.location.path.split("/");
                    name = name[name.length - 1].split(".")[0];
                    rowTiles = tile(name, url, name, null);
                    document.querySelector(".grid-4.tiles.ann").innerHTML += rowTiles;
                });
            });
        });
}

function openAnnotation(event) {
    $("#openAnnotationModal").modal("show");
}

populateAnnotations();
$(document).on("click", ".annotate-tile", (event) => {
    drawArrow = !drawArrow;
    if (selectedTile) {
        $("#" + selectedTile).css("background-color", "#e7e7e7");
        selectedTile = "";
        selectedTileLink = "";
    }
    console.log("Name", event.target.dataset.id);
    event.target.style.backgroundColor = "white";
    selectedTile = event.target.dataset.id;
    selectedTileLink = event.target.dataset.link;
});

$("#annotate-checkbox").change((event) => {
    $("#annotate-input").attr("disabled", !event.target.checked);
    $("#annotate-input").attr("required", event.target.checked);
    if (!event.target.checked) {
        $("#annotate-input").css("background-color", "grey");
        textValueForAnnotation = "";
    } else {
        $("#annotate-input").css("background-color", "#787ff6");
    }
});
$("#annotate-button").click(openAnnotation);


// remove arrows
$("#ax").click(function () {
    removeRoomArrows(control.object.name);
});

// zoom in ++
$("#zoomin").click(function () {
    control.object.scale.set(
        control.object.scale.x + 0.1,
        control.object.scale.y + 0.1,
        control.object.scale.z + 0.1,
    );
});

// zoom out --
$("#zoomout").click(function () {
    control.object.scale.set(
        control.object.scale.x - 0.1,
        control.object.scale.y - 0.1,
        control.object.scale.z - 0.1,
    );
});

// screen-Shot
$("#screenShot").click(function () {
    $('.loadingDiv').show();
    grabFrame(
        document.getElementById("remoteVideo" + currentStreamId)
            .srcObject,
    );
    // control.detach();
    // $("#tempDiv").css({ display: "none" });
});

// pin-screen
$("#pinScreen").click(function () {
    // console.log(control.object.userData.id);
    // console.log(
    //   document.getElementById("remoteVideo" + control.object.userData.id)
    //     .srcObject
    // );
    pinScreen(control.object.userData.id, control.object);
    control.detach();
    $("#tempDiv").css({ display: "none" });
});

// unpin-screen
$("#unpinScreen").click(function () {
    unpinScreen(control.object.userData.id, control.object);
    control.detach();
    $("#tempDiv").css({ display: "none" });
});

// save Annotations
$("#saveAnnotations").click(function () {
    saveAnnotations(control.object.name);
    $("#tempDiv").css({ display: "none" });
});

//for loading assetsForTv
$(document).on("click", ".loadInTv", function (event) {
    let tvVideoElem = document.getElementById(control.object.name);
    // tvVideoElem.removeAttribute('src');
    // tvVideoElem.load();
    var downloadPath = event.target.dataset.name;
    var fileNameExt = downloadPath.split("/")[1];
    var fileName = fileNameExt.split(".")[0];
    var fileExt = fileNameExt.split(".").pop();
    $("#openAttachmentModalTV").modal("hide");
    storageRef
        .child(downloadPath)
        .getDownloadURL()
        .then(function (url) {
            database.ref("rooms/" + room + "/" + control.object.name).update({
                url: url,
                currentFileType: fileExt,
            });
        });
});

// Instantiate TV element
$("#tv").click(function () {
    var cwd = new THREE.Vector3();
    camera.getWorldDirection(cwd);
    cwd.multiplyScalar(5);
    cwd.add(camera.position);
    sendModel(
        null,
        cwd.x,
        cwd.y,
        cwd.z,
        camera.quaternion.x,
        camera.quaternion.y,
        camera.quaternion.z,
        camera.quaternion.w,
        10,
        10,
        10,
        "tvElem",
        "TV",
        room,
    );
});

function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    } else {
        // ...
    }
}

async function startCapture(displayMediaOptions) {
    let captureStream = null;

    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(
            displayMediaOptions,
        );
        // let stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        // recorder = new RecordRTCPromisesHandler(captureStream, {
        // 	type: 'video'
        // });
        // recorder.startRecording();
        var options = { mimeType: "video/webm;codecs=vp9" };
        mediaRecorder = new MediaRecorder(captureStream, options);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start(100);
        toastr["info"]("Recording Started...", "", {
            positionClass: "toast-top-left",
        });
        $("#record-btn").css("display", "none");
        $("#stop-recording-btn").css("display", "");
    } catch (err) {
        console.error("Error: " + err);
    }
}

$("#record").on("click", function () {
    var displayMediaOptions = {
        video: {
            cursor: "always",
        },
        audio: true,
    };

    // Optional frames per second argument.
    startCapture(displayMediaOptions);
    $("#more-opts-modal").modal("hide");
});

$("#stopRecording").on("click", function () {
    $("#more-opts-modal").modal("hide");
    mediaRecorder.stop();
    $("#record-btn").css("display", "");
    $("#stop-recording-btn").css("display", "none");

    var blob = new Blob(recordedChunks, {
        type: "video/mp4",
    });
    var metadata = {
        contentType: "video/mp4",
    };
    var todayDate = new Date();
    var date_str =
        todayDate.getFullYear() +
        "_" +
        (todayDate.getMonth() + 1) +
        "_" +
        todayDate.getDate() +
        "_" +
        todayDate.getHours() +
        "_" +
        todayDate.getMinutes() +
        "_" +
        todayDate.getSeconds();
    var uploadRecordedVideo = storageRef
        .child(uid_firebase + "/recordedVideo_" + date_str + ".mp4")
        .put(blob, metadata);
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "recordedVideo_" + date_str + ".mp4";
    a.click();
    window.URL.revokeObjectURL(url);
    swal(
        "Screen Recorded Successfully!!..",
        "Recorded Video has been saved in your account.",
        "success",
    ).catch(swal.noop);
});

// screenshare
$("#screenshare").click(function () {
    if (control.object && control.object.userData.type == "TV") {
        screenshare = !screenshare;
        if (screenshare) {
            // $("#screenshare").attr("src", "/images/ScreenShareOn.png");
            // $('#screenshare').css("back  ground-color", "black");
            screenShare();
        } else {
            // $("#screenshare").attr("src", "/images/ScreenShareOff.png");
            // $('#screenshare').css("background-color", "");
            rtc.client.unpublish(rtc.localTracks.screenTrack);
            database.ref("currentUsers/" + rtc.params.suid).remove();
            var tvObject = control.object;
            tvObject.material.map = new THREE.TextureLoader().load("/images/load.png");
            tvObject.material.needsUpdate = true;
        }
    } else {
        alert("Please select TV object First!!!");
    }
});

// share room email 
$("#sendEmailBtn").on("click", () => {
    sendEmail();
    $("#share_room_modal").modal("hide");
});

async function sendEmail() {
    await database.ref('savedRooms/' + uid_firebase + '/' + room).once("value", function (snapshot) {
        fetch("/sendEmail", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "CSRF-Token": Cookies.get("XSRF-TOKEN"),
            },
            body: JSON.stringify({
                subject: "Invitation to join room",
                to: $("#emailList").val(),
                html: 'You are invited to join the room for Remote Assistance<br><br>Room Number: ' + room + '<br>Room Password: ' + snapshot.val().roomPass + '<br><a href="https://CS5337.web.app">Location</a>'
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

// Testing inputs 
$(document).ready(function () {

    $('.toolbar-btn-main').show();
    $(".toolbar-btn-dynamic").hide();

    $("#closeEnlargedVidBtn").on("click", function () {
        $("#newDiv").hide();
    });

    $("#stickyNotesBtn").click(function () {
        $(".stickyNoteDiv textarea").toggle();
        if ($(".stickyNoteDiv textarea").css("pointer-events") == "none")
            $(".stickyNoteDiv textarea").css("pointer-events", "all");
        else $(".stickyNoteDiv textarea").css("pointer-events", "none");
    });

    $(".send_msg_btn").on("click", function () {
        var message_to_send = $("#chat_msg_inp").val();
        if (message_to_send) {
            rtm.channel
                .sendMessage({ text: message_to_send })
                .then(() => {
                    // <span aria-hidden="true"><b> You </b> : </span>\
                    /* Your code for handling events, such as a channel message-send success. */
                    $(".chat_list").append(
                        '<div>\
                            <div class="col-md-12 chat-message">\
                                <div class="col-md-3"></div>' +
                        '<div class="message-bg">' +
                        '<div class="col-md-9 alert alert-success alert-dismissible pull-right" role="alert">&nbsp;' +
                        message_to_send +
                        "\
                                    </div>\
                                    </div>\
                                    <div class='timestamp'>" + moment().calendar() + "</div>\
                                </div>\
                            </div>\
                        </div>",
                    );
                    $(".chat_body_div")[0].scrollTop =
                        $(".chat_body_div")[0].scrollHeight;
                })
                .catch((error) => {
                    /* Your code for handling events, such as a channel message-send failure. */
                    alert("unable to send message!");
                });
        }
        $("#chat_msg_inp").val("");
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
});

//@param posObject, x,y,z co-ordinates of arrow's pos
function AddArrow(posObject, arrowName, parentModelName) {
    console.log(posObject);
    if (posObject.annotModelUrl) {
        var path = posObject.annotModelUrl;
        const loader = new THREE.GLTFLoader();
        const onLoad = (gltf, position) => {
            const model = gltf.scene;
            var currentModel = scene.getObjectByName(parentModelName);
            model.scale.set(1, 1, 1);
            model.name = arrowName + parentModelName;
            model.position.copy(position);
            if (posObject.annot) {
                const annotTextLabel = new SpriteText(text = posObject.annot, textHeight = 0.008);
                annotTextLabel.name = "arrow" + arrowName + parentModelName;
                annotTextLabel.color = 'orange';
                annotTextLabel.backgroundColor = 'rgba(0,0,190,0.6)';
                annotTextLabel.borderColor = 'lightgrey';
                annotTextLabel.borderWidth = 0.003;
                annotTextLabel.borderRadius = 3;
                annotTextLabel.position.set(0, 0.02, 0.01);
                model.add(annotTextLabel);
            }

            currentModel.add(model); //use .attach() for maintaining world transform of child object(model).
            arrowCounter += 1;
        };
        // the loader will report the loading progress to this function
        $("#model_load_bar_percent").text("0%");
        const onProgress = (xhr) => {
            $("#model_load_bar_container").show();
            var current = parseInt((xhr.loaded / xhr.total) * 100);
            current += "%";
            $("#model_load_bar").css("width", current);
            $("#model_load_bar_percent").text(current);
            if (xhr.loaded == xhr.total) {
                $("#model_load_bar").css("width", "0%");
                $("#model_load_bar_container").hide();
            }
        };
        // the loader will send any error messages to this function, and we'll log them to to console
        const onError = (errorMessage) => {
            alert(errorMessage);
        };
        // load the first model. Each model is loaded asynchronously,
        const position = new THREE.Vector3(
            parseFloat(posObject.px),
            parseFloat(posObject.py),
            parseFloat(posObject.pz),
        );
        loader.load(path, (gltf) => onLoad(gltf, position), onProgress, onError);
    }

}

function getModelMeshes(modelCopy, model_name) {
    // console.log(modelCopy.name, "is not a mesh. Going one level deeper");
    if (modelCopy.type == "Mesh") {
        if (!(model_name in modelMeshes)) {
            modelMeshes[model_name] = { mesh_list: [modelCopy.name] };
        } else {
            modelMeshes[model_name]["mesh_list"].push(modelCopy.name);
        }

        if (!(model_name in defaultMeshPositions)) {
            defaultMeshPositions[model_name] = {};
        }

        if (!(modelCopy.name in defaultMeshPositions[model_name])) {
            defaultMeshPositions[model_name][modelCopy.name] = {
                px: modelCopy.position.x,
                py: modelCopy.position.y,
                pz: modelCopy.position.z,
                sx: modelCopy.scale.x,
                sy: modelCopy.scale.y,
                sz: modelCopy.scale.z,
                rx: modelCopy.rotation.x,
                ry: modelCopy.rotation.y,
                rz: modelCopy.rotation.z,
            };
        }
        return;
    }
    while (modelCopy.type != "Mesh") {
        // console.log("It has",modelCopy.children.length, " children");
        for (var i = 0; i < modelCopy.children.length; i++) {
            // console.log(i, modelCopy.name)
            var newModel = modelCopy.children[i];
            getModelMeshes(newModel, model_name);
        }
        return;
    }
}

function addModelName(mesh_obj) {
    loader_font.load("/font.json", function (font) {
        var geom_annot = new THREE.TextGeometry(mesh_obj.name, {
            font: font,
            size: 0.11,
            height: 0,
            curveSegments: 12,
            bevelEnabled: false,
        });

        var material_annot = new THREE.MeshBasicMaterial({ color: 0x000000 });
        var mesh_annot = new THREE.Mesh(geom_annot, material_annot);
        mesh_annot.name = "annot_" + mesh_obj.name;
        mesh_annot.position.set(
            mesh_obj.position.x,
            mesh_obj.position.y + 0.02,
            mesh_obj.position.z,
        );
        // mesh_annot.quaternion.copy(camera.quaternion);
        mesh_obj.add(mesh_annot);
    });
}

function disperseMeshes(model_name) {
    var model_meshes = modelMeshes[model_name]["mesh_list"];
    var numOfMeshes = model_meshes.length;
    for (let i = 0; i < numOfMeshes / 2; i++) {
        var meshObj = scene.getObjectByName(model_meshes[i]);

        meshObj.position.x = meshObj.position.x - i * 2;
        meshObj.position.y = meshObj.position.y - i * 2;
        meshObj.position.z = meshObj.position.z - i * 2;
        addModelName(meshObj);
    }

    for (let i = Math.ceil(numOfMeshes / 2); i < numOfMeshes; i++) {
        var meshObj = scene.getObjectByName(model_meshes[i]);

        meshObj.position.x = meshObj.position.x + (i * 2 - numOfMeshes / 2);
        meshObj.position.y = meshObj.position.y + (i * 2 - numOfMeshes / 2);
        meshObj.position.z = meshObj.position.z + (i * 2 - numOfMeshes / 2);
        addModelName(meshObj);
    }
}

function restoreMeshes(model_name) {
    for (const objName in defaultMeshPositions[model_name]) {
        var objectToPosition = scene.getObjectByName(objName);
        objectToPosition.children = [];
        objectToPosition.position.x = defaultMeshPositions[model_name][objName].px;
        objectToPosition.position.y = defaultMeshPositions[model_name][objName].py;
        objectToPosition.position.z = defaultMeshPositions[model_name][objName].pz;
        objectToPosition.scale.x = defaultMeshPositions[model_name][objName].sx;
        objectToPosition.scale.y = defaultMeshPositions[model_name][objName].sy;
        objectToPosition.scale.z = defaultMeshPositions[model_name][objName].sz;
        objectToPosition.rotation.x = defaultMeshPositions[model_name][objName].rx;
        objectToPosition.rotation.y = defaultMeshPositions[model_name][objName].ry;
        objectToPosition.rotation.z = defaultMeshPositions[model_name][objName].rz;
    }
}

function animateAvatar(uid, level) {
    if (level >= 5) {
        var obj = scene.getObjectByName(uid.toString());
        avatarMixer = new THREE.AnimationMixer(obj);
        var animation = avatarMixer.clipAction(animationList[12]);
        animation.setLoop(THREE.LoopOnce);
        animation.clampWhenFinished = true;
        animation.enable = true;
        animation.play();
    }
}

function loadAvatar(
    uid,
    url,
    px,
    py,
    pz,
    qx,
    qy,
    qz,
    qw,
    sx,
    sy,
    sz,
    agoraId,
    modelName,
) {
    var avatarName = modelName.split("_")[0];
    if (uid != uid_firebase) {
        refCube.scale.set(1, 1, 1);
        var path = url;
        const loader = new THREE.GLTFLoader();
        const onLoad = (gltf, position) => {
            const model = gltf.scene;
            model.traverse(function (node) {
                if (node.isMesh || node.isLight) node.castShadow = true;
                if (node.isMesh || node.isLight) node.receiveShadow = true;
            });

            animationList = gltf.animations;
            const animation = gltf.animations[2];
            const mixer = new THREE.AnimationMixer(model);
            mixers.push(mixer);
            if (animation) {
                const action = mixer.clipAction(animation);
                action.play();
            }

            var allParent = new THREE.Object3D();
            allParent.name = "allParent";
            for (var child in model.children) {
                allParent.add(model.children[child]);
            }
            model.children = [];
            model.add(allParent);
            var bounds = new THREE.Box3();
            bounds.setFromObject(model);
            var boundsSize = new THREE.Vector3();
            bounds.getSize(boundsSize);

            var refBounds = new THREE.Box3();
            refBounds.setFromObject(refCube);
            var refBoundsSize = new THREE.Vector3();
            refBounds.getSize(refBoundsSize);

            var newScale = new THREE.Vector3();
            newScale = new THREE.Vector3(
                refBoundsSize.x / boundsSize.x,
                refBoundsSize.y / boundsSize.y,
                refBoundsSize.z / boundsSize.z,
            );

            var scale = Math.min(newScale.x, newScale.y, newScale.z);
            allParent.scale.set(scale, scale, scale);

            var newBounds = new THREE.Box3();
            newBounds.setFromObject(model);
            var center = new THREE.Vector3();
            newBounds.getCenter(center);
            allParent.position.sub(model.worldToLocal(center));
            loader_font.load("/font.json", function (font) {
                var geom_annot = new THREE.TextGeometry(avatarName, {
                    font: font,
                    size: 0.01,
                    height: 0,
                    curveSegments: 12,
                    bevelEnabled: false,
                });

                var material_annot = new THREE.MeshBasicMaterial({
                    color: 0x39FF14,
                    side: THREE.DoubleSide,
                });
                var mesh_annot = new THREE.Mesh(geom_annot, material_annot);
                // mesh_annot.name = "annot" + arrowName + parentModelName;
                mesh_annot.position.set(
                    model.position.x + 0.05,
                    model.position.y + 0.04,
                    model.position.z,
                );
                mesh_annot.rotateY(3.141593);
                model.add(mesh_annot);
                var texture_icon = new THREE.TextureLoader().load("/images/mic_on.png");
                var geom_icon = new THREE.CircleGeometry(0.01, 32);
                var material_icon = new THREE.MeshBasicMaterial({
                    map: texture_icon,
                    side: THREE.DoubleSide,
                });
                var mesh_icon = new THREE.Mesh(geom_icon, material_icon);
                mesh_icon.name = agoraId + "audiostat";
                mesh_icon.position.set(
                    model.position.x - 0.03,
                    model.position.y + 0.02,
                    model.position.z,
                );
                model.add(mesh_icon);
            });
            const group = new THREE.Object3D();
            var customData = { type: "avatar" };
            group.userData = customData;
            group.name = agoraId;
            group.add(model);
            group.scale.set(sx, sy, sz);
            group.position.set(px, py, pz);
            group.quaternion.set(qx, qy, qz, qw);
            scene.add(group);

            // var checkAudio = setInterval(function () {
            //     if ($("#remoteAudio" + agoraId).length) {
            //         // func for attaching spatial audio to avatar
            //         attachSpatialAudio(agoraId);
            //         clearInterval(checkAudio);
            //     }
            // }, 1000);

            // var checkAjnaX = setInterval(function() {
            //     if (typeof(scene.getObjectByName("ajnax" + agoraId)) != "undefined") {
            //         // func for attaching ajnaxStream to avatar
            //         attachAjnaXStream(agoraId);
            //         clearInterval(checkAjnaX);
            //     }
            // }, 1000);
        };
        // the loader will report the loading progress to this function
        const onProgress = (xhr) => { };
        // the loader will send any error messages to this function, and we'll log them to to console
        const onError = (errorMessage) => {
            alert(errorMessage);
        };
        // load the first model. Each model is loaded asynchronously,
        const position = new THREE.Vector3(px, py, pz);
        loader.load(path, (gltf) => onLoad(gltf, position), onProgress, onError);
        database
            .ref("currentUsers/" + agoraId)
            .once("value", function (snapshot) {
                console.log("Avatar found:", snapshot.val(), agoraId);
                $("#people-list").append(
                    `<li  id="people_${agoraId}" data-name="${agoraId}" class="object-element">
                        <div class="d-flex text">
                            <img class="object-img icon" style="margin: 5px;border-radius: 50%;" src="${snapshot.val().photo}" alt="type"/>
                                <div class="object-text">
                                    ${avatarName}
                                </div>
                        </div>
                        <div class="d-flex object-controls">
                            <img id="${agoraId}-tel-icon" class="object-img icon street goto-people" style="display: none;width: 1.5em;margin: 5px" src="/images/newUI/streetGrey.svg" alt="type" data-name="${agoraId}"/>
                        </div>
                    </li>`);
            });

    }
    else {
        console.log("**************inside else***********");
        database
            .ref("currentUsers/" + agoraId)
            .once("value", function (snapshot) {
                console.log("Avatar found:", snapshot.val(), agoraId);
                $("#people-list").append(
                    `<li  id="people_${agoraId}" data-name="${agoraId}" class="object-element">
                    <div class="d-flex text">
                        <img class="object-img icon" style="margin: 5px;border-radius: 50%;" src="${snapshot.val().photo}" alt="type"/>
                            <div class="object-text">
                                ${avatarName}
                            </div>
                    </div>
                    <div class="d-flex object-controls">
                        <img id="local-tel-icon" class="object-img icon street goto-people" style="display: none;width: 1.5em;margin: 5px" src="/images/newUI/streetGrey.svg" alt="type" data-name="localVideo"/>
                    </div>
                </li>`);
            });

    }

}

//funtion to load models------.gltf or .glb models
//@param url ----firebase remote url of object
//@param px,py,pz ----translate positions
//@param qx,qy,qz,qw -----quaternion rotations
//@param sx,sy,sz ------scale values
//@param modelName - name with which model is referenced in the scene
$(document).on('click', '.goto-object', function (event) {
    const object = scene.getObjectByName(event.target.dataset.name);
    goToFront(object);
})

$(document).on('click', '.goto-people', function (event) {
    ajnaxTeleport(event.target.dataset.name);
})

function loadModels(
    url,
    px,
    py,
    pz,
    qx,
    qy,
    qz,
    qw,
    sx,
    sy,
    sz,
    modelName,
    isdispersed,
    callback,
) {
    refCube.scale.set(1, 1, 1);
    var path = url;
    const loader = new THREE.GLTFLoader();
    const onLoad = (gltf, position) => {
        const model = gltf.scene;
        getModelMeshes(model, modelName);
        modelMeshes[modelName]["isDispersed"] = isdispersed;

        model.traverse(function (node) {
            if (node.isMesh || node.isLight) node.castShadow = true;
            if (node.isMesh || node.isLight) node.receiveShadow = true;
        });

        const animation = gltf.animations[0];
        const mixer = new THREE.AnimationMixer(model);
        mixers.push(mixer);
        if (animation) {
            const action = mixer.clipAction(animation);
            action.play();
        }

        var allParent = new THREE.Object3D();
        allParent.name = "allParent";
        for (var child in model.children) {
            allParent.add(model.children[child]);
        }
        model.children = [];
        model.add(allParent);
        var bounds = new THREE.Box3();
        bounds.setFromObject(model);
        var boundsSize = new THREE.Vector3();
        bounds.getSize(boundsSize);

        var refBounds = new THREE.Box3();
        refBounds.setFromObject(refCube);
        var refBoundsSize = new THREE.Vector3();
        refBounds.getSize(refBoundsSize);

        var newScale = new THREE.Vector3();
        newScale = new THREE.Vector3(
            refBoundsSize.x / boundsSize.x,
            refBoundsSize.y / boundsSize.y,
            refBoundsSize.z / boundsSize.z,
        );

        var scale = Math.min(newScale.x, newScale.y, newScale.z);
        allParent.scale.set(scale, scale, scale);

        var newBounds = new THREE.Box3();
        newBounds.setFromObject(model);
        var center = new THREE.Vector3();
        newBounds.getCenter(center);
        allParent.position.sub(model.worldToLocal(center));
        const group = new THREE.Object3D();
        var customData = { type: "3DModel" };
        group.userData = customData;
        group.name = modelName;
        group.add(model);
        group.scale.set(sx, sy, sz);
        group.position.set(px, py, pz);
        group.quaternion.set(qx, qy, qz, qw);
        var modelLight = new THREE.DirectionalLight(0xffffff, 1);
        group.add(modelLight);
        scene.add(group);
        if (isdispersed == "true") disperseMeshes(group.name);
        callback();
    };
    // the loader will report the loading progress to this function
    const onProgress = (xhr) => {
        $("#model_load_bar_container").show();
        var current = parseInt((xhr.loaded / xhr.total) * 100);
        current += "%";
        $("#model_load_bar").css("width", current);
        $("#model_load_bar_percent").text(current);

        if (xhr.loaded == xhr.total) {
            $("#model_load_bar").css("width", "0%");
            $("#model_load_bar_container").hide();
        }
    };
    // the loader will send any error messages to this function, and we'll log them to to console
    const onError = (errorMessage) => {
        alert(errorMessage);
    };
    // load the first model. Each model is loaded asynchronously,
    const position = new THREE.Vector3(px, py, pz);
    loader.load(path, (gltf) => onLoad(gltf, position), onProgress, onError);
}

//funtion to load FBX models
//@param url ----firebase remote url of object
//@param px,py,pz ----translate positions
//@param qx,qy,qz,qw -----quaternion rotations
//@param sx,sy,sz ------scale values
//@param modelName - name with which model is referenced in the scene
function loadFBX(url, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName) {
    var path = url;
    const loader = new FBXLoader();
    const onLoad = (fbx, position) => {
        const model = fbx;
        model.traverse(function (node) {
            if (node.isMesh || node.isLight) node.castShadow = true;
            if (node.isMesh || node.isLight) node.receiveShadow = true;
        });
        model.scale.set(sx, sy, sz);
        model.name = modelName;
        model.position.copy(position);
        model.quaternion.x = qx;
        model.quaternion.y = qy;
        model.quaternion.z = qz;
        model.quaternion.w = qw;
        const animation = fbx.animations[0];
        const mixer = new THREE.AnimationMixer(model);
        mixers.push(mixer);
        if (animation) {
            const action = mixer.clipAction(animation);
            action.play();
        }

        scene.add(model);
    };
    // the loader will report the loading progress to this function
    const onProgress = (xhr) => {
        $("#model_load_bar_container").show();
        var current = parseInt((xhr.loaded / xhr.total) * 100);
        current += "%";
        $("#model_load_bar").css("width", current);
        $("#model_load_bar_percent").text(current);
        if (xhr.loaded == xhr.total) {
            $("#model_load_bar").css("width", "0%");
            $("#model_load_bar_container").hide();
        }
    };
    // the loader will send any error messages to this function, and we'll log them to to console
    const onError = (errorMessage) => {
        alert(errorMessage);
    };
    // load the first model. Each model is loaded asynchronously,
    const position = new THREE.Vector3(px, py, pz);
    loader.load(path, (fbx) => onLoad(fbx, position), onProgress, onError);
}

// funtion to transform model by remote client
function receiveTransformModel(px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName) {
    var model = scene.getObjectByName(modelName);
    // quaternion to euler conversions
    var quaternion = new THREE.Quaternion();
    quaternion.set(qx, qy, qz, qw);
    var euler = new THREE.Euler();
    euler.setFromQuaternion(quaternion);
    // positions
    model.position.x = px;
    model.position.y = py;
    model.position.z = pz;
    // rotations
    model.rotation.x = euler.x;
    model.rotation.y = euler.y;
    model.rotation.z = euler.z;
    // scales
    model.scale.x = sx;
    model.scale.y = sy;
    model.scale.z = sz;
}

// function to delete model
function deleteModels(modelName) {
    console.log(modelName);
    if (control.object && control.object.name == modelName) {
        control.detach();
        $(".toolbar-btn-dynamic").hide();
        $(".toolbar-btn-main").show();
        $("#tempDiv").css({ display: "none" });
    }
    var deleteM = scene.getObjectByName(modelName);
    var deleteE = document.getElementById(modelName);

    //   if (deleteM.userData.type == "ajnaxstream") {
    //     // parentCamera.remove(deleteM);
    //     return;
    //   }
    scene.remove(deleteM);
    if (deleteE) {
        deleteE.remove();
    }
    // const element = document.getElementById(modelName);
    // element.parentNode.parentNode.removeChild(element.parentNode);
    $('#li_' + modelName.split("_")[1]).remove();
    makeVisibleAfterTeleportation();
    // screenshare = !screenshare;
    // rtc.screenClient.unpublish(rtc.screenStream);
    // database.ref("currentUsers/" + rtc.params.suid).remove();
}

// function to delete arrows
function deleteArrows(parentModel, i) {
    var parentObject = scene.getObjectByName(parentModel);
    parentObject.remove(parentObject.getObjectByName("annot" + i + parentModel));
    parentObject.remove(
        parentObject.getObjectByName("arrowannot" + i + parentModel),
    );
    arrowCounter -= 1;
}
const libTile = (
    tileName,
    link,
    id,
    name,
    className
) => `<div data-id=${id} title="${name}" data-name="${tileName}" data-link="${link}" id="type_${id}" class="tile lib-tile">
        <div class="lib-image">
        <div data-name="${tileName}" class="${className ? className : "add-element"}"><img style="pointer-events: none" src="/images/newUI/blackplus.svg">Add</div>
        <img src="${link}" class="tile-image">
        </div>
        <div class="lib-tile-text"  title="${name}" style="text-align: center;">${name ? name : ""}</div>
        </div>`;

function populateLibrary() {
    database.ref("storageinfo/" + uid_firebase + "/").on("value", (snapshot) => {
        snapshot.forEach((snap) => {
            if (snap.val().fileName) {
                if (document.getElementById("type_" + snap.val().fileName.split(" ").join(""))) {
                    console.log(snap.val().fileName)
                    return;
                }
            }
            if (['glb', 'gltf'].includes(snap.val().fileType)) {
                document.querySelector("#tab-body-saved").innerHTML += libTile(snap.val().fileName, "https://static.thenounproject.com/png/997223-200.png", snap.val().fileName.split(" ").join(""), snap.val().fileName, null);
            } else if (imageSupportedFormats.includes(snap.val().fileType)) {
                document.querySelector("#tab-body-screenshot").innerHTML += libTile(snap.val().fileName, "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png", snap.val().fileName.split(" ").join(""), snap.val().fileName, null);
            }
            else if (videoSupportedFormats.includes(snap.val().fileType)) {
                document.querySelector("#tab-body-option-1").innerHTML += libTile(snap.val().fileName, "https://static.thenounproject.com/png/1813969-200.png", snap.val().fileName.split(" ").join(""), snap.val().fileName, null);
            }
            else if (docSupportedFormats.includes(snap.val().fileType)) {
                document.querySelector("#tab-body-option-2").innerHTML += libTile(snap.val().fileName, "https://static.thenounproject.com/png/2887858-200.png", snap.val().fileName.split(" ").join(""), snap.val().fileName, null);
            }
        });
    });
}
function init() {
    listObjectsTV();
    populateLibrary();
    scene = new THREE.Scene();
    // parentCamera = new THREE.Object3D();
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.01,
        1000000,
    );
    camera.position.set(-1.4, 1.5, 5);
    camera.quaternion.set(0, -0.15, 0, 1);
    // parentCamera.position.set(0, 10, 0);
    // parentCamera.quaternion.copy(camera.quaternion);
    // parentCamera.add(camera);
    // scene.add(parentCamera);
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.querySelector("canvas.webgl")
    });
    var loadingScreen = document.createElement("video");
    loadingScreen.id = "loadingScreenVideo";
    loadingScreen.loop = true;
    loadingScreen.crossOrigin = "anonymous";
    loadingScreen.src = "/videos/loading.mp4";
    loadingScreen.load(); // must call after setting/changing source
    loadingScreen.autoplay = "true";
    loadingScreen.muted = "true";
    loadingScreen.style.display = "none";
    loadingScreen.play();
    setTimeout(function () {
        loadingScreenDone = true;
    }, 2000);

    scene.background = new THREE.VideoTexture(loadingScreen);
    const ambientLight = new THREE.AmbientLight("#ffffff", 1.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight("#ffffff", 2);
    dirLight.castShadow = true; // default false
    dirLight.position.set(0, 10, 0);
    scene.add(dirLight);

    const loader = new THREE.GLTFLoader();
    const onLoad = (gltf, position) => {
        const model = gltf.scene;
        model.traverse(function (node) {
            if (node.isMesh || node.isLight) node.castShadow = true;
            if (node.isMesh || node.isLight) node.receiveShadow = true;
        });
        model.position.set(0, 0, 0);
        model.name = "MainModel";
        model.visible = false;
        scene.add(model);
    };
    // the loader will report the loading progress to this function
    const onProgress = (xhr) => {
        var current = parseInt((xhr.loaded / xhr.total) * 100);
        current += "%";
        if (xhr.loaded == xhr.total) {
            var checkLoadingScreen = setInterval(function () {
                if (loadingScreenDone) {
                    clearInterval(checkLoadingScreen);
                    scene.getObjectByName("MainModel").visible = true;
                    scene.background = null;
                    const loaderSky = new THREE.TextureLoader();
                    const textureSky = loaderSky.load("/images/sky3.jpg", () => {
                        const rt = new THREE.WebGLCubeRenderTarget(textureSky.image.height);
                        rt.fromEquirectangularTexture(renderer, textureSky);
                        scene.background = rt.texture;
                    });
                    renderer.outputEncoding = THREE.sRGBEncoding;
                    renderer.physicallyCorrectLights = true;
                    renderer.toneMapping = THREE.ACESFilmicToneMapping;
                    $("#overlay").fadeIn();
                    $("#obj-people").fadeIn();
                    // $("#openInfoModal").modal("show");
                    // boxBody.position.set(0, 10, 0);
                    // world.addBody(boxBody);
                    // bodyVelocity = boxBody.velocity;
                    connect();
                    //for loading remote assist elem
                    sendModel(
                        "https://firebasestorage.googleapis.com/v0/b/cs5337.appspot.com/o/tempURLs%2Fassist.png?alt=media&token=be5af2f8-dd08-4db7-a0b9-f25578a24909",
                        8.069711,
                        1.453634,
                        -1.510777,
                        0.020687,
                        -0.707486,
                        0.020727,
                        0.706120,
                        10,
                        10,
                        10,
                        "assistelem_2021",
                        "assistelem",
                        room,
                    );
                }
            }, 1000);
        }
    };
    // the loader will send any error messages to this function, and we'll log them to to console
    const onError = (errorMessage) => {
        alert(errorMessage);
    };
    // load the first model. Each model is loaded asynchronously,
    const position = new THREE.Vector3(0, 0, 0);
    loader.load(
        "https://firebasestorage.googleapis.com/v0/b/cs5337.appspot.com/o/roomScene%2FAjnasuiteRealScale.glb?alt=media&token=baeb883d-d8b6-41d3-88f3-70d663f0f424",
        // "/images/AjnasuiteRealScale.glb",
        (gltf) => onLoad(gltf, position),
        onProgress,
        onError
    );
    // https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/40fFzBqlSyNa11fHKZQGTtI8zjw2%2Fhall2.glb?alt=media&token=f777b3fb-03c7-4b5c-a11e-dbc1fec47e51
    // https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/40fFzBqlSyNa11fHKZQGTtI8zjw2%2FAjnaSuite2.glb?alt=media&token=f67cc6cc-f26b-4be6-9daa-ed199b959143
    // https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/40fFzBqlSyNa11fHKZQGTtI8zjw2%2FAjnaSuite1.glb?alt=media&token=da013f5f-10e3-4626-9a1c-252991f22eed

    // const loaderSky = new THREE.TextureLoader();
    // const textureSky = loaderSky.load("/images/sky.jpg", () => {
    //     const rt = new THREE.WebGLCubeRenderTarget(textureSky.image.height);
    //     rt.fromEquirectangularTexture(renderer, textureSky);
    //     scene.background = rt.texture;
    // });

    // // Floor

    // const textureLoader = new THREE.TextureLoader();

    // const texture = textureLoader.load("/images/grid.png");
    // const material = new THREE.MeshBasicMaterial({
    //     map: texture,
    //     side: THREE.DoubleSide,
    //     transparent: true,
    // });

    // // texture1.anisotropy = maxAnisotropy;
    // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(500, 500);

    // const geometry = new THREE.PlaneGeometry(5000, 5000);

    // const mesh = new THREE.Mesh(geometry, material);
    // mesh.rotation.x = -Math.PI / 2;
    // mesh.scale.set(0.1, 0.1, 0.1);
    // mesh.position.set(0, 0, 0);

    // scene.add(mesh);

    loader_font = new THREE.FontLoader();

    raycaster = new THREE.Raycaster();

    // renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.addEventListener("click", raycast, false);
    document.body.appendChild(renderer.domElement);



    window.addEventListener("resize", onWindowResize, false);

    clock2 = new THREE.Clock();
    deltaTime = 0;
    totalTime = 0;

    keyboard = new Keyboard();

    control = new THREE.TransformControls(camera, renderer.domElement);
    control.addEventListener("change", function () {
        var mode = control.getMode();
        var object = {};
        if (control.object) {
            if (control.object.userData.type != "screen" && control.object.userData.type != "ajnax") {
                object.name = control.object.name;
                if (mode == "translate") {
                    object.px = control.object.position.x.toFixed(6);
                    object.py = control.object.position.y.toFixed(6);
                    object.pz = control.object.position.z.toFixed(6);
                    object.sx = control.object.scale.x.toFixed(6);
                    object.sy = control.object.scale.y.toFixed(6);
                    object.sz = control.object.scale.z.toFixed(6);
                    var firebaseRTD = {
                        px: object.px,
                        py: object.py,
                        pz: object.pz,
                        sx: object.sx,
                        sy: object.sy,
                        sz: object.sz,
                    };
                    database.ref("rooms/" + room + "/" + object.name).update(firebaseRTD);
                }

                if (mode == "rotate") {
                    object.qx = control.object.quaternion.x.toFixed(6);
                    object.qy = control.object.quaternion.y.toFixed(6);
                    object.qz = control.object.quaternion.z.toFixed(6);
                    object.qw = control.object.quaternion.w.toFixed(6);

                    var firebaseRTD = {
                        qx: object.qx,
                        qy: object.qy,
                        qz: object.qz,
                        qw: object.qw,
                    };
                    database.ref("rooms/" + room + "/" + object.name).update(firebaseRTD);
                }

                if (mode == "scale") {
                    object.px = control.object.position.x.toFixed(6);
                    object.py = control.object.position.y.toFixed(6);
                    object.pz = control.object.position.z.toFixed(6);
                    object.sx = control.object.scale.x.toFixed(6);
                    object.sy = control.object.scale.y.toFixed(6);
                    object.sz = control.object.scale.z.toFixed(6);
                    var firebaseRTD = {
                        px: object.px,
                        py: object.py,
                        pz: object.pz,
                        sx: object.sx,
                        sy: object.sy,
                        sz: object.sz,
                    };
                    database.ref("rooms/" + room + "/" + object.name).update(firebaseRTD);
                }
            }
        }
    });
    scene.add(control);
    control.setSize(0.8);

    document.addEventListener("mousemove", onDocumentMouseMove, false);
    document.addEventListener("mousedown", onDocumentMouseDown, false);
    document.addEventListener("mouseup", onDocumentMouseUp, false);
    document.addEventListener("mousewheel", onDocumentMouseWheel, false);
    document.addEventListener("mousemove", hoverRaycast);
    // $("#overlay").fadeIn();
    // $("#openInfoModal").modal("show");
    //   boxBody.position.set(0, 10, 0);
    //   world.addBody(boxBody);
    //   bodyVelocity = boxBody.velocity;
    // connect();
}

$(document).on("mouseover", ".custom-tooltip", function (event) {
    const pos = event.target.getBoundingClientRect();
    $(this).parent().append(`<div class="tool-tip-custom" id="${$(this).attr("tooltipTitle").split(" ").join("")}-tool" style="transform: translateY(-50px)">
        <div style="position: relative;display: flex;justify-content: center;align-items: center;">
            ${$(this).attr("tooltipTitle")}
            <div class="triangle"></div>
        </div>
    </div>`);
});

$(document).on("mouseleave", ".custom-tooltip", function (event) {
    $(`#${$(this).attr("tooltipTitle").split(" ").join("")}-tool`).remove();
});

function initCannon() {
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;
    world.gravity.set(0, -9.8, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a sphere
    boxBody = new CANNON.Body({ mass: 20 });
    boxBody.addShape(new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1)));

    // event listener for boxBody for collider

    boxBody.addEventListener("collide", function (e) {
        var contact = e.contact;
        // console.log(contact);
    });

    // Create a plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.position.set(0, 0, 0);
    groundBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(1, 0, 0), -Math.PI / 2,
    );
    world.addBody(groundBody);
}

function isDispersedMesh(meshObj) {
    var tempObj = meshObj;
    while (tempObj["type"] != "Scene" && tempObj["type"] != "Group") {
        tempObj = tempObj.parent;
    }

    if (modelMeshes.hasOwnProperty(tempObj.parent.name)) {
        if (
            tempObj.type == "Group" &&
            modelMeshes[tempObj.parent.name]["mesh_list"].includes(meshObj.name) &&
            modelMeshes[tempObj.parent.name]["isDispersed"] == "true"
        ) {
            return true;
        }

    }

    return false;
}
const loaderImage = new THREE.TextureLoader().load("/images/load.png");
function loadTV(px, py, pz, qx, qy, qz, qw, sx, sy, sz, name) {
    var geometryElem = new THREE.PlaneGeometry(0.36, 0.2);
    var materialElem = new THREE.MeshStandardMaterial({
        map: loaderImage,
    });
    var meshElem = new THREE.Mesh(geometryElem, materialElem);
    meshElem.name = name;
    var CustomData = { type: "TV", url: "" };
    meshElem.userData = CustomData;
    meshElem.position.x = px;
    meshElem.position.y = py;
    meshElem.position.z = pz;
    meshElem.quaternion.x = qx;
    meshElem.quaternion.y = qy;
    meshElem.quaternion.z = qz;
    meshElem.quaternion.w = qw;
    meshElem.scale.set(sx, sy, sz);

    let tvVideoElem = document.createElement("video");
    tvVideoElem.id = name;
    tvVideoElem.style.display = "none";
    tvVideoElem.crossOrigin = "anonymous";
    tvVideoElem.autoplay = true;
    tvVideoElem.loop = true;
    // tvVideoElem.muted = true;
    document.body.appendChild(tvVideoElem);

    scene.add(meshElem);
}

async function raycast(e) {
    //1. sets the mouse position with a coordinate system where the center of the screen is the origin
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    raycaster.setFromCamera(mouse, camera);

    //3. compute intersections
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (drawArrow == false) {
        // Not Drawing Arrow..
        for (var i = 0; i < intersects.length; i++) {
            if (intersects[i].object.type == "Mesh") {
                document.removeEventListener("mousemove", onDocumentMouseMove, false);
                document.removeEventListener("mousedown", onDocumentMouseDown, false);
                document.removeEventListener("mouseup", onDocumentMouseUp, false);
                document.removeEventListener("mousewheel", onDocumentMouseWheel, false);
                var internalObject = intersects[i].object;
                if (internalObject.userData.type == "image") {
                    $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                    $('.toolbar-btn-trsds').show();
                    $('.toolbar-btn-image').show();
                    $("#x").off("click");
                    var selectedModel = scene.getObjectByName(internalObject.name);
                    control.detach();
                    control.attach(selectedModel);
                    control.visible = false;
                    $("#x").click(function () {
                        console.log(internalObject.name);
                        sendDeleteModel(internalObject.name, room);
                        drawArrow = false;
                    });
                    break;
                }
                else if (internalObject.userData.type == "assistelem") {
                    $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                    // $('.toolbar-btn-trsds').show();
                    $('.toolbar-btn-image').show();
                    $('#frontSpawn').show();
                    $("#x").off("click");
                    var selectedModel = scene.getObjectByName(internalObject.name);
                    control.detach();
                    control.attach(selectedModel);
                    control.visible = false;
                    $("#x").click(function () {
                        console.log(internalObject.name);
                        sendDeleteModel(internalObject.name, room);
                        drawArrow = false;
                    });
                    break;
                }
                // else if (internalObject.userData.type == "ajnaxstream") {
                //     $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                //     $('.toolbar-btn-trsds').show();
                //     $('#annotate-button').show();
                //     $("#tempDiv").css({
                //         position: "absolute",
                //         left: e.pageX + 25,
                //         top: e.pageY + 25,
                //         display: "block",
                //     });
                //     $("#x").off("click");
                //     var selectedModel = scene.getObjectByName(internalObject.name);
                //     control.detach();
                //     control.attach(selectedModel);
                //     $("#x").click(function() {
                //         sendDeleteModel(internalObject.name, room);
                //         drawArrow = false;
                //     });
                //     break;
                // } 
                else if (internalObject.userData.type == "video") {
                    $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                    $('.toolbar-btn-trsds').show();
                    $('.toolbar-btn-video').show();
                    $("#x").off("click");
                    var selectedModel = scene.getObjectByName(internalObject.name);
                    control.detach();
                    control.attach(selectedModel);
                    control.visible = false;
                    $("#x").click(function () {
                        sendDeleteModel(internalObject.name, room);
                        drawArrow = false;
                    });
                    break;
                } else if (internalObject.userData.type == "doc") {
                    $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                    $('.toolbar-btn-trsds').show();
                    $('.toolbar-btn-doc').show();
                    $("#x").off("click");
                    var selectedModel = scene.getObjectByName(internalObject.name);
                    control.detach();
                    control.attach(selectedModel);
                    control.visible = false;
                    $("#x").click(function () {
                        sendDeleteModel(internalObject.name, room);
                        drawArrow = false;
                    });
                    break;
                } else if (internalObject.userData.type == "screen") {
                    $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                    $('.toolbar-btn-trsds').show();
                    $("#x").off("click");
                    var selectedModel = scene.getObjectByName(internalObject.name);
                    control.detach();
                    control.attach(selectedModel);
                    control.visible = false;

                    $("#x").click(function () {
                        deleteModels(internalObject.name);
                        drawArrow = false;
                    });
                    break;
                } else if (internalObject.userData.type == "ajnax") {
                    $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                    $('.toolbar-btn-trsds').show();
                    $('.toolbar-btn-ajnax').show();
                    $("#x").hide();
                    $("#x").off("click");
                    var selectedModel = scene.getObjectByName(internalObject.name);
                    control.detach();
                    control.attach(selectedModel);
                    control.visible = false;

                    $("#x").click(function () {
                        deleteModels(internalObject.name);
                        drawArrow = false;
                    });
                    break;
                } else if (internalObject.userData.type == "TV") {
                    console.log("inside tv");
                    $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                    $('.toolbar-btn-trsds').show();
                    $('.toolbar-btn-tv').show();
                    $("#x").off("click");
                    var selectedModel = scene.getObjectByName(internalObject.name);
                    control.detach();
                    control.attach(selectedModel);
                    control.visible = false;

                    $("#x").click(function () {
                        sendDeleteModel(internalObject.name, room);
                        drawArrow = false;
                    });
                    break;
                } else if (isDispersedMesh(internalObject)) {
                    // attach controls and stuff
                    console.log(internalObject, "inside true");
                    $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                    $("#t").show();
                    $("#r").show();
                    $("#s").show();
                    $("#selectParentBtn").show();

                    // Select Parent Model
                    $("#selectParentBtn").on("click", function () {
                        database
                            .ref("rooms/" + room + "/" + internalObject.name)
                            .once("value", (snapshot) => {
                                if (snapshot.val().parentModelName) {
                                    $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                                    $("#disperseBtn").show();
                                    $("#restoreBtn").show();
                                    $("#x").off("click");
                                    var selectedModel = scene.getObjectByName(
                                        snapshot.val().parentModelName,
                                    );
                                    control.detach();
                                    control.attach(selectedModel);

                                    $("#x").click(function () {
                                        sendDeleteModel(snapshot.val().parentModelName, room);
                                        drawArrow = false;
                                    });
                                }
                            });
                    });

                    var selectedModel = scene.getObjectByName(internalObject.name);
                    control.detach();
                    control.attach(selectedModel);
                    // control.visible = false;
                    break;
                } else {
                    while (
                        internalObject["type"] != "Scene" &&
                        internalObject["type"] != "Group"
                    ) {
                        internalObject = internalObject.parent;
                    }
                    if (
                        internalObject.type == "Group" &&
                        internalObject.parent.userData.type == "3DModel"
                    ) {
                        $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                        $('.toolbar-btn-trsds').show();
                        $('.toolbar-btn-model').show();
                        $("#disperseBtn").show();

                        $("#x").off("click");
                        var selectedModel = scene.getObjectByName(
                            internalObject.parent.name,
                        );
                        control.detach();
                        control.attach(selectedModel);
                        control.visible = false;

                        $("#x").click(function () {
                            sendDeleteModel(internalObject.parent.name, room);
                            drawArrow = false;
                        });

                        break;
                    }
                }
            }
            if (i == intersects.length - 1) {
                document.addEventListener("mousemove", onDocumentMouseMove, false);
                document.addEventListener("mousedown", onDocumentMouseDown, false);
                document.addEventListener("mouseup", onDocumentMouseUp, false);
                document.addEventListener("mousewheel", onDocumentMouseWheel, false);
                document.addEventListener("mousemove", hoverRaycast);
                $(".toolbar-btn-dynamic").hide();
                $(".toolbar-btn-main").show();
                if (control.object) {
                    control.detach();
                }
            }
        }
    } else {
        var intersectedModel = raycaster.intersectObject(control.object, true);
        if (intersectedModel.length > 0) {
            var intersectedWorld = new THREE.Vector3(
                intersectedModel[0].point.x,
                intersectedModel[0].point.y,
                intersectedModel[0].point.z,
            );
            var intersectedLocal = control.object.worldToLocal(intersectedWorld);
            await sendRoomArrow(
                control.object.name,
                intersectedLocal.x,
                intersectedLocal.y,
                intersectedLocal.z,
                $("#annotate-input").val(),
            );
            drawArrow = false;
            $("#" + selectedTile).css("background-color", "#e7e7e7");
            selectedTile = "";
            selectedTileLink = "";
            textValueForAnnotation = "";
            $("#annotate-input").val("");
            // $("#openAnnotationModal").modal("hide");
            document.getElementById("cursor").style.display = "none";
            document.body.style.cursor = "auto";
            // $("#annotations").attr("src", "/images/annotations.png");
            // $("#annotations").css("background-color", "");
        }
    }
}
$(document).on("click", ".object-img.icon.delete", function (event) {
    sendDeleteModel(event.target.dataset.name, room);
});

document.body.addEventListener("mousemove", (event) => {
    event.preventDefault();
    document.getElementById("cursor").style.left = event.clientX + "px";
    document.getElementById("cursor").style.top = event.clientY + "px";
});

$("#submitAnnotation").click(function (event) {
    event.preventDefault();
    // saveAnnotations(control.object.name);
    // $("#tempDiv").css({ display: "none" });

    drawArrow = true;
    if (drawArrow) {
        $("#openAnnotationModal").modal("hide");
    } else {
        // $("#annotations").attr("src", "/images/annotations.png");
        // $("#annotations").css("background-color", "");
    }
    if (document.getElementById("annotate-checkbox").checked) {
        textValueForAnnotation = document.getElementById("annotate-input").value;
    } else {
        textValueForAnnotation = "";
    }
    document.getElementById("cursor").style.display = "";
    document.getElementById(
        "cursor",
    ).style.background = `url("${selectedTileLink}") no-repeat center center`;
    document.getElementById("cursor").style.backgroundSize = `contain`;
    document.body.style.cursor = "none";
    // $("#annotations").attr("src", "/images/annotationsW.png");
    // $("#annotations").css("background-color", "black");
});

$("#annotate-button").click((event) => {
    const rect = event.target.getBoundingClientRect();
    $("#annotation-modal").css(
        "bottom",
        window.innerHeight - (rect.top + window.scrollY) + "px",
    );
    $("#annotation-modal").css(
        "right",
        window.innerWidth - (rect.left + window.scrollX) + "px",
    );
});

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // labelRenderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame(animate);
    deltaTime = clock2.getDelta();
    totalTime += deltaTime;
    //   updatePhysics();
    update();
    renderer.render(scene, camera);
}

// function updatePhysics() {
//   world.step(1 / 60);
//   parentCamera.position.copy(boxBody.position);
//   parentCamera.position.x = boxBody.position.x;
//   parentCamera.position.y = boxBody.position.y + 1.4;
//   parentCamera.position.z = boxBody.position.z;
// }

function initialiseAudioListener() {
    listener = new THREE.AudioListener();
    camera.add(listener);
}

function makeAvatarsVisible() {
    for (let i = 0; i < scene.children.length; i++) {
        if (scene.children[i].userData.type == 'avatar') {
            scene.children[i].visible = true;
        }
    }
    scene.getObjectByName("assistelem_2021").visible = true;
}

function makeVisibleAfterTeleportation(params) {
    if (!scene.getObjectByName("MainModel").visible) {
        const loaderSky = new THREE.TextureLoader();
        const textureSky = loaderSky.load("/images/sky3.jpg", () => {
            const rt = new THREE.WebGLCubeRenderTarget(textureSky.image.height);
            rt.fromEquirectangularTexture(renderer, textureSky);
            scene.background = rt.texture;
        });
        scene.getObjectByName("MainModel").visible = true;
        renderer.domElement.addEventListener("click", raycast, false);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.physicallyCorrectLights = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        makeAvatarsVisible();
    }
}

function update() {
    const delta = clock.getDelta();
    if (avatarMixer != null) {
        avatarMixer.update(delta);
    }
    for (const mixer of mixers) {
        mixer.update(delta);
    }

    //   camera.position.y = 1.5;

    keyboard.update();

    let translateSpeed = 1; // units per second
    let distance = translateSpeed * deltaTime;
    let rotateSpeed = Math.PI / 4; // radians per second
    let angle = rotateSpeed * deltaTime;

    if (keyboard.isKeyPressed("ArrowUp")) {
        if (syncCross != 0) {
            clearInterval(syncCross);
            syncCross = 0;
            $(".cross.x").removeClass("display");
            $(".cross.x").attr("name", null);
        }
        makeVisibleAfterTeleportation();

        camera.translateZ(-distance);
        camera.position.y = 1.5;
        camera.updateProjectionMatrix();
        database
            .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
            .update({
                px: camera.position.x.toFixed(6),
                py: camera.position.y.toFixed(6),
                pz: camera.position.z.toFixed(6),
                qx: camera.quaternion.x.toFixed(6),
                qy: camera.quaternion.y.toFixed(6),
                qz: camera.quaternion.z.toFixed(6),
                qw: camera.quaternion.w.toFixed(6),
            });
    }

    if (keyboard.isKeyPressed("ArrowDown")) {
        if (syncCross != 0) {
            clearInterval(syncCross);
            syncCross = 0;
            $(".cross.x").removeClass("display");
            $(".cross.x").attr("name", null);
        }
        makeVisibleAfterTeleportation();
        camera.translateZ(distance);
        camera.position.y = 1.5;
        camera.updateProjectionMatrix();
        database
            .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
            .update({
                px: camera.position.x.toFixed(6),
                py: camera.position.y.toFixed(6),
                pz: camera.position.z.toFixed(6),
                qx: camera.quaternion.x.toFixed(6),
                qy: camera.quaternion.y.toFixed(6),
                qz: camera.quaternion.z.toFixed(6),
                qw: camera.quaternion.w.toFixed(6),
            });
    }

    if (keyboard.isKeyPressed("ArrowLeft")) {
        if (syncCross != 0) {
            clearInterval(syncCross);
            syncCross = 0;
            $(".cross.x").removeClass("display");
            $(".cross.x").attr("name", null);
        }
        makeVisibleAfterTeleportation();
        camera.translateX(-distance);
        camera.position.y = 1.5;
        camera.updateProjectionMatrix();
        database
            .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
            .update({
                px: camera.position.x.toFixed(6),
                py: camera.position.y.toFixed(6),
                pz: camera.position.z.toFixed(6),
                qx: camera.quaternion.x.toFixed(6),
                qy: camera.quaternion.y.toFixed(6),
                qz: camera.quaternion.z.toFixed(6),
                qw: camera.quaternion.w.toFixed(6),
            });
    }

    if (keyboard.isKeyPressed("ArrowRight")) {
        if (syncCross != 0) {
            clearInterval(syncCross);
            syncCross = 0;
            $(".cross.x").removeClass("display");
            $(".cross.x").attr("name", null);
        }
        makeVisibleAfterTeleportation();
        camera.translateX(distance);
        camera.position.y = 1.5;
        camera.updateProjectionMatrix();
        database
            .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
            .update({
                px: camera.position.x.toFixed(6),
                py: camera.position.y.toFixed(6),
                pz: camera.position.z.toFixed(6),
                qx: camera.quaternion.x.toFixed(6),
                qy: camera.quaternion.y.toFixed(6),
                qz: camera.quaternion.z.toFixed(6),
                qw: camera.quaternion.w.toFixed(6),
            });
    }

    // if (keyboard.isKeyPressed("R")) {
    //     camera.translateY(distance);
    //     camera.updateProjectionMatrix();
    //     database
    //         .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
    //         .update({
    //             px: camera.position.x.toFixed(6),
    //             py: camera.position.y.toFixed(6),
    //             pz: camera.position.z.toFixed(6),
    //             qx: camera.quaternion.x.toFixed(6),
    //             qy: camera.quaternion.y.toFixed(6),
    //             qz: camera.quaternion.z.toFixed(6),
    //             qw: camera.quaternion.w.toFixed(6),
    //         });
    // }

    // if (keyboard.isKeyPressed("F")) {
    //     camera.translateY(-distance);
    //     camera.updateProjectionMatrix();
    //     database
    //         .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
    //         .update({
    //             px: camera.position.x.toFixed(6),
    //             py: camera.position.y.toFixed(6),
    //             pz: camera.position.z.toFixed(6),
    //             qx: camera.quaternion.x.toFixed(6),
    //             qy: camera.quaternion.y.toFixed(6),
    //             qz: camera.quaternion.z.toFixed(6),
    //             qw: camera.quaternion.w.toFixed(6),
    //         });
    // }

    // if (keyboard.isKeyPressed("Q")) {
    //     camera.rotateY(angle);
    //     camera.updateProjectionMatrix();
    //     database
    //         .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
    //         .update({
    //             px: camera.position.x.toFixed(6),
    //             py: camera.position.y.toFixed(6),
    //             pz: camera.position.z.toFixed(6),
    //             qx: camera.quaternion.x.toFixed(6),
    //             qy: camera.quaternion.y.toFixed(6),
    //             qz: camera.quaternion.z.toFixed(6),
    //             qw: camera.quaternion.w.toFixed(6),
    //         });
    // }

    // if (keyboard.isKeyPressed("E")) {
    //     camera.rotateY(-angle);
    //     camera.updateProjectionMatrix();
    //     database
    //         .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
    //         .update({
    //             px: camera.position.x.toFixed(6),
    //             py: camera.position.y.toFixed(6),
    //             pz: camera.position.z.toFixed(6),
    //             qx: camera.quaternion.x.toFixed(6),
    //             qy: camera.quaternion.y.toFixed(6),
    //             qz: camera.quaternion.z.toFixed(6),
    //             qw: camera.quaternion.w.toFixed(6),
    //         });
    // }

    // if (keyboard.isKeyPressed("T")) {
    //     camera.rotateX(angle);
    //     camera.updateProjectionMatrix();
    //     database
    //         .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
    //         .update({
    //             px: camera.position.x.toFixed(6),
    //             py: camera.position.y.toFixed(6),
    //             pz: camera.position.z.toFixed(6),
    //             qx: camera.quaternion.x.toFixed(6),
    //             qy: camera.quaternion.y.toFixed(6),
    //             qz: camera.quaternion.z.toFixed(6),
    //             qw: camera.quaternion.w.toFixed(6),
    //         });
    // }

    // if (keyboard.isKeyPressed("G")) {
    //     camera.rotateX(-angle);
    //     camera.updateProjectionMatrix();
    //     database
    //         .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
    //         .update({
    //             px: camera.position.x.toFixed(6),
    //             py: camera.position.y.toFixed(6),
    //             pz: camera.position.z.toFixed(6),
    //             qx: camera.quaternion.x.toFixed(6),
    //             qy: camera.quaternion.y.toFixed(6),
    //             qz: camera.quaternion.z.toFixed(6),
    //             qw: camera.quaternion.w.toFixed(6),
    //         });
    // }
}

function sendUID(uid, username, screen, video) {
    // user_id, displayName + "-(Screen)", "true", "false"
    if (screen == "true") {                                 // when user is sharing his/her own screen along with normal communication
        database.ref("currentUsers/" + uid).set({
            screen: screen,
            video: video,
            name: username,
            photo: photoURL,
            room: room,
            f_uid: uid_firebase,
            tvID: control.object.name,
        },
            function (error) {
                if (error) {
                    // console.log(error);
                } else {
                    // console.log("user details added on firebase");
                }
            },
        );
    } else {
        database.ref("currentUsers/" + uid).set({
            screen: screen,
            video: video,
            name: username,
            photo: photoURL,
            f_uid: uid_firebase,
            room: room,
        },
            function (error) {
                if (error) {
                    // console.log(error);
                } else {
                    // console.log("user details added on firebase");
                }
            },
        );
    }
}

function sendStatus(modelName, status) {
    database.ref("rooms/" + room + "/" + modelName).update({
        status: status,
    });
}

function sendPage(modelName, num) {
    database.ref("rooms/" + room + "/" + modelName).update({
        currentPage: num.toString(),
    });
}

function loadImage(url, px, py, pz, qx, qy, qz, qw, sx, sy, sz, fileName, fileType, callback) {
    let textureImage = new THREE.TextureLoader().load(url);
    let geomImage = new THREE.PlaneGeometry(0.36, 0.2);
    let materialImage = new THREE.MeshBasicMaterial({
        map: textureImage,
        side: THREE.DoubleSide,
    });
    let meshImage = new THREE.Mesh(geomImage, materialImage);
    meshImage.name = fileName;
    if (fileName == "assistelem_2021") {
        let imageCustomData = { type: "assistelem", url: "" };
        meshImage.userData = imageCustomData;
    }
    else {
        let imageCustomData = { type: "image", url: "" };
        meshImage.userData = imageCustomData;
    }
    scene.add(meshImage);
    meshImage.position.x = px;
    meshImage.position.y = py;
    meshImage.position.z = pz;
    meshImage.quaternion.x = qx;
    meshImage.quaternion.y = qy;
    meshImage.quaternion.z = qz;
    meshImage.quaternion.w = qw;
    meshImage.scale.set(sx, sy, sz);
    callback();
}

function pinScreen(uid, object) {
    if (object.parent.type != "Scene") {
        scene.add(object);
        var avatarObject = scene.getObjectByName(uid);
        object.applyQuaternion(avatarObject.quaternion);
        object.scale.set(5, 5, 5);
        object.position.set(
            avatarObject.position.x - 1.5,
            avatarObject.position.y,
            avatarObject.position.z,
        );
        object.quaternion.set(0, 0, 0, 1);
    }

    // let cwd = new THREE.Vector3();
    // parentCamera.getWorldDirection(cwd);
    // cwd.multiplyScalar(-0.3);
    // cwd.add(parentCamera.position);
    // let texture_screen = new THREE.VideoTexture(
    //   document.getElementById("remoteVideo" + uid)
    // );
    // texture_screen.wrapS = THREE.RepeatWrapping;
    // texture_screen.repeat.x = -1;
    // let geometry_screen = new THREE.PlaneGeometry(0.3, 0.2);
    // let material_screen = new THREE.MeshBasicMaterial({
    //   map: texture_screen,
    //   side: THREE.DoubleSide,
    // });
    // let mesh_screen = new THREE.Mesh(geometry_screen, material_screen);
    // mesh_screen.name = "ajnaxBig" + uid;
    // let screenCustomData = { type: "ajnax", id: uid };
    // mesh_screen.userData = screenCustomData;
    // mesh_screen.applyQuaternion(parentCamera.quaternion);
    // mesh_screen.position.set(cwd.x, cwd.y, cwd.z);
    // parentCamera.attach(mesh_screen);
}

function unpinScreen(uid, object) {
    var avatarObject = scene.getObjectByName(uid);
    object.scale.set(0.5, 0.5, 0.5);
    object.position.set(0.15, 0, 0);
    avatarObject.add(object);
}

function saveAnnotations(name) {
    var today = new Date();

    var objectKey = name + "-" + today.getFullYear() + today.getMonth() + 1 + today.getDate() + today.getHours() + today.getMinutes() + today.getSeconds();
    database.ref("rooms/" + room + "/" + name).once("value", function (snapshot) {
        if (snapshot.exists()) {
            database
                .ref("storageinfo/" + uid_firebase + "/snapshotData/" + objectKey)
                .set(snapshot.val(), function (error) {
                    if (error) {
                        alert(error);
                    } else { }
                })
                .then(() => {
                    listScreenshots();
                    swal(
                        "Success",
                        "Annotation Data has been saved in your account.",
                        "success",
                    ).catch(swal.noop);
                });
        }
    });
}

function loadAnnotatedFile(fileName) {
    var objectKey = fileName.split("-")[0];
    database
        .ref("storageinfo/" + uid_firebase + "/snapshotData/" + fileName)
        .once("value", function (snapshot) {
            if (snapshot.exists()) {
                database
                    .ref("rooms/" + room + "/" + objectKey)
                    .set(snapshot.val(), function (error) {
                        if (error) {
                            alert(error);
                        } else {
                            console.log("SuccessFully Loaded!!");
                        }
                    });
            }
        });
}

function grabFrame(mediastream) {
    // let uid = control.object.userData.id;
    // let pinnedScreenObjName = control.object.name;
    var imageCapture = new ImageCapture(mediastream.getVideoTracks()[0]);
    imageCapture
        .grabFrame()
        .then((imageBitmap) => {
            drawCanvas(imageBitmap);
            //   control.detach();
            //   parentCamera.remove(scene.getObjectByName(pinnedScreenObjName));
        })
        .catch((error) => console.log(error));
}

function drawCanvas(img) {
    // var avatarObject = scene.getObjectByName(uid.toString());
    canvasWidth = 1920;
    canvasHeight = 1080;
    let ratio = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    let x = (canvasWidth - img.width * ratio) / 2;
    let y = (canvasHeight - img.height * ratio) / 2;

    var newCanvas = document.createElement("canvas");
    newCanvas.width = canvasWidth;
    newCanvas.height = canvasHeight;
    newCanvas.getContext("2d").clearRect(0, 0, canvasWidth, canvasHeight);
    newCanvas
        .getContext("2d")
        .drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            x,
            y,
            img.width * ratio,
            img.height * ratio,
        );
    var today = new Date();
    var fileId =
        "snapshot_" +
        today.getFullYear() +
        today.getMonth() +
        1 +
        today.getDate() +
        today.getHours() +
        today.getMinutes() +
        today.getSeconds();
    var fileName = fileId + ".png";
    var strMime = "image/png";
    var metadata = {
        contentType: strMime,
    };
    newCanvas.toBlob(function (blob) {
        var uploadTask = storageRef
            .child(uid_firebase + "/snapshots/" + fileName)
            .put(blob, metadata);
        uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            function (snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = parseInt(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                );
                // progress += "%";
                // $("#model_load_bar_container").show();
                // $("#model_load_bar").css("width", progress);
                // $('#model_load_bar_percent').text(progress);
                // console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');
            },
            function (error) {
                console.log(error);
            },
            function () {
                // Upload completed successfully
                // $("#model_load_bar").css("width", "0%");
                // $('#model_load_bar_percent').text("0%");
                // $("#model_load_bar_container").hide();
                // console.log('Upload Completed');
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    database.ref("rooms/" + room + "/assistelem_2021").update({
                        url: downloadURL
                    });
                    // console.log('File available at', downloadURL);
                    // console.log(downloadURL);
                    // var cwd = new THREE.Vector3();
                    // camera.getWorldDirection(cwd);
                    // cwd.multiplyScalar(0.3);
                    // cwd.add(camera.position);
                    // var tempX = cwd.x + 2;
                    // if (tempCheckSS.includes(tempX)) {
                    //     var tempX = tempCheckSS[tempCheckSS.length - 1] + 2;
                    // }
                    // tempCheckSS.push(tempX);
                    // sendModel(
                    //     downloadURL,
                    //     tempX,
                    //     cwd.y,
                    //     cwd.z,
                    //     camera.quaternion.x,
                    //     camera.quaternion.y,
                    //     camera.quaternion.z,
                    //     camera.quaternion.w,
                    //     1,
                    //     1,
                    //     1,
                    //     fileId,
                    //     "ajnaxstream",
                    //     room,
                    // );
                    $('.loadingDiv').hide();
                    swal(
                        "Captured Snapshot!!..",
                        "Captured Snapshot has been added to your object List.",
                        "success",
                    ).catch(swal.noop);
                });
            },
        );
    });

    //   For downloading to local...........
    // var strDownloadMime = "image/octet-stream";
    // var imgData = newCanvas.toDataURL(strMime);
    // var base64str = imgData.replace(strMime, strDownloadMime);
    // console.log(imgData);
    // console.log(base64str);
    // var link = document.createElement('a');
    // if (typeof link.download === 'string') {
    //     document.body.appendChild(link); //Firefox requires the link to be in the body
    //     link.download = fileName;
    //     link.href = base64str;
    //     console.log(link.href);
    //     link.click();
    //     document.body.removeChild(link); //remove the link when done
    // } else {
    //     window.location.replace(uri);
    // }
}

function loadVideo(url, px, py, pz, qx, qy, qz, qw, sx, sy, sz, fileName) {
    var filename = fileName;
    var videoElem = document.createElement("video");
    videoElem.id = filename;
    videoElem.crossOrigin = "anonymous";
    videoElem.src = url;
    videoElem.load(); // must call after setting/changing source
    videoElem.style.display = "none";
    // videoElem.ontimeupdate = function () {
    // 	console.log(videoElem.currentTime);
    // 	database.ref('rooms/' + room + '/' + fileName).update(
    // 		{
    // 			currentSeek: videoElem.currentTime
    // 		}
    // 	);
    // };

    var textureVideoElem = new THREE.VideoTexture(videoElem);
    var geometryVideoElem = new THREE.PlaneGeometry(0.36, 0.2);
    var materialVideoElem = new THREE.MeshBasicMaterial({
        map: textureVideoElem,
        side: THREE.DoubleSide,
    });
    var meshVideoElem = new THREE.Mesh(geometryVideoElem, materialVideoElem);
    meshVideoElem.name = filename.toString();
    var videoCustomData = { type: "video" };
    meshVideoElem.userData = videoCustomData;
    scene.add(meshVideoElem);
    meshVideoElem.position.x = px;
    meshVideoElem.position.y = py;
    meshVideoElem.position.z = pz;
    meshVideoElem.quaternion.x = qx;
    meshVideoElem.quaternion.y = qy;
    meshVideoElem.quaternion.z = qz;
    meshVideoElem.quaternion.w = qw;
    meshVideoElem.scale.set(sx, sy, sz);
    document.body.appendChild(videoElem);
}

function loadDoc(url, px, py, pz, qx, qy, qz, qw, sx, sy, sz, pn, fileName) {
    // $('#next').show();
    // $('#previous').show();
    // $('.zoomVideoRow').css("margin-bottom","0px");
    var canvasDoc = document.createElement("canvas");
    canvasDoc.id = fileName;
    canvasDoc.style.display = "none";
    var textureDoc = new THREE.CanvasTexture(canvasDoc);
    var geometryDoc = new THREE.PlaneGeometry(0.2, 0.3);
    var materialDoc = new THREE.MeshBasicMaterial({ map: textureDoc });
    var meshDoc = new THREE.Mesh(geometryDoc, materialDoc);
    meshDoc.name = fileName;

    var docCustomData = { type: "doc" };
    meshDoc.userData = docCustomData;
    scene.add(meshDoc);
    meshDoc.position.x = px;
    meshDoc.position.y = py;
    meshDoc.position.z = pz;
    meshDoc.quaternion.x = qx;
    meshDoc.quaternion.y = qy;
    meshDoc.quaternion.z = qz;
    meshDoc.quaternion.w = qw;
    meshDoc.scale.set(sx, sy, sz);
    document.body.appendChild(canvasDoc);
    pdfjsLib.getDocument(url).promise.then(function (pdf) {
        meshDoc.userData["pdfObject"] = pdf;
        meshDoc.userData["currentPage"] = pn;
        currentPdfObject = pdf;
        renderPage(fileName, pn + 1);
    });
}

function renderPage(file, num) {
    scene
        .getObjectByName(file)
        .userData.pdfObject.getPage(num)
        .then(function (page) {
            var scale = 3;
            var viewport = page.getViewport({ scale: scale });

            // Prepare canvas using PDF page dimensions
            var canvasElem = document.getElementById(file);
            var context = canvasElem.getContext("2d");
            canvasElem.height = viewport.height;
            canvasElem.width = viewport.width;

            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            var renderTask = page.render(renderContext);

            renderTask.promise.then(function () {
                var canvasMesh = scene.getObjectByName(file);
                canvasMesh.material.map = new THREE.CanvasTexture(canvasElem);
                canvasMesh.material.needsUpdate = true;
            });
        });
}

function sendModel(path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, name, fileType, room) {
    var today = new Date();
    var characterName = name + "_" + uid_firebase;
    var modelName =
        name +
        "_" +
        today.getFullYear() +
        today.getMonth() +
        1 +
        today.getDate() +
        today.getHours() +
        today.getMinutes() +
        today.getSeconds();
    if (docSupportedFormats.includes(fileType.toLowerCase())) {
        database.ref("rooms/" + room + "/" + modelName).set({
            url: path1,
            px: px.toFixed(6),
            py: py.toFixed(6),
            pz: pz.toFixed(6),
            qx: qx.toFixed(6),
            qy: qy.toFixed(6),
            qz: qz.toFixed(6),
            qw: qw.toFixed(6),
            sx: sx.toFixed(6),
            sy: sy.toFixed(6),
            sz: sz.toFixed(6),
            currentPage: "0",
            modelName: modelName,
            fileType: fileType,
        },
            function (error) {
                if (error) {
                    // console.log(error);
                } else {
                    // console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
                }
            },
        );
    } else if (videoSupportedFormats.includes(fileType.toLowerCase())) {
        database.ref("rooms/" + room + "/" + modelName).set({
            url: path1,
            px: px.toFixed(6),
            py: py.toFixed(6),
            pz: pz.toFixed(6),
            qx: qx.toFixed(6),
            qy: qy.toFixed(6),
            qz: qz.toFixed(6),
            qw: qw.toFixed(6),
            sx: sx.toFixed(6),
            sy: sy.toFixed(6),
            sz: sz.toFixed(6),
            status: "0",
            modelName: modelName,
            fileType: fileType,
        },
            function (error) {
                if (error) {
                    // console.log(error);
                } else {
                    // console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
                }
            },
        );
    } else if (imageSupportedFormats.includes(fileType.toLowerCase())) {
        if (fileType == "ajnaxstream") {
            database.ref("rooms/" + room + "/" + name).set({
                url: path1,
                px: px.toFixed(6),
                py: py.toFixed(6),
                pz: pz.toFixed(6),
                qx: qx.toFixed(6),
                qy: qy.toFixed(6),
                qz: qz.toFixed(6),
                qw: qw.toFixed(6),
                sx: sx.toFixed(6),
                sy: sy.toFixed(6),
                sz: sz.toFixed(6),
                arrowCount: "0",
                nextArrowCount: arrowCounter.toString(),
                modelName: name,
                fileType: fileType,
            },
                function (error) {
                    if (error) {
                        // console.log(error);
                    } else {
                        // console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
                    }
                },
            );
        } else if (fileType == "assistelem") {
            database.ref("rooms/" + room + "/assistelem_2021").set({
                url: path1,
                px: px.toFixed(6),
                py: py.toFixed(6),
                pz: pz.toFixed(6),
                qx: qx.toFixed(6),
                qy: qy.toFixed(6),
                qz: qz.toFixed(6),
                qw: qw.toFixed(6),
                sx: sx.toFixed(6),
                sy: sy.toFixed(6),
                sz: sz.toFixed(6),
                arrowCount: "0",
                nextArrowCount: arrowCounter.toString(),
                modelName: "assistelem_2021",
                fileType: fileType,
            },
                function (error) {
                    if (error) {
                        // console.log(error);
                    } else {
                        // console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
                    }
                },
            );

        } else {
            database.ref("rooms/" + room + "/" + modelName).set({
                url: path1,
                px: px.toFixed(6),
                py: py.toFixed(6),
                pz: pz.toFixed(6),
                qx: qx.toFixed(6),
                qy: qy.toFixed(6),
                qz: qz.toFixed(6),
                qw: qw.toFixed(6),
                sx: sx.toFixed(6),
                sy: sy.toFixed(6),
                sz: sz.toFixed(6),
                arrowCount: "0",
                nextArrowCount: arrowCounter.toString(),
                modelName: modelName,
                fileType: fileType,
            },
                function (error) {
                    if (error) {
                        // console.log(error);
                    } else {
                        // console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
                    }
                },
            );
        }
    } else if (fileType == "avatar") {
        database.ref("rooms/" + room + "/" + characterName).set({
            url: path1,
            px: px.toFixed(6),
            py: py.toFixed(6),
            pz: pz.toFixed(6),
            qx: qx.toFixed(6),
            qy: qy.toFixed(6),
            qz: qz.toFixed(6),
            qw: qw.toFixed(6),
            sx: sx.toFixed(6),
            sy: sy.toFixed(6),
            sz: sz.toFixed(6),
            uid: uid_firebase,
            modelName: characterName,
            fileType: fileType,
        },
            function (error) {
                if (error) {
                    // console.log(error);
                } else {
                    // console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
                }
            },
        );
    } else if (fileType == "TV") {
        database.ref("rooms/" + room + "/" + modelName).set({
            url: path1,
            px: px.toFixed(6),
            py: py.toFixed(6),
            pz: pz.toFixed(6),
            qx: qx.toFixed(6),
            qy: qy.toFixed(6),
            qz: qz.toFixed(6),
            qw: qw.toFixed(6),
            sx: sx.toFixed(6),
            sy: sy.toFixed(6),
            sz: sz.toFixed(6),
            modelName: modelName,
            fileType: fileType,
        },
            function (error) {
                if (error) {
                    // console.log(error);
                } else {
                    // console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
                }
            },
        );
    } else if (fileType == "assistElem") {
        database.ref("rooms/" + room + "/" + name).set({
            url: path1,
            px: px.toFixed(6),
            py: py.toFixed(6),
            pz: pz.toFixed(6),
            qx: qx.toFixed(6),
            qy: qy.toFixed(6),
            qz: qz.toFixed(6),
            qw: qw.toFixed(6),
            sx: sx.toFixed(6),
            sy: sy.toFixed(6),
            sz: sz.toFixed(6),
            arrowCount: "0",
            nextArrowCount: arrowCounter.toString(),
            modelName: name,
            fileType: fileType,
        },
            function (error) {
                if (error) {
                    // console.log(error);
                } else {
                    // console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
                }
            },
        );

    } else {
        database.ref("rooms/" + room + "/" + modelName).set({
            url: path1,
            px: px.toFixed(6),
            py: py.toFixed(6),
            pz: pz.toFixed(6),
            qx: qx.toFixed(6),
            qy: qy.toFixed(6),
            qz: qz.toFixed(6),
            qw: qw.toFixed(6),
            sx: sx.toFixed(6),
            sy: sy.toFixed(6),
            sz: sz.toFixed(6),
            arrowCount: "0",
            nextArrowCount: arrowCounter.toString(),
            modelName: modelName,
            dispersed: "false",
            fileType: fileType,
        },
            function (error) {
                if (error) {
                    // console.log(error);
                } else {
                    // console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
                }
            },
        );
    }
}

function sendAvatar(path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, displayname, uidagora, room) {
    var characterName = displayname + "_" + uid_firebase;
    database.ref("rooms/" + room + "/" + characterName).set({
        url: path1,
        px: px.toFixed(6),
        py: py.toFixed(6),
        pz: pz.toFixed(6),
        qx: qx.toFixed(6),
        qy: qy.toFixed(6),
        qz: qz.toFixed(6),
        qw: qw.toFixed(6),
        sx: sx.toFixed(6),
        sy: sy.toFixed(6),
        sz: sz.toFixed(6),
        uid: uid_firebase,
        agoraId: uidagora.toString(),
        modelName: characterName,
        fileType: "avatar",
    },
        function (error) {
            if (error) {
                // console.log(error);
            } else {
                // console.log("success");
            }
        },
    );
}

function sendDeleteModel(model, room) {
    database.ref("rooms/" + room + "/" + model).remove();
}

async function sendRoomArrow(parentModel, px, py, pz, annoText) {
    let urlPath = await storageRef
        .child("annotations/models")
        .child(selectedTile + ".glb")
        .getDownloadURL();
    var arrowPos = {
        annot: annoText,
        px: px.toFixed(6),
        py: py.toFixed(6),
        pz: pz.toFixed(6),
        annotModelUrl: urlPath,
    };
    console.log("Sending arrow function");
    database
        .ref("rooms/" + room + "/" + parentModel)
        .once("value", (snapshot) => {
            var arrow_name = "annot" + snapshot.val().arrowCount;
            // database.ref('/rooms/' + room + '/' +parentModel+ '/'+arrow_name).set(arrowPos);
            var arrowObject = {};
            arrowObject["arrowCount"] = (parseInt(snapshot.val().arrowCount) + 1).toString();
            arrowObject["nextArrowCount"] = (arrowCounter + 1).toString();
            arrowObject[arrow_name] = arrowPos;
            database.ref("/rooms/" + room + "/" + parentModel).update(arrowObject);
        });
}

function removeRoomArrows(parentModel) {
    database
        .ref("rooms/" + room + "/" + parentModel)
        .once("value", (snapshot) => {
            var parentCount = parseInt(snapshot.val().arrowCount);
            var removeObject = {};
            for (var i = 0; i < parentCount; i++) {
                removeObject["annot" + i] = null;
            }
            removeObject["arrowCount"] = "0";
            removeObject["nextArrowCount"] = (arrowCounter - parentCount).toString();
            database.ref("/rooms/" + room + "/" + parentModel).update(removeObject);
        });
}

async function screenShare() {

    rtc.screenClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    // rtc.screenClient.on("user-published", handleUserPublished);
    rtc.screenClient.setClientRole("host");
    const user_id = await rtc.screenClient.join(option.appID, option.channel, option.token, null);
    localStreamList.push(user_id);
    rtc.params.suid = user_id;

    sendUID(user_id, displayName + "-(Screen)", "true", "false");

    rtc.localTracks.screenTrack = await AgoraRTC.createScreenVideoTrack();
    await rtc.screenClient.publish(rtc.localTracks.screenTrack).then(() => {
        console.log("Screenshare success");
    });
}

function getImage(fileType) {
    if (imageSupportedFormats.includes(fileType.toLowerCase())) {
        return "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png";
    } else if (videoSupportedFormats.includes(fileType.toLowerCase())) {
        return "https://static.thenounproject.com/png/1813969-200.png";
    } else if (docSupportedFormats.includes(fileType.toLowerCase())) {
        return "https://static.thenounproject.com/png/2887858-200.png";
    } else {
        return "https://static.thenounproject.com/png/997223-200.png";
    }
}

function changeBG() {
    scene.background = new THREE.TextureLoader().load(this.src);
    $("#bg_img_modal").modal("hide");
}

function createRemoteMedia(user, mediaType) {
    const uid = user.uid;

    database.ref("currentUsers/" + uid.toString()).once("value", function (snapshot) {
        // addToParticipantsList(snapshot.val().name, snapshot.val().photo, uid);

        if (snapshot.val().video == "true" || snapshot.val().ajnax == "true") {
            if (mediaType === 'video') {
                // teleport-icon
                $("#" + uid + "-tel-icon").css("display", "block");
                var velem = document.createElement("video");
                velem.setAttribute("id", "remoteVideo" + uid);
                velem.setAttribute("muted", "muted");
                velem.style.display = "none";
                velem.muted = "true";
                velem.srcObject = new MediaStream([user.videoTrack.getMediaStreamTrack()]);
                document.body.appendChild(velem);
                velem.play();
            }
            if (mediaType === 'audio') {
                var aelem = document.createElement("audio");
                aelem.setAttribute("id", "remoteAudio" + uid);
                aelem.style.display = "none";
                aelem.srcObject = new MediaStream([user.audioTrack.getMediaStreamTrack()])
                document.body.appendChild(aelem);
                aelem.play();
            }
        } else if (snapshot.val().screen == "true") {
            let tvVideoElem = document.getElementById(snapshot.val().tvID);
            if (tvVideoElem) {
                tvVideoElem.pause();
            }
            if (mediaType === 'video') {
                var velem = document.createElement("video");
                velem.setAttribute("id", "remoteVideo" + uid);
                velem.style.display = "none";
                velem.srcObject = new MediaStream([user.videoTrack.getMediaStreamTrack()])
                document.body.appendChild(velem);
                velem.play();
                console.log("Screensharing is on");
                var tvObject = scene.getObjectByName(snapshot.val().tvID);
                tvObject.material.map = new THREE.VideoTexture(velem);
                tvObject.material.needsUpdate = true;
            }

        }
    });

}

async function handleUserPublished(user, mediaType) {
    console.log("************User Published****************");
    console.log("USER PUBLISHED", user, mediaType);
    const id = user.uid;
    await rtc.client.subscribe(user, mediaType).then(() => {
        if (remoteStreamList.includes(id + mediaType)) {
            // change audio/video status of remote user here.
            if (mediaType === "audio") {
                $("#remote_participant_" + id + " i").addClass("fa-microphone").removeClass("fa-microphone-slash");
                // for remote avatar..
                var iconMesh = scene.getObjectByName(id + "audiostat");
                if (iconMesh) {
                    iconMesh.material.map = new THREE.TextureLoader().load("/images/mic_on.png");
                    iconMesh.material.needsUpdate = true;
                }
                document.getElementById("remoteAudio" + id).srcObject = new MediaStream([user.audioTrack.getMediaStreamTrack()]);
                document.getElementById("remoteAudio" + id).play();
            }
            if (mediaType == "video") {
                document.getElementById("remoteVideo" + id).srcObject = new MediaStream([user.videoTrack.getMediaStreamTrack()]);
                // teleport-icon
                $("#" + id + "-tel-icon").css("display", "block");
                document.getElementById("remoteVideo" + id).play();
            }

        }
        else {
            // create audio/video element of remote user...
            createRemoteMedia(user, mediaType);
            remoteStreamList.push(id + mediaType);
        }
    });


}

function handleUserUnpublished(user, mediaType) {
    const id = user.uid;
    // for changing remote user's audio status
    if (mediaType === "audio") {
        $("#remote_participant_" + id + " i").addClass("fa-microphone-slash").removeClass("fa-microphone");
        // for remote avatar
        var iconMesh = scene.getObjectByName(id + "audiostat");
        if (iconMesh) {
            iconMesh.material.map = new THREE.TextureLoader().load("/images/mic_off.png");
            iconMesh.material.needsUpdate = true;
        }
        document.getElementById("remoteAudio" + id).srcObject = null;
    }

    // for changing remote user's video status
    if (mediaType === "video") {
        // teleport-icon
        $("#" + id + "-tel-icon").css("display", "none");
        document.getElementById("remoteVideo" + id).srcObject = null;
    }
}

function handleUserLeft(user, reason) {
    $("#remote_participant_" + user.uid).remove();
    $("#people_" + user.uid.toString()).remove();
    $("#remoteVideo" + user.uid.toString()).remove();
    $("#remoteAudio" + user.uid.toString()).remove();
    indexList = [];
    if (remoteStreamList.includes(user.uid + "audio")) {
        indexList.push(remoteStreamList.indexOf(user.uid + "audio"))
    }

    if (remoteStreamList.includes(user.uid + "video")) {
        indexList.push(remoteStreamList.indexOf(user.uid + "video"))
    }

    indexList.sort(function (a, b) { return a - b });
    // removing remote user's media ids from local list..
    for (var i = indexList.length - 1; i >= 0; i--) {
        remoteStreamList.splice(indexList[i], 1);
    }

    if (scene.getObjectByName(user.uid.toString())) {
        scene.remove(scene.getObjectByName(user.uid.toString()));
        scene.remove(scene.getObjectByName(user.uid));
    }

    if (user.reason == "BecomeAudience") {
        scene.remove(scene.getObjectByName(user.uid));
    }
    if (control.object && control.object.userData.type == "screen") {
        control.detach();
    }

}

async function joinRTC() {

    rtc.client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    rtc.client.setClientRole("host");

    rtm.client = AgoraRTM.createInstance(option.appID);
    rtm.channel = rtm.client.createChannel(option.channel);
    rtm.channel.on("ChannelMessage", ({ text }, senderId) => {
        // text: text of the received channel message; senderId: user ID of the sender.
        /* Your code for handling events, such as receiving a channel message. */
        database
            .ref("currentUsers/" + senderId.toString())
            .once("value", function (snapshot) {
                toastr["info"]("New message from " + snapshot.val().name, "", {
                    positionClass: "toast-bottom-left",
                });
                playSound(
                    "https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/audioFiles%2Fmessage.mp3?alt=media&token=e61cc1aa-43b1-4217-92c2-d5fe9f9195de",
                );
                $(".chat_list").append(
                    '<div style="transform: translateX(20px);">\
                    <div class="col-md-12 chat-message ip">\
                    <div><img src="' +
                    snapshot.val().photo +
                    '" alt="Avatar" height="25px" width="25px" class="img-circle pull-left avatar"> &nbsp;\
                            <span aria-hidden="true"><b>' + snapshot.val().name + "</b></span></div>" +
                    '<div class="message-bg">' +
                    '<div class="pull-left col-md-9 alert alert-info alert-dismissible receivedMsgDiv" role="alert">'
                    + text +
                    '</div>\
                        </div>\
                        <div class="col-md-3"></div><div class="timestamp">' + moment().calendar() + '</div>\
                    </div>\
                </div>',
                );
                $(".chat_body_div")[0].scrollTop = $(".chat_body_div")[0].scrollHeight;
            });
    });

    // Add an event listener to play remote tracks when remote user publishes.
    rtc.client.on("user-published", handleUserPublished);
    rtc.client.on("user-unpublished", handleUserUnpublished);
    rtc.client.on("user-left", handleUserLeft);

    try {
        const user_id = await rtc.client.join(option.appID, option.channel, option.token, null);
        localStreamList.push(user_id);

        rtc.params.vuid = user_id;
        sendUID(user_id, displayName, "false", "true");
        // startSpeechRecognition(uidserver);
        detectWebcam(async function (hasWebcam) {
            console.log('Webcam: ' + hasWebcam);
            if (hasWebcam) {
                rtc.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                rtc.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({ encoderConfig: "1080p_2", });
                console.log("rtc.localTracks", rtc.localTracks.audioTrack, rtc.localTracks.videoTrack);
                var localVideoElem = document.createElement("video");
                localVideoElem.setAttribute("id", "remoteVideolocalVideo");
                localVideoElem.srcObject = new MediaStream([rtc.localTracks.videoTrack.getMediaStreamTrack()]);
                localVideoElem.style.display = "none";
                document.body.appendChild(localVideoElem);
                localVideoElem.muted = "true";

                try {
                    await rtc.client.setClientRole("host");
                    await rtc.client.publish([rtc.localTracks.audioTrack, rtc.localTracks.videoTrack]).then(() => {
                        document.getElementById("muteAudio").addEventListener("click", muteAudio);
                        document.getElementById("muteVideo").addEventListener("click", muteVideo);
                        $("#muteAudio").click();
                        $("#muteVideo").click();
                        console.log("publish success");
                        startTime = new Date();
                    });
                } catch (e) {
                    console.log("publish failed", e);
                }

            } else {
                rtc.localTracks.audioTrack = AgoraRTC.createMicrophoneAudioTrack();
                try {
                    await client.setClientRole("host");
                    await rtc.client.publish(rtc.localTracks.audioTrack).then(() => {
                        document.getElementById("muteAudio").addEventListener("click", muteAudio);
                        console.log("publish success");

                    });
                } catch (e) {
                    console.log("publish failed", e);
                }
            }

        });
        sendAvatar("https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/qTubeZIRTRTY1oS67pwqNhv3cCJ2%2FavatarFinal.glb?alt=media&token=bc8cd846-5da1-4283-a42f-cc0774fdfdab", 0, 1.5, 0, 0, 0, 0, 0, 10, 10, 10, displayName, user_id, room);

        // using agora for chat
        rtm.client.login({ token: option.token, uid: String(user_id) }).then(() => {
            console.log('AgoraRTM client login success');
            rtm.channel.join().then(() => {
                console.log('AgoraRTM client join success');
                // Adding in participants list
                $("#participants_div ul").append(
                    '<li id="local_participant">\
                        <div class="media">\
                            <div class="picture custom-bg-blue3">\
                                <img src="' + photoURL + '" alt="Avatar" height="35px" width="35px" class="img-circle pull-left avatar">\
                            </div>\
                        </div>\
                        <div class="info">\
                            <span class="name">You</span>\
                        </div>\
                        <div class="controls">\
                            <a href="#"><i class="fas fa-microphone"></i></a>\
                        </div>\
                    </li>',
                );
                // console.log("Particpand added +++++++++++++++++++++++++++++");
            })
                .catch((error) => {
                    alert("Unable to join the channel");
                });
        })
            .catch((err) => {
                // console.log('AgoraRTM client login failure', err);
            });
    } catch (error) {
        console.log("join failed", error);
    }

}

function connect() {

    joinRTC();

    //firebase events..........
    database.ref("rooms/" + room).on("child_added", (snapshot) => {
        console.log("-----------client received and loading model-------------");
        console.log(snapshot, snapshot.val());

        // event listener for removing individual annotations..
        database.ref("rooms/" + room + "/" + snapshot.val().modelName).on("child_removed", (snapann) => {
            console.log("Annotation Removed");
            console.log(snapann.key + snapshot.val().modelName);
            const removeObject = scene.getObjectByName(snapann.key + snapshot.val().modelName);
            removeObject?.parent.remove(removeObject);
            arrowCounter = arrowCounter - 1;
        });
        if (imageSupportedFormats.includes(snapshot.val().fileType.toLowerCase())) {
            //loadImage
            loadImage(
                snapshot.val().url,
                parseFloat(snapshot.val().px),
                parseFloat(snapshot.val().py),
                parseFloat(snapshot.val().pz),
                parseFloat(snapshot.val().qx),
                parseFloat(snapshot.val().qy),
                parseFloat(snapshot.val().qz),
                parseFloat(snapshot.val().qw),
                parseFloat(snapshot.val().sx),
                parseFloat(snapshot.val().sy),
                parseFloat(snapshot.val().sz),
                snapshot.val().modelName,
                snapshot.val().fileType,
                function () {
                    var totalArrowLoaded = parseInt(snapshot.val().arrowCount);
                    if (totalArrowLoaded > 0) {
                        var i;
                        for (i = 0; i < totalArrowLoaded; i++) {
                            var tempLoc = "annot" + i;
                            if (snapshot.val()[tempLoc])
                                AddArrow(
                                    snapshot.val()[tempLoc],
                                    tempLoc,
                                    snapshot.val().modelName
                                );
                        }
                    }
                },
            );
        } else if (
            videoSupportedFormats.includes(snapshot.val().fileType.toLowerCase())
        ) {
            //loadVideo
            loadVideo(
                snapshot.val().url,
                parseFloat(snapshot.val().px),
                parseFloat(snapshot.val().py),
                parseFloat(snapshot.val().pz),
                parseFloat(snapshot.val().qx),
                parseFloat(snapshot.val().qy),
                parseFloat(snapshot.val().qz),
                parseFloat(snapshot.val().qw),
                parseFloat(snapshot.val().sx),
                parseFloat(snapshot.val().sy),
                parseFloat(snapshot.val().sz),
                snapshot.val().modelName,
            );
            // if (snapshot.val().currentSeek) {
            // 	var selectedVideoElem = document.getElementById(snapshot.val().modelName);
            // 	selectedVideoElem.currentTime = snapshot.val().currentSeek;
            // }
        } else if (
            docSupportedFormats.includes(snapshot.val().fileType.toLowerCase())
        ) {
            //loaddocument
            loadDoc(
                snapshot.val().url,
                parseFloat(snapshot.val().px),
                parseFloat(snapshot.val().py),
                parseFloat(snapshot.val().pz),
                parseFloat(snapshot.val().qx),
                parseFloat(snapshot.val().qy),
                parseFloat(snapshot.val().qz),
                parseFloat(snapshot.val().qw),
                parseFloat(snapshot.val().sx),
                parseFloat(snapshot.val().sy),
                parseFloat(snapshot.val().sz),
                parseInt(snapshot.val().currentPage),
                snapshot.val().modelName,
            );
        } else if (snapshot.val().fileType.toLowerCase() == "fbx") {
            loadFBX(
                snapshot.val().url,
                parseFloat(snapshot.val().px),
                parseFloat(snapshot.val().py),
                parseFloat(snapshot.val().pz),
                parseFloat(snapshot.val().qx),
                parseFloat(snapshot.val().qy),
                parseFloat(snapshot.val().qz),
                parseFloat(snapshot.val().qw),
                parseFloat(snapshot.val().sx),
                parseFloat(snapshot.val().sy),
                parseFloat(snapshot.val().sz),
                snapshot.val().modelName,
            );
            // } else if ((snapshot.val().fileType).toLowerCase() == "avatar") {
        } else if (
            snapshot.val().fileType.toLowerCase() == "avatar"
        ) {
            loadAvatar(
                snapshot.val().uid,
                snapshot.val().url,
                parseFloat(snapshot.val().px),
                parseFloat(snapshot.val().py),
                parseFloat(snapshot.val().pz),
                parseFloat(snapshot.val().qx),
                parseFloat(snapshot.val().qy),
                parseFloat(snapshot.val().qz),
                parseFloat(snapshot.val().qw),
                parseFloat(snapshot.val().sx),
                parseFloat(snapshot.val().sy),
                parseFloat(snapshot.val().sz),
                snapshot.val().agoraId,
                snapshot.val().modelName,
            );
        } else if (snapshot.val().fileType == "TV") {
            loadTV(
                parseFloat(snapshot.val().px),
                parseFloat(snapshot.val().py),
                parseFloat(snapshot.val().pz),
                parseFloat(snapshot.val().qx),
                parseFloat(snapshot.val().qy),
                parseFloat(snapshot.val().qz),
                parseFloat(snapshot.val().qw),
                parseFloat(snapshot.val().sx),
                parseFloat(snapshot.val().sy),
                parseFloat(snapshot.val().sz),
                snapshot.val().modelName,
            );
            if (snapshot.val().url) {
                if (imageSupportedFormats.includes(snapshot.val().currentFileType.toLowerCase())) {
                    //loadImage
                    showImage(snapshot.val().url, snapshot.val().modelName);
                } else if (videoSupportedFormats.includes(snapshot.val().currentFileType.toLowerCase())) {
                    console.log("Loading TV");
                    showVideo(snapshot.val().url, snapshot.val().modelName);
                }
            }
        } else if (
            snapshot.val().fileType != "ModelMesh" &&
            snapshot.val().fileType != "avatar" &&
            snapshot.val().fileType != "TV"
        ) {
            loadModels(
                snapshot.val().url,
                parseFloat(snapshot.val().px),
                parseFloat(snapshot.val().py),
                parseFloat(snapshot.val().pz),
                parseFloat(snapshot.val().qx),
                parseFloat(snapshot.val().qy),
                parseFloat(snapshot.val().qz),
                parseFloat(snapshot.val().qw),
                parseFloat(snapshot.val().sx),
                parseFloat(snapshot.val().sy),
                parseFloat(snapshot.val().sz),
                snapshot.val().modelName,
                snapshot.val().dispersed,
                function () {
                    var totalArrowLoaded = parseInt(snapshot.val().arrowCount);
                    if (totalArrowLoaded > 0) {
                        var i;
                        for (i = 0; i < totalArrowLoaded; i++) {
                            var tempLoc = "annot" + i;
                            if (snapshot.val()[tempLoc])
                                AddArrow(
                                    snapshot.val()[tempLoc],
                                    tempLoc,
                                    snapshot.val().modelName
                                );
                        }
                    }
                },
            );
        }
        // Add object to list
        if (snapshot.val().fileType == 'assistelem') {
            const modelName = snapshot.val().modelName.split("_");
            document.getElementById("object-list").innerHTML += `<li id="li_${snapshot.val().modelName.split("_")[1]}" class="object-element">
                <div class="d-flex text">
                        <img class="object-img icon" style="width: 3em;height: 3em;margin: 5px" src="${getImage(snapshot.val().fileType)}" alt="type"/>
                        <div id="list_${snapshot.val().modelName.split("_")[1]}" class="object-text">
                            ${modelName[0] + " - " + modelName[1].slice(modelName[1].length - 4, modelName[1].length)}
                        </div>
                </div>
                <div class="d-flex object-controls">
                    <img class="object-img icon street goto-object" style="width: 1.5em;margin: 5px" src="/images/newUI/streetGrey.svg" alt="type" data-name="${snapshot.val().modelName}"/>
                </div>
            </li>`;
        }
        else if (snapshot.val().fileType !== 'avatar') {
            const modelName = snapshot.val().modelName.split("_");
            document.getElementById("object-list").innerHTML += `<li id="li_${snapshot.val().modelName.split("_")[1]}" class="object-element">
                <div class="d-flex text">
                        <img class="object-img icon" style="width: 3em;height: 3em;margin: 5px" src="${getImage(snapshot.val().fileType)}" alt="type"/>
                        <div id="list_${snapshot.val().modelName.split("_")[1]}" class="object-text">
                            ${modelName[0] + " - " + modelName[1].slice(modelName[1].length - 4, modelName[1].length)}
                        </div>
                </div>
                <div class="d-flex object-controls">
                    <img class="object-img icon street goto-object" style="width: 1.5em;margin: 5px" src="/images/newUI/streetGrey.svg" alt="type" data-name="${snapshot.val().modelName}"/>
                    <img class="object-img icon delete" style="width: 1.5em;margin: 5px" src="/images/newUI/deleteGrey.svg" alt="type" data-name="${snapshot.val().modelName}"/>
                </div>
            </li>`;
        }
    });

    database.ref("rooms/" + room).on("child_removed", (snapshot) => {
        // console.log("-----------client removing model-------------");
        if (snapshot.val().arrowCount) {
            arrowCounter = arrowCounter - parseInt(snapshot.val().arrowCount);
        }
        deleteModels(snapshot.val().modelName);
        if (snapshot.val().fileType) {
            if (snapshot.val().fileType == "glb") {
                delete modelMeshes[snapshot.val().modelName];
                delete defaultMeshPositions[snapshot.val().modelName];
            }
        }
    });

    database.ref("rooms/" + room).on("child_changed", (snapshot) => {
        //for remote assist elems URL change
        if (snapshot.val().fileType == "assistelem") {
            var assistObject = scene.getObjectByName(snapshot.val().modelName);
            if (assistObject.userData.url != snapshot.val().url) {
                assistObject.userData.url = snapshot.val().url;
                assistObject.material.map = new THREE.TextureLoader().load(snapshot.val().url);
                assistObject.material.needsUpdate = true;
                console.log(snapshot.val());
                // removeRoomArrows(snapshot.val().modelName);
            }
        }

        if (snapshot.val().currentFileType) {
            if (imageSupportedFormats.includes(snapshot.val().currentFileType.toLowerCase())) {
                //loadImage
                showImage(snapshot.val().url, snapshot.val().modelName);
            } else if (videoSupportedFormats.includes(snapshot.val().currentFileType.toLowerCase())) {
                //loadImage
                showVideo(snapshot.val().url, snapshot.val().modelName);
            }
        }
        var changedObject = scene.getObjectByName(snapshot.val().modelName);
        // for avatar tracking
        if (snapshot.val().fileType.toLowerCase() == "avatar" && snapshot.val().uid != uid_firebase) {
            receiveTransformModel(
                parseFloat(snapshot.val().px),
                parseFloat(snapshot.val().py),
                parseFloat(snapshot.val().pz),
                parseFloat(snapshot.val().qx),
                parseFloat(snapshot.val().qy),
                parseFloat(snapshot.val().qz),
                parseFloat(snapshot.val().qw),
                parseFloat(snapshot.val().sx),
                parseFloat(snapshot.val().sy),
                parseFloat(snapshot.val().sz),
                snapshot.val().agoraId,
            );
        }

        // for playing video in sync
        if (snapshot.val().status) {
            if (snapshot.val().status == "1") {
                var selectedVideoElem = document.getElementById(
                    snapshot.val().modelName,
                );
                if (selectedVideoElem.paused) {
                    $("#play img").attr("tooltipTitle", "Pause");
                    $("#play img").attr("src", "/images/newUI/pause.png");
                    selectedVideoElem.play();
                }
            } else if (snapshot.val().status == "0") {
                $("#play img").attr("tooltipTitle", "Play");
                $("#play img").attr("src", "/images/newUI/play.svg");
                var selectedVideoElem = document.getElementById(
                    snapshot.val().modelName,
                );
                selectedVideoElem.pause();
            }
        }

        //while changing pages
        if (snapshot.val().currentPage) {
            if (parseInt(snapshot.val().currentPage) != changedObject.userData.currentPage) {
                if (parseInt(snapshot.val().currentPage) > changedObject.userData.currentPage) {
                    changedObject.userData.currentPage = parseInt(snapshot.val().currentPage);
                    renderPage(snapshot.val().modelName, changedObject.userData.currentPage + 1);
                } else if (parseInt(snapshot.val().currentPage) < changedObject.userData.currentPage) {
                    changedObject.userData.currentPage = parseInt(snapshot.val().currentPage);
                    renderPage(snapshot.val().modelName, changedObject.userData.currentPage + 1);
                }
            }
        }

        // for model dispersion
        if (snapshot.val().dispersed) {
            if (
                snapshot.val().dispersed == "true" && // check if it should disperse
                modelMeshes[snapshot.val().modelName]["isDispersed"] == "false"
            ) {
                // check if already dispersed

                disperseMeshes(snapshot.val().modelName);
                modelMeshes[snapshot.val().modelName]["isDispersed"] = "true";
            } else if (
                snapshot.val().dispersed == "false" && // check if it should restored
                modelMeshes[snapshot.val().modelName]["isDispersed"] == "true"
            ) {
                // check if already restored

                restoreMeshes(snapshot.val().modelName);
                modelMeshes[snapshot.val().modelName]["isDispersed"] = "false";
            }
        }

        // 
        if (parseInt(snapshot.val().nextArrowCount) > arrowCounter) {
            console.log("Adding Arrows**************************", arrowCounter);
            console.log(snapshot.val());
            var clickedCount = parseInt(snapshot.val().arrowCount) - 1;
            var tempPath = "annot" + clickedCount;
            AddArrow(snapshot.val()[tempPath], tempPath, snapshot.val().modelName);
        } else if (parseInt(snapshot.val().nextArrowCount) < arrowCounter) {
            console.log("deleting arrows************");
            var arrowsToRemove =
                arrowCounter - parseInt(snapshot.val().nextArrowCount);
            for (var i = 0; i < arrowsToRemove; i++) {
                deleteArrows(snapshot.val().modelName, i);
            }
            // console.log(arrowCounter);
        }

        // for object transformations
        if (changedObject) {
            receiveTransformModel(
                parseFloat(snapshot.val().px),
                parseFloat(snapshot.val().py),
                parseFloat(snapshot.val().pz),
                parseFloat(snapshot.val().qx),
                parseFloat(snapshot.val().qy),
                parseFloat(snapshot.val().qz),
                parseFloat(snapshot.val().qw),
                parseFloat(snapshot.val().sx),
                parseFloat(snapshot.val().sy),
                parseFloat(snapshot.val().sz),
                snapshot.val().modelName,
            );
        }
    });

    database.ref("stickyNoteData/" + uid_firebase).once("value", function (snapshot) {
        var stickyText = snapshot.val().data;
        $("#stickyText").val(stickyText);
    });

    database.ref("test").on("child_changed", (snapshot) => {
        camera.quaternion.x = snapshot.val().x;
        camera.quaternion.y = snapshot.val().y;
        camera.quaternion.z = snapshot.val().z;
        camera.quaternion.w = snapshot.val().w;
        camera.updateProjectionMatrix();
    });

    // database.ref('currentUsers').on('child_changed',snapshot => {
    //     // console.log(snapshot.val());
    //     $('#transcribedText').html(snapshot.val().name + " : "+snapshot.val().text);

    // });
    // end of connect().........
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(",")[0].indexOf("base64") >= 0)
        byteString = atob(dataURI.split(",")[1]);
    else byteString = unescape(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}

function showImage(url, name) {
    var tvObject = scene.getObjectByName(name);
    if (tvObject.userData.url != url) {
        let tvVideoElem = document.getElementById(name);
        if (tvVideoElem) {
            tvVideoElem.pause();
        }
        tvObject.userData.url = url;
        tvObject.material.map = new THREE.TextureLoader().load(url);
        tvObject.material.needsUpdate = true;
    }


}

function showVideo(url, name) {
    var tvObject = scene.getObjectByName(name);
    let tvVideoElem = document.getElementById(name);
    if (tvObject.userData.url != url) {
        tvObject.userData.url = url;
        tvVideoElem.setAttribute("src", url);
        tvVideoElem.load();
        tvVideoElem.play();
        tvObject.material.map = new THREE.VideoTexture(tvVideoElem);
        tvObject.material.needsUpdate = true;
    }

}

function firebaseConfigure() {
    firebase.initializeApp(firebaseConfig);
    storageRef = firebase.storage().ref();
    database = firebase.database();
    firestoreDb = firebase.firestore();
    clientsC = firestoreDb.collection("clients");
    userC = firestoreDb.collection("users");
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
            checkAuthRooms();
            //   initCannon();
            // init();
            // animate();
            // initialiseAudioListener();
            // connect();
            // listScreenshots();
            //for loading models
            $("select[id='models']").change(function () {
                var downloadPath = $(this).val();
                var fileNameExt = downloadPath.split("/")[1];
                var fileName = fileNameExt.split(".")[0];
                var fileExt = fileNameExt.split(".").pop();
                $("#openAttachmentModal").modal("hide");
                storageRef
                    .child(downloadPath)
                    .getDownloadURL()
                    .then(function (url) {
                        var cwd = new THREE.Vector3();
                        camera.getWorldDirection(cwd);
                        cwd.multiplyScalar(0.3);
                        cwd.add(camera.position);
                        sendModel(
                            url,
                            cwd.x,
                            cwd.y,
                            cwd.z,
                            camera.quaternion.x,
                            camera.quaternion.y,
                            camera.quaternion.z,
                            camera.quaternion.w,
                            1,
                            1,
                            1,
                            fileName,
                            fileExt,
                            room,
                        );
                        //@params-- sendModel(url, px, py, pz, qx, qy, qz, qw, sx, sy, sz, fileName, room);
                    });
            });
        } else {
            // console.log("user not logged in");
            window.location.assign("/logout");
        }
    });

    document
        .getElementById("real-upload")
        .addEventListener("change", handleFileSelect, false);

    document.addEventListener(
        "dragover",
        function (e) {
            e.preventDefault();
            e.stopPropagation();
        },
        false,
    );

    document.addEventListener("drop", handleAssetPacker, false);

    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var file = evt.target.files[0];

        // TRial starts here========================
        var metadata = {
            contentType: file.type,
        };

        var uploadTask = storageRef
            .child(uid_firebase + "/" + file.name)
            .put(file, metadata);

        uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            function (snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = parseInt(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                );
                progress += "%";
                $("#model_load_bar_container").show();
                $("#model_load_bar").css("width", progress);
                $("#model_load_bar_percent").text(progress);
                // console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');
            },
            function (error) {
                switch (error.code) {
                    case "storage/unauthorized":
                        // User doesn't have permission to access the object
                        break;

                    case "storage/canceled":
                        // User canceled the upload
                        break;

                    case "storage/unknown":
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            function () {
                // Upload completed successfully
                $("#model_load_bar").css("width", "0%");
                $("#model_load_bar_percent").text("0%");
                $("#model_load_bar_container").hide();
                // console.log('Upload Completed');
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    // console.log('File available at', downloadURL);
                    let fileExt = file.name.split(".").pop();
                    // console.log(fileExt, fileExt != 'glb', fileExt != 'gltf');
                    if (fileExt != "glb" && fileExt != "gltf") {
                        // if img or video, directly upload
                        // console.log("File is not model");
                        database
                            .ref(
                                "storageinfo/" + uid_firebase + "/" + file.name.split(".")[0],
                            )
                            .set({
                                fileName: file.name.split(".")[0],
                                fileType: file.name.split(".").pop(),
                                url: downloadURL,
                            });

                        swal(
                            "File uploaded Successfully!!",
                            "Uploaded File has been stored in your account",
                            "success",
                        ).catch(swal.noop);
                    } else {
                        // else if model, save screenshot and then save
                        var viewer;
                        // console.log("File is model");
                        let div_assetEle = document.createElement("div");
                        let bbl_el = document.createElement("babylon");
                        div_assetEle.setAttribute("class", "assetElement");
                        bbl_el.setAttribute("id", "bbl_preview");
                        div_assetEle.appendChild(bbl_el);
                        $("#model-preview").append(div_assetEle);
                        var s = document.createElement("script");
                        s.setAttribute(
                            "src",
                            "https://preview.babylonjs.com/viewer/babylon.viewer.js",
                        );
                        s.setAttribute("crossorigin", "anonymous");
                        div_assetEle.appendChild(s);
                        $("#modelUploadBtnDiv").show();
                        $("#model-preview-div").show();
                        s.onload = function () {
                            let req_el = document.getElementById("bbl_preview");
                            viewer = new BabylonViewer.DefaultViewer(req_el, {
                                model: downloadURL,
                                camera: {
                                    behaviors: {
                                        autoRotate: {
                                            idleRotationSpeed: 0,
                                        },
                                    },
                                },
                            });
                            // console.log("Viewer:", viewer);
                        };
                        $("#confirmModelUpload").off();
                        $("#cancelModelUpload").off();
                        $("#confirmModelUpload").on("click", function () {
                            if (viewer.sceneManager.scene.activeCamera) {
                                BABYLON.Tools.CreateScreenshotUsingRenderTarget(
                                    viewer.sceneManager.scene.getEngine(),
                                    viewer.sceneManager.scene.activeCamera, { width: 600, height: 400 },
                                    function (data) {
                                        storageRef
                                            .child(
                                                uid_firebase +
                                                "/model2dimages/" +
                                                file.name.split(".")[0] +
                                                ".png",
                                            )
                                            .put(dataURItoBlob(data))
                                            .then((snapshot) => {
                                                snapshot.ref
                                                    .getDownloadURL()
                                                    .then(function (downloadURL2) {
                                                        database
                                                            .ref(
                                                                "storageinfo/" +
                                                                uid_firebase +
                                                                "/" +
                                                                file.name.split(".")[0],
                                                            )
                                                            .set({
                                                                fileName: file.name.split(".")[0],
                                                                fileType: file.name.split(".").pop(),
                                                                url: downloadURL,
                                                                model2dimageURL: downloadURL2,
                                                            });
                                                    });
                                            });
                                        $("#openAttachmentModal").modal("hide");

                                        swal(
                                            "File uploaded Successfully!!",
                                            "Uploaded File has been stored in your account",
                                            "success",
                                        ).catch(swal.noop);
                                        $("#model-preview").empty();
                                        $("#modelUploadBtnDiv").hide();
                                        $("#model-preview-div").hide();
                                    },
                                );
                            }
                        });
                        $("#cancelModelUpload").on("click", function () {
                            storageRef
                                .child(uid_firebase + "/" + file.name)
                                .delete()
                                .then(() => {
                                    swal(
                                        "Upload Cancelled!",
                                        "File upload is cancelled",
                                        "error",
                                    ).catch(swal.noop);
                                })
                                .catch((error) => {
                                    // console.log("Uh-oh, an error occurred!");
                                });
                            $("#openAttachmentModal").modal("hide");
                            $("#model-preview").empty();
                            $("#modelUploadBtnDiv").hide();
                            $("#model-preview-div").hide();
                        });
                    }
                });
            },
        );
    }

    // function for file drop
    function handleFileDrop(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var fileList = evt.dataTransfer.files || evt.target.files;
        var file = fileList[0];
        var metadata = {
            contentType: file.type,
        };

        var uploadTask = storageRef
            .child(uid_firebase + "/" + file.name)
            .put(file, metadata);

        uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            function (snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = parseInt(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                );
                progress += "%";
                $("#model_load_bar_container").show();
                $("#model_load_bar").css("width", progress);
                $("#model_load_bar_percent").text(progress);
                // console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');
            },
            function (error) {
                switch (error.code) {
                    case "storage/unauthorized":
                        // User doesn't have permission to access the object
                        break;

                    case "storage/canceled":
                        // User canceled the upload
                        break;

                    case "storage/unknown":
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            function () {
                // Upload completed successfully
                $("#model_load_bar").css("width", "0%");
                $("#model_load_bar_percent").text("0%");
                $("#model_load_bar_container").hide();
                // console.log('Upload Completed');
                listObjects();
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    // console.log('File available at', downloadURL);
                    database
                        .ref("storageinfo/" + uid_firebase + "/" + file.name.split(".")[0])
                        .set({
                            fileName: file.name.split(".")[0],
                            fileType: file.name.split(".").pop(),
                            url: downloadURL,
                        });
                });
                // window.alert('Uploaded '+ file.name + ' to cloud.');
            },
        );
    }

    // end of firebase configure....
}

function checkAuthRooms() {
    database.ref('authRooms/' + room).once("value", function (snapshot) {
        if (snapshot.val()) {
            if (snapshot.val().password == getCookie("roomPass")) {
                console.log("Give Access");
                init();
                animate();
                listScreenshots();
            }
            else {
                window.location.href = "/dashboard";
            }
        }
        else {
            window.location.href = "/dashboard";
        }
    });

}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function listObjects() {
    $("#models").empty();
    $("#models").append('<option value="">---Load Models/Files---</option>');

    //ObjectRef For specific logged user
    var listRef = storageRef.child(uid_firebase + "/");

    // Find all the prefixes and items.
    listRef
        .listAll()
        .then(function (res) {
            res.items.forEach(function (itemRef) {
                var objectPath = itemRef.location.path;
                var objName = objectPath.split("/")[1];
                if (objName.length > 30) {
                    objName = objName.substring(0, 30) + "...";
                }
                $("#models").append(
                    '<option value="' + objectPath + '">' + objName + "</option>",
                );
            });
        })
        .catch(function (error) {
            console.log("Error in listing firebase objects");
        });
}

function listScreenshots() {
    $("#screenshotList").empty();

    database
        .ref("storageinfo/" + uid_firebase + "/snapshotData/" + name)
        .once("value", function (snapshot) {
            let snapshots = snapshot.val();
            for (let ss in snapshots) {
                $("#screenshotList").append(
                    '<div class="ss_img_div">\
                        <img class="ss_img" src="' +
                    snapshots[ss].url +
                    '" data-ssname="' +
                    ss +
                    '" width="100%" />\
                    </div>',
                );
            }
        });
}

function listObjectsTV() {
    // $("#assetsForTV").empty();
    // $("#assetsForTV").append(
    //     '<option value="">---Select Objects for TV---</option>',
    // );

    //ObjectRef For specific logged user
    var listRef = storageRef.child(uid_firebase + "/");

    // Find all the prefixes and items.
    listRef
        .listAll()
        .then(function (res) {
            res.items.forEach(function (itemRef) {
                // console.log('itemRef', itemRef);
                var objectPath = itemRef.location.path;
                var objName = objectPath.split("/")[1];
                var fileExt = objName.split(".").pop();
                if (
                    videoSupportedFormats.includes(fileExt) ||
                    imageSupportedFormats.includes(fileExt)
                ) {
                    if (objName.length > 30) {
                        objName = objName.substring(0, 30) + "...";
                    }
                    // $("#assetsForTV").append(
                    //     '<option value="' + objectPath + '">' + objName + "</option>",
                    // );
                    if (imageSupportedFormats.includes(fileExt)) {
                        document.querySelector("#tab-body-tv-image").innerHTML += libTile(objectPath, "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png", objName.split(" ").join(""), objName, "loadInTv");
                    }
                    else if (videoSupportedFormats.includes(fileExt)) {
                        document.querySelector("#tab-body-tv-video").innerHTML += libTile(objectPath, "https://static.thenounproject.com/png/1813969-200.png", objName.split(" ").join(""), objName, "loadInTv");
                    }
                }
            });
        })
        .catch(function (error) {
            console.log("Error in listing firebase objects");
        });
}

function addView(id, show) {
    if (!$("#" + id)[0]) {
        $("<div/>", {
            id: "remote_video_panel_" + id,
            class: "video-view",
        }).appendTo("#video");
        $("<div/>", {
            id: "remote_video_" + id,
            class: "video-placeholder",
        }).appendTo("#remote_video_panel_" + id);
        $("<div/>", {
            id: "remote_video_info_" + id,
            class: "video-profile " + (show ? "" : "hide"),
        }).appendTo("#remote_video_panel_" + id);
        $("<div/>", {
            id: "video_autoplay_" + id,
            class: "autoplay-fallback hide",
        }).appendTo("#remote_video_panel_" + id);
    }
}

function removeView(id) {
    if ($("#remote_video_panel_" + id)[0]) {
        $("#remote_video_panel_" + id).remove();
    }
}

function detectWebcam(callback) {
    let md = navigator.mediaDevices;
    if (!md || !md.enumerateDevices) return callback(false);
    md.enumerateDevices().then((devices) => {
        // console.log(devices);
        callback(devices.some((device) => "videoinput" === device.kind));
    });
}

function getDevices(next) {
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
            // do something with the stream
            navigator.mediaDevices.enumerateDevices().then(function (items) {
                items
                    .filter(function (item) {
                        return ["audioinput", "videoinput"].indexOf(item.kind) !== -1;
                    })
                    .map(function (item) {
                        return {
                            name: item.label,
                            value: item.deviceId,
                            kind: item.kind,
                        };
                    });
                var videos = [];
                var audios = [];
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if ("videoinput" == item.kind) {
                        var name = item.label;
                        var value = item.deviceId;
                        if (!name) {
                            name = "camera-" + videos.length;
                        }
                        videos.push({
                            name: name,
                            value: value,
                            kind: item.kind,
                        });
                    }
                    if ("audioinput" == item.kind) {
                        var name = item.label;
                        var value = item.deviceId;
                        if (!name) {
                            name = "microphone-" + audios.length;
                        }
                        audios.push({
                            name: name,
                            value: value,
                            kind: item.kind,
                        });
                    }
                }
                next({ videos: videos, audios: audios });
            });
        })
        .catch((e) => {
            alert(e);
        });
}

async function muteAudio() {
    console.log("Muting Local Audio");
    const c = this.children;
    if (!rtc.localTracks.audioTrack) return;

    if (rtc.localTrackState.audioTrackMuted) {
        console.log("Unmuting audio", rtc.localTracks.audioTrack);
        await rtc.localTracks.audioTrack.setEnabled(true);
        rtc.localTrackState.audioTrackMuted = false;

        $("#local_participant i")
            .addClass("fa-microphone")
            .removeClass("fa-microphone-slash");
        c[0].style.width = "";
        c[0].src = "/images/newUI/Mic.svg";
        this.style.backgroundColor = "";
    } else {
        console.log("Muting audio", rtc.localTracks.audioTrack);
        await rtc.localTracks.audioTrack.setEnabled(false);
        rtc.localTrackState.audioTrackMuted = true;

        $("#local_participant i")
            .addClass("fa-microphone-slash")
            .removeClass("fa-microphone");
        // c[0].style.width = "1em";
        c[0].src = "/images/newUI/MicOff.svg";
        this.style.backgroundColor = "#E84C4C";
    }

    // var c = this.children;
    // if (rtc.localStream.getAudioTrack().enabled == true) {
    //     console.log("Muting audio");
    //     rtc.localStream.muteAudio();
    //     localAudio = false;
    //     // console.log("Local Audio Muted");
    //     // document.getElementById('localIcon').children[0].classList.replace("fa-microphone", "fa-microphone-slash");
    //     $("#local_participant i")
    //         .addClass("fa-microphone-slash")
    //         .removeClass("fa-microphone");
    //     // c[0].style.width = "1em";
    //     c[0].src = "/images/newUI/MicOff.svg";
    //     this.style.backgroundColor = "#E84C4C";
    // } else {
    //     console.log("Unmuting audio");
    //     rtc.localStream.unmuteAudio();
    //     localAudio = true;
    //     // console.log("Audio Unmuted");
    //     // document.getElementById('localIcon').children[0].classList.replace("fa-microphone-slash", "fa-microphone");
    //     $("#local_participant i")
    //         .addClass("fa-microphone")
    //         .removeClass("fa-microphone-slash");
    //     c[0].style.width = "";
    //     c[0].src = "/images/newUI/Mic.svg";
    //     this.style.backgroundColor = "";
    // }
}

async function muteVideo() {
    console.log("Executing fn - mute/unmute video");
    const c = this.children;
    if (!rtc.localTracks.videoTrack) return;

    if (rtc.localTrackState.videoTrackMuted) {
        console.log("Unmuting video");

        try {
            await rtc.localTracks.videoTrack.setEnabled(true);
            rtc.localTrackState.videoTrackMuted = false;

            console.log("Video Unmuted");
            var localElem = document.getElementById("remoteVideolocalVideo");
            localElem.srcObject = new MediaStream([rtc.localTracks.videoTrack.getMediaStreamTrack()]);
            $("#remoteVideolocalVideo").css("object-fit", "cover");
            $("#remoteVideolocalVideo").css("transform", "rotateY(180deg)");
            $("#local-tel-icon").css("display", "");
            localElem.play();
            c[0].style.width = "";
            c[0].src = "/images/newUI/video.svg";
            this.style.backgroundColor = "";
        } catch (error) {
            if (error.code == "CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS") {
                swal(
                    "Error",
                    "Cannot screenshare and keep video unmute simultaneously!",
                    "error",
                ).catch(swal.noop);
            }
        }
    } else {
        console.log("Muting video");
        await rtc.localTracks.videoTrack.setEnabled(false);
        rtc.localTrackState.videoTrackMuted = true;

        console.log("Video Muted");
        document.getElementById("remoteVideolocalVideo").srcObject = null;
        $("#remoteVideolocalVideo").css("object-fit", "contain");
        $("#remoteVideolocalVideo").css("transform", "");
        $("#local-tel-icon").css("display", "none");
        c[0].style.width = "2.5em";
        c[0].src = "/images/newUI/VideoOff.svg";
        this.style.backgroundColor = "#E84C4C";
    }
}

function playSound(url) {
    const audio = new Audio(url);
    audio.play();
}

function attachSpatialAudio(uid) {
    if (listener.context.state == "suspended") {
        listener.context.resume().then(() => {
            console.log("Global Listener resumed successfully");
        });
    }
    let audioElement = document.getElementById("remoteAudio" + uid);
    let positionalAudio = new THREE.PositionalAudio(listener);
    positionalAudio.setMediaStreamSource(audioElement.srcObject);
    positionalAudio.setRefDistance(3);
    positionalAudio.setMaxDistance(1000000);
    positionalAudio.setRolloffFactor(5);
    const avatarObject = scene.getObjectByName(uid.toString());
    avatarObject.add(positionalAudio);
    console.log("Attached Spatial Audio");
}

function attachAjnaXStream(agoraId) {
    let avatarObject = scene.getObjectByName(agoraId);
    let pinnedStream = scene.getObjectByName("ajnax" + agoraId);
    if (pinnedStream !== undefined) {
        // Screen is pinned
        pinnedStream.scale.set(0.5, 0.5, 0.5);
        pinnedStream.position.set(0.15, 0, 0);
        avatarObject.add(pinnedStream);
        return;
    }

    var texture_screen = new THREE.VideoTexture(
        document.getElementById("remoteVideo" + agoraId),
    );
    texture_screen.wrapS = THREE.RepeatWrapping;
    texture_screen.repeat.x = -1;
    texture_screen.needsUpdate = true;
    var geometry_screen = new THREE.PlaneGeometry(0.36, 0.2);
    var material_screen = new THREE.MeshBasicMaterial({
        map: texture_screen,
        side: THREE.DoubleSide,
    });
    var mesh_screen = new THREE.Mesh(geometry_screen, material_screen);
    mesh_screen.name = "ajnax" + agoraId;
    var screenCustomData = { type: "ajnax", id: agoraId };
    mesh_screen.userData = screenCustomData;
    mesh_screen.scale.set(0.5, 0.5, 0.5);

    // mesh_screen.applyQuaternion(avatarObject.quaternion);
    mesh_screen.position.set(0.15, 0, 0);
    avatarObject.add(mesh_screen);
    console.log("Attached AjnaX Stream", avatarObject);
}

function removeAjnaXStream(agoraId) {
    var avatarObject = scene.getObjectByName(agoraId);
    if (avatarObject && avatarObject.getObjectByName("ajnax" + agoraId)) {
        avatarObject.remove(avatarObject.getObjectByName("ajnax" + agoraId));
    }
    if (scene.getObjectByName("ajnax" + agoraId)) {
        scene.remove(scene.getObjectByName("ajnax" + agoraId));
    }
    if (control.object && control.object.name == "ajnax" + agoraId) {
        control.detach();
    }
}

function updateMinutes(mins) {
    userC.doc(uid_firebase).get().then(snapshot => {
        var company = snapshot.data().companyName;
        console.log(company);
        clientsC.where("companyName", "==", company)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    console.log(doc.data());
                    clientsC.doc(doc.id).update({ minsUsed: doc.data().minsUsed + mins })
                        .then(() => {
                            console.log("done");
                            window.location.href = "/RemoteAssistance";
                        });
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    });
}

async function disconnect() {
    endTime = new Date();
    // updateMinutes(Math.floor((endTime - startTime) / 60000));
    localStorage.removeItem("Audio");
    localStorage.removeItem("Video");
    for (trackName in rtc.localTracks) {
        var track = rtc.localTracks[trackName];
        if (track) {
            track.stop();
            track.close();
            rtc.localTracks[trackName] = undefined;
        }
    }
    rtm.channel.leave();
    if (rtc.client != undefined) {
        await rtc.client.leave();
        database.ref("stickyNoteData/" + uid_firebase).set({ data: $("#stickyText").val() });
        database.ref("currentUsers/" + rtc.params.vuid).remove();
        database.ref("rooms/" + room + "/" + displayName + "_" + uid_firebase).remove();
        window.location.href = "/RemoteAssistance";
    }

}

function checkSavedRooms(roomNo) {
    database.ref("savedRooms/" + uid_firebase).once("value", function (snapshot) {
        if (snapshot.val()) {
            var savedRoomsList = Object.keys(snapshot.val());
            if (savedRoomsList.includes(roomNo)) {
                database.ref("rooms/" + room).once("value", function (snapshot) {
                    if (snapshot.exists()) {
                        database
                            .ref("savedRooms/" + uid_firebase + "/" + room + "/data")
                            .update(snapshot.val(), function (error) {
                                if (error) {
                                    // console.log(error);
                                } else {
                                    // console.log("Uploaded Objects");
                                    window.location.href = "/RemoteAssistance";
                                    // window.location.href = "https://forms.gle/7Q4sYMF5aDqyjYL96"
                                }
                            });
                    } else {
                        window.location.href = "/RemoteAssistance";
                    }
                });
            } else {
                database.ref("rooms/" + room).once("value", function (snapshot) {
                    if (snapshot.exists()) {
                        $("#saveRoomModal").modal("show");
                    } else {
                        window.location.href = "/RemoteAssistance";
                        // window.location.href = "https://forms.gle/7Q4sYMF5aDqyjYL96"
                    }
                });
            }
        } else {
            window.location.href = "/RemoteAssistance";
            // window.location.href = "https://forms.gle/7Q4sYMF5aDqyjYL96"
        }
    });
}

function addToParticipantsList(name, photo, user_id) {
    $("#participants_div ul").append(
        '<li id="remote_participant_' +
        user_id +
        '">\
        <div class="media">\
        <div class="picture custom-bg-blue3"><img src="' +
        photo +
        '" alt="Avatar" height="35px" width="35px" class="img-circle pull-left avatar"></div>\
        </div>\
        <div class="info">\
        <span class="name">' +
        name +
        '</span>\
        </div>\
        <div class="controls">\
        <a href="#"><i class="fas fa-microphone"></i></a>\
        </div>\
        </li>',
    );
}

function startSpeechRecognition(uid) {
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();

    // This runs when the speech recognition service starts
    recognition.onstart = function () {
        // console.log("We are listening. Try speaking into the microphone.");
    };

    recognition.onspeechend = function () {
        // when user is done speaking
        $("#speechToText").modal("hide");
    };

    // This runs when the speech recognition service returns result
    recognition.onresult = function (event) {
        // var transcript = event.results[0][0].transcript;
        // var confidence = event.results[0][0].confidence;
        // console.log(transcript,confidence);
        // console.log(event.results);
        // console.log('transcript: ', event.results[event.results.length-1][0].transcript);
        var transcript = event.results[event.results.length - 1][0].transcript;
        // $('#transcribedText').html(transcript);
        if (localAudio) {
            database.ref("currentUsers/" + uid).update({ text: transcript });
        }
    };

    recognition.onsoundstart = function () {
        $("#speechToText").modal("show");
        $("#speechToText").data("bs.modal").options.backdrop = false;
        // console.log('Some sound is being received');
    };

    recognition.onend = function () {
        // console.log('Speech recognition service disconnected');
        recognition.start();
    };

    // recognition.onError = function(e){
    //     console.log(e);
    // };

    recognition.onerror = function (event) {
        if (event.error == "no-speech") {
            // console.log(event.error);
        }
        if (event.error == "audio-capture") {
            // console.log(event.error);
        }
        if (event.error == "not-allowed") {
            // console.log(event.error);
        }
    };
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.start();
}

// for asset packer starts here
function handleAssetPacker(event) {
    event.stopPropagation();
    event.preventDefault();
    var items = event.dataTransfer.items;
    remainingfilestoprocess = items.length;
    for (var i = 0; i < items.length; i++) {
        if (items[i].getAsEntry) {
            var entry = items[i].getAsEntry();
        } else if (items[i].webkitGetAsEntry) {
            var entry = items[i].webkitGetAsEntry();
        }
        if (entry) {
            traverseFileTree(entry);
        }
    }
}

function traverseFileTree(item, path) {
    path = path || "";
    if (item.isFile) {
        item.file(
            function (file) {
                files.push(file);
                // var fileitem = '<li><strong>'+ escape(file.name)+ '</strong> ('+ file.type + ') - '+
                // 			file.size+ ' bytes, last modified: '+ file.lastModifiedDate +
                // 			'</li>';
                // document.getElementById('list').innerHTML += fileitem;

                var extension = file.name.split(".").pop();
                if (extension === "gltf") {
                    glbfilename = file.name.substr(
                        file.name.lastIndexOf("/") + 1,
                        file.name.lastIndexOf("."),
                    );
                    var reader = new FileReader();
                    reader.readAsText(file);
                    reader.onload = function (event) {
                        gltf = JSON.parse(event.target.result);
                        checkRemaining();
                    };
                } else {
                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {
                            fileblobs[theFile.name.toLowerCase()] = e.target.result;
                            checkRemaining();
                        };
                    })(file);
                    reader.readAsArrayBuffer(file);
                }
            },
            function (error) {
                // console.log(error);
            },
        );
    } else if (item.isDirectory) {
        var dirReader = item.createReader();
        dirReader.readEntries(function (entries) {
            remainingfilestoprocess += entries.length;
            checkRemaining();
            for (var i = 0; i < entries.length; i++) {
                traverseFileTree(entries[i], path + item.name + "/");
            }
        });
    }
}

function checkRemaining() {
    remainingfilestoprocess--;
    if (remainingfilestoprocess === 0) {
        outputBuffers = [];
        bufferMap = new Map();
        bufferOffset = 0;
        processBuffers().then(fileSave);
    }
}

function processBuffers() {
    var pendingBuffers = gltf.buffers.map(function (buffer, bufferIndex) {
        return dataFromUri(buffer).then(function (data) {
            if (data !== undefined) {
                outputBuffers.push(data);
            }
            delete buffer.uri;
            buffer.byteLength = data.byteLength;
            bufferMap.set(bufferIndex, bufferOffset);
            bufferOffset += alignedLength(data.byteLength);
        });
    });

    return Promise.all(pendingBuffers).then(function () {
        var bufferIndex = gltf.buffers.length;
        var images = gltf.images || [];
        var pendingImages = images.map(function (image) {
            return dataFromUri(image).then(function (data) {
                if (data === undefined) {
                    delete image["uri"];
                    return;
                }
                var bufferView = {
                    buffer: 0,
                    byteOffset: bufferOffset,
                    byteLength: data.byteLength,
                };
                bufferMap.set(bufferIndex, bufferOffset);
                bufferIndex++;
                bufferOffset += alignedLength(data.byteLength);
                var bufferViewIndex = gltf.bufferViews.length;
                gltf.bufferViews.push(bufferView);
                outputBuffers.push(data);
                image["bufferView"] = bufferViewIndex;
                image["mimeType"] = getMimeType(image.uri);
                delete image["uri"];
            });
        });
        return Promise.all(pendingImages);
    });
}

function fileSave() {
    var Binary = {
        Magic: 0x46546c67,
    };

    for (var _i = 0, _a = gltf.bufferViews; _i < _a.length; _i++) {
        var bufferView = _a[_i];
        if (bufferView.byteOffset === undefined) {
            bufferView.byteOffset = 0;
        } else {
            bufferView.byteOffset =
                bufferView.byteOffset + bufferMap.get(bufferView.buffer);
        }
        bufferView.buffer = 0;
    }
    var binBufferSize = bufferOffset;
    gltf.buffers = [{
        byteLength: binBufferSize,
    },];

    var enc = new TextEncoder();
    var jsonBuffer = enc.encode(JSON.stringify(gltf));
    var jsonAlignedLength = alignedLength(jsonBuffer.length);
    var padding;
    if (jsonAlignedLength !== jsonBuffer.length) {
        padding = jsonAlignedLength - jsonBuffer.length;
    }
    var totalSize =
        12 + // file header: magic + version + length
        8 + // json chunk header: json length + type
        jsonAlignedLength +
        8 + // bin chunk header: chunk length + type
        binBufferSize;
    var finalBuffer = new ArrayBuffer(totalSize);
    var dataView = new DataView(finalBuffer);
    var bufIndex = 0;
    dataView.setUint32(bufIndex, Binary.Magic, true);
    bufIndex += 4;
    dataView.setUint32(bufIndex, 2, true);
    bufIndex += 4;
    dataView.setUint32(bufIndex, totalSize, true);
    bufIndex += 4;
    // JSON
    dataView.setUint32(bufIndex, jsonAlignedLength, true);
    bufIndex += 4;
    dataView.setUint32(bufIndex, 0x4e4f534a, true);
    bufIndex += 4;

    for (var j = 0; j < jsonBuffer.length; j++) {
        dataView.setUint8(bufIndex, jsonBuffer[j]);
        bufIndex++;
    }
    if (padding !== undefined) {
        for (var j = 0; j < padding; j++) {
            dataView.setUint8(bufIndex, 0x20);
            bufIndex++;
        }
    }

    // BIN
    dataView.setUint32(bufIndex, binBufferSize, true);
    bufIndex += 4;
    dataView.setUint32(bufIndex, 0x004e4942, true);
    bufIndex += 4;
    for (var i = 0; i < outputBuffers.length; i++) {
        var bufoffset = bufIndex + bufferMap.get(i);
        var buf = new Uint8Array(outputBuffers[i]);
        var thisbufindex = bufoffset;
        for (var j = 0; j < buf.byteLength; j++) {
            dataView.setUint8(thisbufindex, buf[j]);
            thisbufindex++;
        }
    }
    var file = new Blob([finalBuffer], { type: "model/json-binary" });
    var blobURL = URL.createObjectURL(file);

    var metadata = {
        contentType: "application/octet-stream",
    };

    var uploadTask = storageRef
        .child(uid_firebase + "/" + glbfilename + ".glb")
        .put(file, metadata);

    uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        function (snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = parseInt(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            );
            progress += "%";
            $("#model_load_bar_container").show();
            $("#model_load_bar").css("width", progress);
            $("#model_load_bar_percent").text(progress);
            // console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');
        },
        function (error) {
            switch (error.code) {
                case "storage/unauthorized":
                    // User doesn't have permission to access the object
                    break;

                case "storage/canceled":
                    // User canceled the upload
                    break;

                case "storage/unknown":
                    // Unknown error occurred, inspect error.serverResponse
                    break;
            }
        },
        function () {
            // Upload completed successfully
            $("#model_load_bar").css("width", "0%");
            $("#model_load_bar_percent").text("0%");
            $("#model_load_bar_container").hide();
            // console.log('Upload Completed');
            listObjects();
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                // console.log('File available at', downloadURL);
                // database.ref('storageinfo/' + uid_firebase + '/' + glbfilename).set({
                //     fileName: glbfilename,
                //     fileType: "glb",
                //     url: downloadURL
                // });
                var viewer;
                // console.log("File is model");
                let div_assetEle = document.createElement("div");
                let bbl_el = document.createElement("babylon");
                div_assetEle.setAttribute("class", "assetElement");
                bbl_el.setAttribute("id", "bbl_preview");
                div_assetEle.appendChild(bbl_el);
                $("#model-preview").append(div_assetEle);
                var s = document.createElement("script");
                s.setAttribute(
                    "src",
                    "https://preview.babylonjs.com/viewer/babylon.viewer.js",
                );
                s.setAttribute("crossorigin", "anonymous");
                div_assetEle.appendChild(s);
                $("#modelUploadBtnDiv").show();
                $("#model-preview-div").show();
                s.onload = function () {
                    let req_el = document.getElementById("bbl_preview");
                    viewer = new BabylonViewer.DefaultViewer(req_el, {
                        model: downloadURL,
                        camera: {
                            behaviors: {
                                autoRotate: {
                                    idleRotationSpeed: 0,
                                },
                            },
                        },
                    });
                    // console.log("Viewer:", viewer);
                };
                $("#confirmModelUpload").off();
                $("#cancelModelUpload").off();
                $("#confirmModelUpload").on("click", function () {
                    if (viewer.sceneManager.scene.activeCamera) {
                        // console.log("Creating screenshot");
                        BABYLON.Tools.CreateScreenshotUsingRenderTarget(
                            viewer.sceneManager.scene.getEngine(),
                            viewer.sceneManager.scene.activeCamera, { width: 600, height: 400 },
                            function (data) {
                                // console.log(glbfilename);
                                storageRef
                                    .child(
                                        uid_firebase +
                                        "/model2dimages/" +
                                        glbfilename.split(".")[0] +
                                        ".png",
                                    )
                                    .put(dataURItoBlob(data))
                                    .then((snapshot) => {
                                        snapshot.ref.getDownloadURL().then(function (downloadURL2) {
                                            database
                                                .ref(
                                                    "storageinfo/" +
                                                    uid_firebase +
                                                    "/" +
                                                    glbfilename.split(".")[0],
                                                )
                                                .set({
                                                    fileName: glbfilename,
                                                    fileType: "glb",
                                                    url: downloadURL,
                                                    model2dimageURL: downloadURL2,
                                                });
                                        });
                                    });
                                $("#openAttachmentModal").modal("hide");
                                swal(
                                    "File uploaded Successfully!!",
                                    "Uploaded File has been stored in your account",
                                    "success",
                                ).catch(swal.noop);

                                $("#modelUploadBtnDiv").hide();
                                $("#model-preview-div").hide();
                                $("#model-preview").empty();
                                $("#uploadBtnsRow").show();
                            },
                        );
                    }
                });
                $("#cancelModelUpload").on("click", function () {
                    storageRef
                        .child(uid_firebase + "/" + glbfilename + ".glb")
                        .delete()
                        .then(() => {
                            $("#openAttachmentModal").modal("hide");
                            swal(
                                "Upload Cancelled!",
                                "File upload is cancelled",
                                "error",
                            ).catch(swal.noop);
                            $("#modelUploadBtnDiv").hide();
                            $("#model-preview-div").hide();
                            $("#model-preview").empty();
                            $("#uploadBtnsRow").show();
                        })
                        .catch((error) => {
                            // console.log("Uh-oh, an error occurred!");
                        });
                });
                $("#uploadBtnsRow").hide();
                $("#openAttachmentModal").modal("show");
                // $("#openLibraryModal").modal("show");
            });
            swal(
                "Assets packed Successfully!!",
                "Packed File has been stored in your account",
                "success",
            ).catch(swal.noop);
            // window.alert('Uploaded '+ file.name + ' to cloud.');
        },
    );
}

function isBase64(uri) {
    return uri.length < 5 ? false : uri.substr(0, 5) === "data:";
}

function decodeBase64(uri) {
    return fetch(uri).then(function (response) {
        return response.arrayBuffer();
    });
}

function dataFromUri(buffer) {
    if (buffer.uri === undefined) {
        return Promise.resolve(undefined);
    } else if (isBase64(buffer.uri)) {
        return decodeBase64(buffer.uri);
    } else {
        var filename = buffer.uri.substr(buffer.uri.lastIndexOf("/") + 1);
        return Promise.resolve(fileblobs[filename.toLowerCase()]);
    }
}

function alignedLength(value) {
    var alignValue = 4;
    if (value == 0) {
        return value;
    }
    var multiple = value % alignValue;
    if (multiple === 0) {
        return value;
    }
    return value + (alignValue - multiple);
}

function getMimeType(filename) {
    for (var mimeType in gltfMimeTypes) {
        for (var extensionIndex in gltfMimeTypes[mimeType]) {
            var extension = gltfMimeTypes[mimeType][extensionIndex];
            if (filename.toLowerCase().endsWith("." + extension)) {
                return mimeType;
            }
        }
    }
    return "application/octet-stream";
}

function onDocumentMouseDown(event) {
    // event.preventDefault();
    isMouseDown = true;
    onPointerDownMouseX = event.clientX;
    onPointerDownMouseY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
}

function toScreenPosition(obj, camera) {
    var vector = new THREE.Vector3();

    var widthHalf = 0.5 * window.innerWidth;
    var heightHalf = 0.5 * window.innerHeight;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    // console.log(obj.matrixWorld, vector);
    vector.project(camera);
    // console.log(vector);

    vector.x = (vector.x * widthHalf) + widthHalf;
    vector.y = - (vector.y * heightHalf) + heightHalf;

    return {
        x: vector.x,
        y: vector.y
    };

};
function hoverRaycast(event) {


    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children, true);
    let ele = intersects.filter((intersect) => {
        return (intersect.object.parent?.parent?.parent?.name?.startsWith("annot") ? true : intersect.object.parent?.parent?.name?.startsWith("annot") ? true : intersect.object.parent?.name?.startsWith("annot") ? true : intersect.object.name?.startsWith("annot"))
    })[0];
    if (syncCross != 0) {
        clearInterval(syncCross);
        syncCross = 0;
    }
    if (ele) {
        ele = ele.object.parent?.parent?.parent?.name?.startsWith("annot") ? ele.object.parent?.parent?.parent : ele.object.parent?.parent?.name?.startsWith("annot") ? ele.object.parent?.parent : ele.object.parent?.name?.startsWith("annot") ? ele.object.parent : ele.object
        $(`.cross.x`).addClass('display');
        var proj = toScreenPosition(ele, camera);
        $(`.cross.x`).css("top", proj.y + "px");
        $(`.cross.x`).css("left", proj.x + "px");
        $(`.cross.x`).attr("name", ele.name);

    } else {
        if ($(`.cross.x`).hasClass('display')) {
            syncCross = setTimeout(() => {
                $(`.cross.x`).removeClass('display');
                $(`.cross.x`).attr("name", null);
                syncCross = 0;
            }, 500);
        }
    }
}

$(document).on('click', ".cross.x", function () {
    const internalObject = scene.getObjectByName($(this).attr('name'));
    database
        .ref("rooms/" + room + "/" + internalObject.parent.name)
        .once("value", (snapshot) => {
            let data = snapshot.val();
            if (data[internalObject.name.slice(0, 7)]) {
                data[internalObject.name.slice(0, 7)] = null;
            } else {
                data[internalObject.name.slice(0, 6)] = null;
            }
            data["arrowCount"] = (parseInt(snapshot.val().arrowCount) - 1).toString();
            data["nextArrowCount"] = (arrowCounter - 1).toString();
            database.ref("rooms/" + room + "/" + internalObject.parent.name).update(data);
            $(this).attr("name", null);
            $(this).removeClass("display");
        });
});

function onDocumentMouseMove(event) {
    // event.preventDefault();

    if (isMouseDown) {
        lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;
        lat = Math.max(-85, Math.min(85, lat));
        phi = THREE.MathUtils.degToRad(90 - lat);
        theta = THREE.MathUtils.degToRad(lon);

        const x = 500 * Math.sin(phi) * Math.cos(theta);
        const y = 500 * Math.cos(phi);
        const z = 500 * Math.sin(phi) * Math.sin(theta);

        camera.lookAt(x, y, z);
        camera.updateProjectionMatrix();
        database
            .ref("rooms/" + room + "/" + displayName + "_" + uid_firebase)
            .update({
                px: camera.position.x.toFixed(6),
                py: camera.position.y.toFixed(6),
                pz: camera.position.z.toFixed(6),
                qx: camera.quaternion.x.toFixed(6),
                qy: camera.quaternion.y.toFixed(6),
                qz: camera.quaternion.z.toFixed(6),
                qw: camera.quaternion.w.toFixed(6),
            });
    }
    renderer.render(scene, camera);
}

function onDocumentMouseUp(event) {
    // event.preventDefault();
    isMouseDown = false;
}

function onDocumentMouseWheel(event) {
    // event.preventDefault();
    const fov = camera.fov + event.deltaY * 0.05;
    camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
    camera.updateProjectionMatrix();
}

var gltfMimeTypes = {
    "image/png": ["png"],
    "image/jpeg": ["jpg", "jpeg"],
    "text/plain": ["glsl", "vert", "vs", "frag", "fs", "txt"],
    "image/vnd-ms.dds": ["dds"],
};

window.onbeforeunload = function () {
    rtm.channel.leave();
    // await rtc.client.leave();
    database.ref("stickyNoteData/" + uid_firebase).set({ data: $("#stickyText").val() });
    database.ref("currentUsers/" + rtc.params.vuid).remove();
    database.ref("rooms/" + room + "/" + displayName + "_" + uid_firebase).remove();
};
// })();

