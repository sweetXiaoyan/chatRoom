var express = require('express');
var app = express();
// 公式
var http = require('http').Server(app);
var io = require('socket.io')(http);
// session 配置
var session = require('express-session');
app.use(session({
    secret:'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

var allUser = [];
// 模板引擎
app.set('view engine','ejs');
// 静态服务
app.use(express.static('./public'));

// 中间件
app.get('/', function (req, res, next) {
    res.render('index');
});
// 确认登录, 检查是否存在
app.get('/check', function (req, res, next) {
    var userName = req.query.username
    if (!userName){
        res.send('必须填写用户名');
        return;
    }
    if (allUser.indexOf(userName) !== -1) {
        res.send('用户名已经存在');
        return;
    }
    allUser.push(userName);
    // 存入session
    req.session.userName = userName;
    res.redirect('/chat');
});

// 聊天室
app.get('/chat', function (req, res, next) {
    if (!req.session.userName){
        res.redirect('/');
        return;
    }
     res.render('chat',{
         userName: req.session.userName,
         count: allUser.length
     })
});

io.on('connection', function (socket) {
   socket.on('chitchat',function (msg) {
       // 广播io ，非广播 socket ，广播给除自己以外的
      socket.broadcast.emit('chitchat',msg)
   });
   socket.on('chatImg', function (msg) {
       socket.broadcast.emit('chatImg',msg)
   });
});



// 监听
// http.listen(3009);  // localhost
http.listen(3009,'172.16.10.202');

