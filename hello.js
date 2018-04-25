'use strict';
//依赖
var request = require('request');
var schedule = require('node-schedule');
//常量
var loginUrl = 'http://www.jnshu.com/a/login';
//配置
var params = {
    mobile:"13882710243",
    pwd:"123456"
};
var content = "<p>测试提交日报<p>";
//变量
var cookie,
    userId,
    classId,
    taskId,
    dailyUrl;
function scheduleCronstyle(){
    //每天23:42:42定时执行
    schedule.scheduleJob('42 42 23 * * *',function(){
        console.log(new Date());
        request.post({url:loginUrl,formData:params},function(err,res,body){
            if(err){
                console.log(err);
            }else{
                var setCookie = res.headers['set-cookie'];
                var cookie1 = setCookie[0].split(";");
                var cookie2 = setCookie[1].split(";");
                //获取cookie
                cookie = cookie1[0]+";"+cookie2[0]+";"+"mobile=null";
                //设置cookie;
                var j = request.jar();
                j.setCookie(cookie,"http://www.jnshu.com",function(err,cookie){});
                //获取userId
                body = JSON.parse(body);
                userId = body.uid;
                //获取classId;
                request.get("http://www.jnshu.com/a/user/detail/full?uids="+userId,function(err,res,body){
                    body = JSON.parse(body);
                    classId = body.data.users[0].cid;
                    //获取taskId;
                    request.get("http://www.jnshu.com/a/user/"+userId+"/task/progress",function(err,res,body){
                        body = JSON.parse(body);
                        taskId = body.data.task.id;
                        //拼接日报提交地址
                        dailyUrl = "http://www.jnshu.com/a/u/daily/"+classId+"?task="+taskId;
                        var dailyParams = {
                            dailyTime:"1523176857000",//随便填时间，反正后端也不用你上传的
                            content:content,
                            type:"daily"
                        };
                        //提交日报
                        request.post({url:dailyUrl,formData:dailyParams,jar:j},function(err,res,body){
                            if(err){
                                console.log(err)
                            }else{
                                console.log(JSON.parse(body));
                            }
                        });
                    });
                });
            }
        });
    })
};
scheduleCronstyle();


