// JavaScript Document

var uToken,uID,uName; //当前登录用户的信息
var viewUID;//从url传过来的userID参数
var currentPage=1;  //留言分页的当前页数
var isReply=false; //标识-是否发布类型是回复
var replyMID; //回复的留言ID

$(function(){
	if(GetQueryString("sid")==""){
			alert("参数错误！");
	}else{
		if(checkLogin()){
			uToken=localStorage.getItem('uirenToken');
			uID=localStorage.getItem("uirenUID");  
			uName=localStorage.getItem("uirenUname");
			if(GetQueryString("sid")=="self"){
				viewUID=uID;
			}else{
				viewUID=GetQueryString("sid");
			}
			
			//当前被访问人的相关数据
			$("#home_page").attr('href','usercenter.html?sid='+viewUID);
			$("#study_records").attr('href','uc_study.html?sid='+viewUID);
			$("#read_books").attr('href','uc_read.html?sid='+viewUID);

			
			addView();  //增加当前的用户最近访问人
			getHomePageInfo();  //获取当前用户的信息
			getRecentViewer();  //获取当前用户的最近访问人
			getMessage();  //获取留言
 			count_char_num($("#ipt-reply"), $("#num_indicator"), 1000);  //绑定输入框字数提示
			
			$("#btn_pub").click(function(){
				var m_cont=$.trim($("#ipt-reply").val());
				if(m_cont==""){
					alert("说点什么吧~");
				}else{
					if(isReply){
						sendReply(uToken,replyMID,m_cont);
					}else{
						sendMessage(m_cont);
					}
					
				}
			})	
		}	
	}
})




function getHomePageInfo(){
	$.get(APIurl+"user/homePageInfo",{userId:viewUID}).done(function(res){
		
		if(res.code==200){
			$("#top_tx").attr('src',res.data.headPortrait);
			$("#top_name").text(res.data.userName);
			$("#top_follow").text(res.data.followCount);
			$("#top_fans").text(res.data.followedCount);
			$("#top_views").text(res.data.viewCount);
			
		}
		
	})
}




//获取最近访客
function getRecentViewer(){
	$.get(APIurl+"user/recentViewers",{userId:viewUID}).done(function(res){
		console.log(res);
	    if(res.code==200){
			if(res.data.length>0){
				$.each(res.data,function(i,o){
					$("#uc_main_right div.guest-area")
						.append('<div class="guest-wrap">\
									<a id="'+o.id+'" href="usercenter.html?sid='+o.id+'" class="guest-head"><img src="'+o.headPortrait+'"/></a>\
									<a href="usercenter.html?sid='+o.id+'" class="guest-name">'+o.userName+'</a>\
									<p class="guest-time">'+getDateDiff(o.viewTimes)+'</p>\
					 			</div>');
				})
			}else{
				$("#uc_main_right div.guest-area").append('<div class="no-viewer">还没有人来过哦~</div>')
			}
			
		}else{
			alert("服务器出现问题，请联系管理员");
		}
	})
}





function addView(){
	if(viewUID==uID){
		return;
	}else{
		$.post(APIurl+"user/view",{token:uToken,viewedUserId:viewUID}).done(function(res){
			console.log("增加最近浏览者结果:");
			console.log(res);
		})
	}	
}



//获取留言

function getMessage(){
	$.get(APIurl+"message/messages",{userId:viewUID,pageNo:currentPage,pageSize:10}).done(function(res){
		if(res.code==200){
			$("#msg_area").empty();
			console.log(res);
			if(res.data.rows.length>0){
				$.each(res.data.rows,function(i,o){
					$("#msg_area").append('<div class="msg-wrap clearfix">\
						 <img class="msg-user-head" src="'+o.sendHeadPortrait+'" />\
						 <div class="msg-content">\
							<p class="msg-name">'+o.sendUserName+' <span class="msg-time">'+getDateDiff(o.createTime)+'</span></p>\
							<p class="msg-text">'+o.content+'</p>\
							<a href="#reply" onClick="pubReply('+o.messageId+',\''+o.sendUserName+'\')" class="btn-reply">回复</a>\
						 </div>\
					 </div>');
				})
			}else{
				//alert('aaaa');
				$("#msg_area").append('<div class="no-viewer">还没有人留言哦~</div>');
			}
		}
	})
}


function sendMessage(msg_cont){
	$.post(APIurl+"message/send",{token:uToken,receiveUserId:viewUID,content:msg_cont}).done(function(res){
		console.log(res);
   		if(res.code!=200){
			alert(res.message);
		}else{
			console.log('已经发送成功');
			getMessage();
		}
	})
}

function sendReply(token,mid,content){
	$.post(APIurl+"message/reply",{token:token,messageId:mid,content:content}).done(function(res){
		console.log(token+","+mid+','+content);
		if(res.code==200){
			console.log(res);
			getMessage();
		}else
		{
			alert(res.message);
		}
	}).fail(function(res){
		console.log(res);
	})
}



//回复留言，uid为留言的ID
function pubReply(mid,m_uname){
    isReply = true;
	$("#ipt-reply").attr('placeholder','#回复'+m_uname+'#');
	$("#btn_pub").val('回复');
	replyMID=mid;
	$("#btn_replay").show();	
}

function cancelReplay(){
	isReply=false;
	$("#ipt-reply").attr('placeholder','');
	$("#btn_pub").val('发表留言');
	replyMID=null;
	$("#btn_replay").hide();
}


/*function getHomePageInfo(){
	$.get(APIurl+"user/homePageInfo",{userId:})
}*/




