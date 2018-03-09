// JavaScript Document
"use strict"
//var APIurl="http://47.93.84.249:30000/";
var APIurl="http://api.uiren.net/";
var wxLoginUrl="http://www.uiren.net/dev/wx_login.html";


//获取header部分，并选择
function setSelectPage(){
	var url=window.location.href;
	
	$("#head nav.h-nav > span").removeClass('selected');
	
	$("#head nav.h-nav > span > a").each(function(){
	    var currentPage=$(this).attr("href");
		if(url.indexOf(currentPage)!=-1){
			$(this).parent().addClass('selected');
		}
	});
}


//登录操作
function doLogin(uname,upwd){
	var url=APIurl+"user/login";
	$.post(url,{loginName:uname,pwd:upwd}).done(function(res){
		if(res.code=="200"){
			localStorage.setItem("uirenToken", res.data.token);  //设置存储token
		    alert("登录成功");
			self.location='default.html'; 
			
		}else{
		   alert(res.message);
		}
	});
}

//检查登录情况
function checkLogin(){
	var url=APIurl+"user/loginUser";
	var loginToken=localStorage.getItem("uirenToken");
	
	var checkResult=true;
	
	if(loginToken!=null){//获取存在本地的Token，如果Token不为空，则发送到服务端验证
		$.get(url,{token:loginToken}).done(function(res){
			if(res.code=="200"){  //返回验证成功
				
				
				
				$("#login_head").attr('src',res.data.headPortrait);  //设置头像
				//当用户登录成功后，把下拉列表的内容加入到页面中
				var htmls='<ul class="downlist">\
								<li><a href="usercenter.html?sid=self">个人中心</a></li>\
								<li><a href="myhw.html">我的作品</a></li>\
                 				<li><a href="#" onclick="exitLogin()">退出登录</a></li>\
						   </ul>';
				$("#h_login #log_head_wrap").after(htmls);     
				
				//将用户名和用户ID存储
				localStorage.setItem("uirenUname",res.data.userName);  
				localStorage.setItem("uirenUID",res.data.userId);
				getPrivateLetter(loginToken);
				
			}else{ //否则，把头像的链接设置到登录页面
				$("#log_head_wrap").attr('href','new_login.html');
				checkResult=false;
			}
		});
		
		
	}else{//如果本地没有Token，则把头像链接到登录页面
		$("#log_head_wrap").attr('href','new_login.html');
		checkResult=false;
	}
	return checkResult;
}

function exitLogin(){
	localStorage.removeItem("uirenToken");
	window.location.href="default.html";
}



//获取7牛上传图片Token
function getToken(){
      return $.get(APIurl+"uptoken",{bucket:"uiren-user-image"});
}

//将时间戳转换为指定格式的时间字符串
function formatDate(nS) {  
	   var newDate = new Date();  
	   newDate.setTime(parseInt(nS));  
	   //console.log(newDate.toLocaleString()); // 2014年6月18日 上午10:33:24    
	   var theDate = newDate.getFullYear()+"年"+(newDate.getMonth()+1)+"月"+newDate.getDay()+"日  "+newDate.getHours()+":"+newDate.getMinutes();
       return theDate;
}  

//计算距离多久之前
function getDateDiff(dateTimeStamp){
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var halfamonth = day * 15;
	var month = day * 30;
	var now = new Date().getTime();
	var diffValue = now - dateTimeStamp;
	if(diffValue < 0){return;}
	var monthC =diffValue/month;
	var weekC =diffValue/(7*day);
	var dayC =diffValue/day;
	var hourC =diffValue/hour;
	var minC =diffValue/minute;
	var result="刚刚";
	if(weekC>=1){
		result=formatDate(dateTimeStamp);
	}
	else if(dayC>=1){
		result=""+ parseInt(dayC) +"天前";
	}
	else if(hourC>=1){
		result=""+ parseInt(hourC) +"小时前";
	}
	else if(minC>=1){
		result=""+ parseInt(minC) +"分钟前";
	}
	return result;
}



//获取URL中指定的参数值
function GetQueryString(name) { 
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
  var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
  var context = ""; 
  if (r != null) 
     context = r[2]; 
  reg = null; 
  r = null; 
  return context == null || context == "" || context == "undefined" ? "" : context; 
}


//字数输入指示，参数仅接受Jquery对象
//ipt 　　　输入框对象
//ShowObj 　数字显示的对象
//maxNum 　 最大字数
function count_char_num(ipt, ShowObj, maxNum) {
    ipt.keyup(function () {
        var text = $(this).val();
        var counter = text.length;
        var leftNum = maxNum - counter;

        if (leftNum < 0) {
            text = text.substring(0, maxNum);
            $(this).val(text);
            ShowObj.text(maxNum + "/" + maxNum);
        } else {
            ShowObj.text(counter + "/" + maxNum);
        }
    })
}

//格式化价格，0元返回免费
function formatPrice(price){
	if(price==0){
		return "免费";
	}else{
		return "￥"+price+"元";
	}
}

//获取私信数量
function getPrivateLetter(userToken){
	
	$.get(APIurl+"privateLetter/unreadConversationCount",{token:userToken}).done(function(res){
		if(res.code==200){
			if(res.data.count>0){
				console.log(res.data.count);
				$("#msg").css("background-image","url(images/ring1.png)");
				
			}else{
				$("#msg").css("background-image","url(images/ring1.png)");
			}
		}else{
			alert(res.message);
		}
	})
}
  