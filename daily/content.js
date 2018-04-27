'use strict';
//依赖
const request = require('request');
const cheerio = require('cheerio');
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
            resolve("test");
        });
    })
};
//获取新闻信息
function getNewsInformation(test){
    console.log("get news");
    console.log(test);
    return new Promise(function(resolve,reject){
        request.get("https://www.toutiao.com/api/pc/hot_gallery/?widen=1",function(err,res,body){
            let data = JSON.parse(body).data;
            for(var i=0;i<data.length;i++){
                console.log(data[i].title)
            };
            resolve();
        });
    });
};

// getNewsInformation().then(getWeatherInformation);
getWeatherInformation().then(getNewsInformation);



return;
let s = "Hello";
let content=() => s;
module.exports = content;