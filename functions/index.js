const functions = require('firebase-functions');
const express = require('express');
const csrf = require("csurf");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const xXssProtection = require("x-xss-protection");
const referrerPolicy = require('referrer-policy')
const nodemailer = require("nodemailer");
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();
const port = 0000;

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cs5337-default-rtdb.firebaseio.com/"
});

const csrfMiddleware = csrf({ cookie: { httpOnly: true, secure: true } });

// Serve Static Assets
app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }));
app.use(express.static('public'));
app.use('/three', express.static('public/three'));
app.use(express.static('public/three'));

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// for cookies
app.use(cookieParser());

//for XSRF attacks
app.use(csrfMiddleware);
app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));

// Set "X-XSS-Protection: 0"
app.use(xXssProtection());

// Set "Referrer-Policy: no-referrer"
app.use(referrerPolicy())

let setCache = function (req, res, next) {
    const period = 604800 //for 1 week
    if (req.method == 'GET') {
        res.set('Cache-control', `public, max-age=${period}`)
    } else {
        res.set('Cache-control', `no-store`)
    }
    next()
}
app.use(setCache);
let generatePassword = () => {
    var pass = '';
    var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (i = 1; i <= 8; i++) {
        var char = Math.floor(Math.random()
            * str.length + 1);

        pass += str.charAt(char)
    }

    return pass;
}

app.all("*", (req, res, next) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    res.setHeader('x-content-type-options', 'nosniff');
    // res.set("Content-Security-Policy", "default-src 'self'");
    next();
});

app.get('/downloadApp', (req, res) => {
    res.render("mobilepage.ejs");
});


app.post('/sendEmail', (req, res) => {
    async function main() {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "arpitinusa@gmail.com",
                pass: "Arpit2615@",
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"CS-5337" <arpitinusa@gmail.com>', // sender address
            to: req.body.to, // list of receivers
            subject: req.body.subject, // Subject line
            // text: "Hello world?", // plain text body
            html: req.body.html
        });

        // console.log("Message sent: %s", info.messageId);
        res.sendStatus(200);
    }
    main().catch(console.error);
});

app.get("/", function (req, res) {
    res.redirect("/dashboard");

    // const sessionCookie = req.cookies.__session || "";
    // admin
    //     .auth()
    //     .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    //     .then(() => {
    //         res.redirect("/dashboard");
    //     })
    //     .catch((error) => {
    //         res.redirect('/login');
    //     });
});

app.get("/register", function (req, res) {
    res.render('register.ejs');
});

app.get("/login", function (req, res) {
    const sessionCookie = req.cookies.__session || "";
    admin
        .auth()
        .verifySessionCookie(sessionCookie, true /** checkRevoked */)
        .then(() => {
            res.redirect("/dashboard");
        })
        .catch((error) => {
            var error_msg = "";
            res.render('login.ejs', { error: error_msg });
        });

});

// app.get("/arpaint/:id", function (req, res) {
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             console.log(req.params.id);
//             var id = req.params.id;
//             res.render("arpaint.ejs", { room: id });
//         })
//         .catch((error) => {
//             res.redirect("/login");
//         });
// });

app.get("/join/:id", function (req, res) {
    var room_id = (req.params.id).toString();
    res.render("dashboardRA.ejs", { room: room_id });
    // const sessionCookie = req.cookies.__session || "";
    // admin
    //     .auth()
    //     .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    //     .then(() => {
    //         var room_id = (req.params.id).toString();
    //         res.render("dashboardRA.ejs", { room: room_id });
    //         // res.render("dashboardRA2.ejs", {room:room_id});
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //         res.redirect("/login");
    //     });
});


// app.get("/exploreModel", function (req, res) {
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             res.render("exploreModelPage.ejs");
//         })
//         .catch((error) => {
//             console.log(error);
//             res.redirect("/login");
//         });
// });

app.get("/profile", function (req, res) {
    res.render("profile.ejs");

    // const sessionCookie = req.cookies.__session || "";
    // admin
    //     .auth()
    //     .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    //     .then(() => {
    //         res.render("profile.ejs");
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //         res.redirect("/login");
    //     });
});

// app.get("/create", function (req, res) {
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             var room_id = Math.floor(Math.random() * 1000);
//             res.render("dashboardRA.ejs", { room: room_id });
//         })
//         .catch((error) => {
//             res.redirect("/login");
//         });
// });

// app.get("/Steps", function (req, res) {
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             res.render("homepageSteps.ejs");
//         })
//         .catch((error) => {
//             res.redirect("/login");
//         });
// });

app.get("/dashboard", function (req, res) {
    res.render("homepageRA.ejs");
    // const sessionCookie = req.cookies.__session || "";
    // admin
    //     .auth()
    //     .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    //     .then(() => {
    //         res.render("homepageRA.ejs");
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //         res.redirect("/login");
    //     });
});

// app.get("/releases", function (req, res) {
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             res.render("releases.ejs");
//         })
//         .catch((error) => {
//             console.log(error);
//             res.redirect("/login");
//         });
// });

// app.get("/support", function (req, res) {
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             res.render("supportPage.ejs");
//         })
//         .catch((error) => {
//             console.log(error);
//             res.redirect("/login");
//         });
// });

// app.get("/push_update", function (req, res) {
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             res.render("releaseForm.ejs");
//         })
//         .catch((error) => {
//             console.log(error);
//             res.redirect("/login");
//         });
// });

app.get("/RemoteAssistance", function (req, res) {
    res.render("homepageRA.ejs");

    // const sessionCookie = req.cookies.__session || "";
    // admin
    //     .auth()
    //     .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    //     .then(() => {
    //         res.render("homepageRA.ejs");
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //         res.redirect("/login");
    //     });
});

// app.get("/super-admin-dashboard", function (req, res) {         // Super admin main - Done
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             res.render("superAdminMainDashboard.ejs");
//         })
//         .catch((error) => {
//             console.log(error);
//             res.redirect("/login");
//         });
// });

// app.get("/clients", function (req, res) {          // Superadmin clients dashboard - Done
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             res.render("superAdminClientDashboard.ejs");
//         })
//         .catch((error) => {
//             console.log(error);
//             res.redirect("/login");
//         });
// });

// app.get("/sales-admins", function (req, res) {         // Super admin - sales admins info - Done
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             res.render("superAdminSalesDashboard.ejs");
//         })
//         .catch((error) => {
//             console.log(error);
//             res.redirect("/login");
//         });
// });

// app.get("/sales-admins-dashboard", function (req, res) {    // Sales admin main 
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             res.render("salesAdminClientDashboard.ejs");
//         })
//         .catch((error) => {
//             console.log(error);
//             res.redirect("/login");
//         });
// });

// app.get("/client-admin-dashboard", function (req, res) {          // Company Admin Dashboard
//     const sessionCookie = req.cookies.__session || "";
//     admin
//         .auth()
//         .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//         .then(() => {
//             res.render("clientAdminDashboard.ejs");
//         })
//         .catch((error) => {
//             console.log(error);
//             res.redirect("/login");
//         });
// });


// app.post("/addUser", function (req, res) {
//     const sessionCookie = req.cookies.__session || "";
//     let randomPassword = generatePassword();

//     admin.auth()
//         .createUser({
//             displayName: req.body.name,
//             email: req.body.email,
//             emailVerified: false,
//             password: randomPassword,
//             disabled: false,
//         })
//         .then((userRecord) => {
//             // See the UserRecord reference doc for the contents of userRecord.
//             console.log('Successfully created new user:', userRecord.uid, userRecord.email, randomPassword);
//             let res_data = { ...userRecord, pwd: randomPassword, name: req.body.name };
//             res.status(200).end(JSON.stringify({
//                 'status': "success",
//                 "data": res_data
//             }))
//         })
//         .catch((error) => {
//             console.log('Error creating new user:', error);
//             res.status(400).send({
//                 'status': "error",
//                 "message": error
//             })
//         });
// });

// app.post('/sendEmail', (req, res) => {
//     async function main() {
//         let transporter = nodemailer.createTransport({
//             host: "smtp.gmail.com",
//             port: 465,
//             secure: true, // true for 465, false for other ports
//             auth: {
//                 user: "ajnasuite@ajnalens.com",
//                 pass: "AJNASUITE@2021",
//             },
//         });

//         // send mail with defined transport object
//         let info = await transporter.sendMail({
//             from: '"AjnaSuite" <ajnasuite@ajnalens.com>', // sender address
//             to: req.body.to, // list of receivers
//             subject: req.body.subject, // Subject line
//             // text: "Hello world?", // plain text body
//             html: req.body.html
//         });

//         // console.log("Message sent: %s", info.messageId);
//         res.sendStatus(200);
//     }
//     main().catch(console.error);
// });

// app.post("/sessionLogin", (req, res) => {
//     const idToken = req.body.idToken.toString();
//     const expiresIn = 60 * 60 * 24 * 5 * 1000;
//     admin
//         .auth()
//         .createSessionCookie(idToken, { expiresIn })
//         .then(
//             (sessionCookie) => {
//                 const options = { maxAge: expiresIn, httpOnly: true };
//                 res.cookie('__session', sessionCookie, options);
//                 res.end(JSON.stringify({ status: "success" }));
//             },
//             (error) => {
//                 res.status(401).send("UNAUTHORIZED REQUEST!");
//             }
//         );
// });

app.get("/logout", (req, res) => {
    res.clearCookie("__session");
    res.redirect("/login");
});

// app.get('/createscene', (req, res) => {
//     res.render("sceneeditor.ejs");
// });

// app.get('/createscene2', (req, res) => {
//     res.render("sceneeditor2.ejs");
// });

// app.get('/guide', (req, res) => {
//     res.render("guide.ejs");
// });

// app.get('/mainPage', (req, res) => {
//     res.render("mainPage.ejs");
// });

app.listen(port, function () {
    console.log("Listening to port " + port);
});


exports.app = functions.https.onRequest(app);