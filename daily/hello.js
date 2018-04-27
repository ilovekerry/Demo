'use strict';
//依赖
const request = require('request');
const schedule = require('node-schedule');
const cheerio = require('cheerio');

//常量
const loginUrl = 'http://www.jnshu.com/a/login';
//配置
let loginInformation = {
    mobile:"13882710243",
    pwd:"123456"
};
// var content = "<p>测试提交日报<p>";
//变量
let cookieJar,
    userId,
    classId,
    taskId,
    content,
    dailyUrl;
//登录并获取userId函数
function postLogin(){
    console.log("login");
    return new Promise(function(resolve,reject){
        request.post({url:loginUrl,formData:loginInformation},function(err,res,body) {
            if (err) {
                console.log(err);
            } else {
                var setCookie = res.headers['set-cookie'];
                var cookie1 = setCookie[0].split(";");
                var cookie2 = setCookie[1].split(";");
                //获取cookie
                var cookie = cookie1[0] + ";" + cookie2[0] + ";" + "mobile=null";
                //设置cookie;
                cookieJar = request.jar();
                cookieJar.setCookie(cookie, "http://www.jnshu.com", function (err, cookie) {
                });
                //获取userId
                body = JSON.parse(body);
                userId = body.uid;
                //执行下一步
                resolve();
            }
        })
    })
};
//获取classId函数
function getClassId(){
    console.log("get class id");
    return new Promise(function(resolve,reject){
        request.get("http://www.jnshu.com/a/user/detail/full?uids="+userId,function(err,res,body) {
            body = JSON.parse(body);
            classId = body.data.users[0].cid;
            resolve();
        })
    })
};
//获取taskId函数
function getTaskId(){
    console.log("get task id");
    return new Promise(function(resolve,reject){
        request.get("http://www.jnshu.com/a/user/"+userId+"/task/progress",function(err,res,body) {
            body = JSON.parse(body);
            taskId = body.data.task.id;
            resolve();
        });
    })
};
//获取天气信息
function getWeatherInformation(){
    console.log("get weather");
    return new Promise(function(resolve,reject){
        request.get("http://www.weather.com.cn/weather/101270101.shtml",function(err,res,body) {
            let $ = cheerio.load(body);
            let element=$("#7d ul").children().first();
            let date = element.children("h1").text();
            let weather = element.children(".wea").text();
            let highestTem = element.children(".tem").children("span").text();
            let lowestTem = element.children(".tem").children("i").text();
            let wind = element.children(".win").children("i").text();
            let clothes = $("#chuanyi p").text();
            console.log(date,weather,highestTem,lowestTem,wind,clothes);
            date = "<p>"+"日期："+date+"</p>";
            weather = "<p>"+"天气："+weather+"</p>";
            highestTem = "<p>"+"最高温度："+highestTem+"℃</p>";
            lowestTem = "<p>"+"最低温度："+lowestTem+"</p>";
            wind = "<p>"+"风力："+wind+"</p>";
            clothes = "<p>"+"穿着建议："+clothes+"</p>";
            content = date+weather+highestTem+lowestTem+wind+clothes;
            resolve();
        });
    })
};
//获取新闻信息
function getNewsInformation(){
    console.log("get news");
    return new Promise(function(resolve,reject){
        request.get("https://www.toutiao.com/api/pc/hot_gallery/?widen=1",function(err,res,body){
            let data = JSON.parse(body).data;
            content = content+"<p>今日的新闻有：</p>";
            for(var i=0;i<data.length;i++){
                console.log(data[i].title);
                content+="<p>"+(i+1)+". "+data[i].title+"</p>";
            };
            resolve();
        });
    });
};
//拼接提交日报地址，并提交日报
function postDaily(){
    console.log("post daily");
    return new Promise(function(resolve,reject){
        //拼接日报提交地址
        dailyUrl = "http://www.jnshu.com/a/u/daily/"+classId+"?task="+taskId;
        var dailyParams = {
            dailyTime:"1523176857000",//随便填时间，反正后端也不用你上传的
            content:content,
            type:"daily"
        };
        console.log(content);
        //提交日报
        request.post({url:dailyUrl,formData:dailyParams,jar:cookieJar},function(err,res,body){
            if(err){
                console.log(err)
            }else{
                console.log(JSON.parse(body));
                resolve();
            }
        });
    })
};
//定时执行
function scheduleCronStyle(){
    schedule.scheduleJob('* * 8 * * *',function(){
        postLogin()
            .then(getClassId)
            .then(getTaskId)
            .then(getWeatherInformation)
            .then(getNewsInformation)
            .then(postDaily);
    });
};
scheduleCronStyle();


