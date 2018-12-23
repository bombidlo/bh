const Candidate = require('../models/candidate')
const User = require('../models/user');
const request = require('request');
const cheerio = require('cheerio');
const Token = require('../models/token');

exports.getIndex = (req, res, next) => {

    if (!req.session.user) {
        res.render('login');
        return;
    }

    Candidate.find().then(result => {
        res.render('index', {
            title: 'Главная страницы',
            'path': '/',
            candidates: result.reverse(),
            user: req.session.user[0]
        })
    })

}

exports.getAddCandidate = (req, res, next) => {
    if (!req.session.user) {
        res.render('login');
        return;
    }
    res.render('add-candidate', {
        title: 'Добавление',
        path: '/add',
        user: req.session.user[0]
    });
}

exports.postAddCandidate = (req, res, next) => {
    const id = req.body.link.split("/")[3];

    Token.find().then(result => {

        request("https://api.vk.com/method/users.get?user_ids=" + id + "&fields=bdate,city,country,home_town,photo_200,has_mobile,contacts,relation&access_token=" + result[0].token + "&v=5.92", (err, resp, body) => {
            const $ = cheerio.load(body);
            console.log($);
             console.log(cheerio.load(body));
             console.log(cheerio.load(body));
             console.log(cheerio.load(body));
             console.log(cheerio.load(body));
             console.log(cheerio.load(body));
             console.log(cheerio.load(body));
            const result = JSON.parse($.text());

            const user = 370038828;

            Candidate.find().then(candidates => {
                const result = candidates.filter(can => can.id == user.id);
                if (result.length !== 0) {
                    res.redirect('/add');
                } else {
                    const candidate = new Candidate({
                        id: user.id,
                        fio: user.first_name + ' ' + user.last_name,
                        birthDate: user.bdate ? user.bdate.toString() : '',
                        photo: user.photo_200,
                        status: "В ожидании",
                        admin: req.session.user[0]._id
                    });
                    candidate.save().then(result => {
                        res.redirect('/');
                    })
                }
            })
        })
    })
}

exports.getEditCandidate = (req, res, next) => {
    if (!req.session.user) {
        res.render('login');
        return;
    }
    const prodId = req.params.candidateId;
    Candidate.findById(prodId).then(candidate => {
        User.findById(candidate.admin).then(admin => {
            res.render('edit-candidate', {
                title: 'Редактирование',
                candidate: candidate,
                path: '/',
                admin: admin,
                user: req.session.user[0]
            });
        })
    }).catch(err => console.log(err))
}

exports.postEditCandidate = (req, res, next) => {

    const candidateId = req.body.candidateId;

    const updatedFio = req.body.fio;
    const updatedBirthDate = req.body.birthDate;
    const updatedComment = req.body.comment;

    console.log(req.body.status);

    Candidate.findById(candidateId).then(candidate => {
        candidate.fio = updatedFio;
        candidate.birthDate = updatedBirthDate;
        candidate.comment = updatedComment;
        candidate.status = req.body.status;

        return candidate.save();
    }).then(result => {
        res.redirect('/');
    }).catch(err => console.log(err));
}

exports.postDeleteCandidate = (req, res, next) => {
    const candidateId = req.body.candidateId;

    Candidate.findByIdAndRemove(candidateId).then(result => {
        res.redirect('/');
    }).catch(err => console.log(err))
}

exports.postLogin = (req, res, next) => {
    email = req.body.email;
    password = req.body.password;

    User.find().then(users => {
        const user = users.filter(u => u.email === email);

        if (user[0].password === password) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.redirect('/');
        }

    }).catch(err => console.log(err))
}
exports.getChat = (req, res, next) => {

    if (!req.session.user) {
        res.render('login');
        return;
    }

    res.render('chat', {
        title: "Чат",
        path: '/chat',
        user: req.session.user[0]
    })
}

exports.getToken = (req, res, next) => {

    if (!req.session.user) {
        res.render('login');
        return;
    }

    Token.findById('5c0f58012528c7256cdde535').then(result => {

        res.render('token', {
            title: 'Токен',
            path: 'token',
            token: result,
            user: req.session.user[0]
        });
    }).catch(err => console.log(err))
}

exports.postToken = (req, res, next) => {
    tk = req.body.token;

    Token.findById('5c0f58012528c7256cdde535').then(result => {
        result.token = tk;

        return result.save();
    }).then(result => {
        res.redirect('/token');
    })
}
