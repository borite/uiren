var uToken,LoginUserID;


$(function(){
	if(GetQueryString("sid")==""){
			alert("参数错误！");
	}else{
		if(checkLogin()){
			 uToken=localStorage.getItem("uirenToken");
			 LoginUserID=localStorage.getItem("uirenUID");
			 getHomePageInfo();
			 getUserStudyRecords();

		 }else
		 {
			alert("请先登录");	 
			window.location.href="new_login.html";
		 }
	
	}
})


//获取当前用户信息
function getHomePageInfo(){
	var viewUID;
	if(GetQueryString("sid")=="self"){
				viewUID=LoginUserID;
	}else{
				viewUID=GetQueryString("sid");
	}
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


function getUserStudyRecords(){
	var recordHTML='<div class="each-course">\
                        <a target="_blank" href="#" class="course-bg"> <img src="images/course_bg.png" style="height:180px;width:290px;" /> </a>\
                        <a href="#" class="course-name">Photoshop人像后期处理基础课程</a> </br>\
                        <a href="#" class="teacher-name">郗鉴</a><div class="course-price">￥23</div>\
                    </div>'
	
	$.get(APIurl+"lesson/studyRecords",{userId:LoginUserID}).done(function(res){
		console.log(res);
		if(res.code==200){
			$("#record_area").empty();
			$.each(res.data.rows,function(i,o){
				$("#record_area").append(recordHTML);
				$("#record_area div.each-course:last-child").find("a.course-bg").attr("href","video.html?vid="+o.id).end().find('img').attr('src',o.cover)
				$("#record_area div.each-course:last-child").find('a.course-name').attr('href',"video.html?vid="+o.id).text(o.name);
				$("#record_area div.each-course:last-child").find('a.teacher-name').attr('href','usercenter.html?sid='+o.authorId).end().end().find('div.course-price').html(formatPrice(o.price)+"&emsp;");
			})
		}
	})
}