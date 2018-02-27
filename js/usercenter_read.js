// JavaScript Document
var uToken,uID,uName; //当前登录用户的信息
var viewUID;//从url传过来的userID参数


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

			getHomePageInfo();  //获取当前用户的信息
			getReadBooks(); //获取已读书籍
		}	
	}
})



//获取当前用户信息
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


function getReadBooks(){
	//book/readBooks
	$.get(APIurl+"book/readBooks",{userId:uID}).done(function(res){
		console.log(res);
		if(res.code==200){
			if(res.data.length==0){
				$("#read_list").append("<div>你还没有读过任何书哦~</div>")
			}else{
				$.each(res.data,function(i,o){
					$("#read_list").append('<div class="each-book">\
                        						<a href="'+o.buyUrl+'" target="_blank" class="book-pic"><img src="'+o.coverUrl+'" height="180" width="141" /></a>\
										   		<a href="'+o.buyUrl+'" target="_blank" class="book-name">'+o.bookName+'</a>\
                     						</div>');
				})
			}
		}else{
			alert(res.message);
		}
	})
	
}