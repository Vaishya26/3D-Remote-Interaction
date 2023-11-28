
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
// firebase.auth().useEmulator('http://localhost:5000/');
console.log("firebase configured");
function googleAuth() {
    var provider = new firebase.auth.GoogleAuthProvider();
    // provider.addScope("https://www.googleapis.com/auth/calendar");

    firebase.auth().signInWithPopup(provider)

        .then(({ user }) => {
            console.log(user);
            return user.getIdToken().then((idToken) => {
                return fetch("/sessionLogin", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                    },
                    body: JSON.stringify({ idToken }),
                });
            });
        })
        .then(() => {
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    // User is signed in.
                    console.log(user);
                    let uid = user.uid;


                    // const firestoreDb = firebase.firestore();
                    // const userC = firestoreDb.collection("users");
                    // userC.doc(uid).get().then(snapshot => {
                    //     let data = snapshot.data()
                    //     if (data.email == "ajnasuite@ajnalens.com")
                    //         window.location.assign("/super-admin-dashboard");
                    //     else if (data.role == "SalesAdmin")
                    //         window.location.assign("/sales-admins-dashboard");
                    //     else if (data.role == "CompanyAdmin")
                    //         window.location.assign("/client-admin-dashboard");
                    //     else if (data.role == "ClientUser");
                    window.location.assign("/dashboard");
                    //         }).catch((error) => {
                    //             firebase.auth().signOut().then(function () {
                    //                 swal({
                    //                     text: "You don't have an accout!",
                    //                     title: "Sorry",
                    //                     icon: "error",
                    //                     allowOutsideClick: false
                    //                 }).then(() => {
                    //                     window.location.assign("/logout");
                    //                 });
                    //             });
                    //         })
                }
                else {
                    console.log("user not logged in");
                }
            });
        })
        .catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;

            if (errorCode === 'auth/account-exists-with-different-credential') {
                alert('You have already signed up with a different auth provider for that email.');
                // If you are using multiple auth providers on your app you should handle linking
                // the user's accounts here.
            } else {
                console.error(error);
            }
        });
}


$('#LoginBtn').on('click', () => {
    $('#modalSignIn').modal('hide');
    const user_email = $('#userEmail').val();
    const user_password = $('#userPassword').val();
    firebase
        .auth()
        .signInWithEmailAndPassword(user_email, user_password)
        .then(({ user }) => {
            return user.getIdToken().then((idToken) => {
                return fetch("/sessionLogin", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                    },
                    body: JSON.stringify({ idToken }),
                });
            });
        })
        .then(() => {
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    // User is signed in.
                    console.log(user)
                    let uid = user.uid;
                    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                    window.location.assign("/dashboard");

                    // const firestoreDb = firebase.firestore();
                    // const userC = firestoreDb.collection("users");
                    // userC.doc(uid).get().then(snapshot => {
                    //     let data = snapshot.data()
                    //     if (data.email == "ajnasuite@ajnalens.com")
                    //         window.location.assign("/super-admin-dashboard");
                    //     else if (data.role == "SalesAdmin")
                    //         window.location.assign("/sales-admins-dashboard");
                    //     else if (data.role == "CompanyAdmin")
                    //         window.location.assign("/client-admin-dashboard");
                    //     else if (data.role == "ClientUser")
                    //         window.location.assign("/dashboard");
                    // }).catch((error) => {
                    //     firebase.auth().signOut().then(function () {
                    //         swal({
                    //             text: "You don't have an account!",
                    //             title: "Sorry",
                    //             icon: "error",
                    //             allowOutsideClick: false
                    //         }).then(() => {
                    //             window.location.assign("/logout");
                    //         });
                    //     });
                    // })
                }
                else {
                    console.log("user not logged in");
                }
            });
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            window.alert(errorMessage);
        });
});
