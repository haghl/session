const app = require("express")();
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const bodyParser = require("body-parser");
const url = require("url");

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	session({
		secret: "asjklaskl!@slaskjdkl@@",
		resave: false,
		saveUninitialized: false,
		store: new FileStore(),
	})
);

app.get("/", (req, res) => {
	if (req.session.logined) {
		res.render("logout", { id: req.session.user_id });
	} else {
		res.render("login");
	}
});

app.get("/register", (req, res) => {
	res.render("register");
});

app.post("/register", (req, res) => {
	let uid = req.body.user_id;
	let upwd = req.body.password;
	duplicate(req, res, uid, upwd);
});

app.post("/", (req, res) => {
	let uid = req.body.user_id;
	let upwd = req.body.password;
	duplicate(req, res, uid, upwd);
});

app.post("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/");
});

app.listen(3000, () => {
	console.log("listening 3000port");
});

function duplicate(req, res, uid, upwd) {
	let parseUrl = url.parse(req.url);
	let resource = parseUrl.pathname;
	if (resource == "/register") {
		User.findOne({ user_id: uid }, (err, user) => {
			if (err) return res.json(err);

			if (user) {
				console.log("user id duplicate");
				res.send(`
                    <a href="/">Back</a>
                    <h1>User id duplicate</h1>
                `);
			} else {
				User.create({ user_id: uid, password: upwd }, (err) => {
					if (err) return res.json(err);
					console.log("Success");
					res.redirect("/");
				});
			}
		});
	} else {
		User.findOne({ user_id: uid }, (err, user) => {
			if (err) return res.json(err);

			if (user) {
				User.findOne({ password: upwd }).exec((err, user) => {
					if (err) return res.json(err);

					if (!user) {
						console.log("different password");
						res.send(`
                        <a href="/">Back</a>
                        <h1>Different password</h1>
                    `);
					} else {
						console.log("Welcome");
						req.session.user_id = uid;
						req.session.logined = true;
						res.redirect("/");
					}
				});
			} else {
				console.log("Cannot find user");
				res.send(`
                    <a href="/">Back</a>
                    <h1>Cannot find user</h1>
                `);
			}
		});
	}
}
