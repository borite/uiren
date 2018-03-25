// JavaScript Document

var studyID=GetQueryString('sid'); //当前作业ID
var studyUserId; //发布作业的用户ID
var userToken;  //用户Token
var isReply=false; //标识-是否发布类型是回复
var reciveID="";  //接收回复的评论ID
var currentPage=1; //当前评论页数
var totalPage=0;   //总共评论页数
var loginUserId; //当前登录的UserID，用来判断是否出现删除和回复按钮，逻辑上自己是不能回复自己的,可以删除自己发表的评论

$(function(){
	if(checkLogin()){
		userToken=localStorage.getItem("uirenToken");
		loginUserId=localStorage.getItem("uirenUID");
		//console.log(loginUserId);
	}else{
		window.location.href="new_login.html"; 	
	}
	
	//字数输入指示，参数仅接受Jquery对象
	//ipt 　　　输入框对象
	//ShowObj 　数字显示的对象
	//maxNum 　 最大字数
 	count_char_num($("#iptcomm"), $("#num_indicate"), 1000);	
	
  	if(studyID!=""){
		getStudyDetail(studyID);
		getComments(studyID,currentPage);
		
	}else
	{
	   alert("参数获取错误");		
	}
	
	//发表评论，如果非回复类型，则传3个值
	$("#btn_fabiao").click(function(){
		var cont=$("#iptcomm").val();
		cont=$.trim(cont);
		if(cont==""){
			alert("说点什么呗~");
		}else{
			if(isReply==false){
				pubComm(userToken,studyID,cont);
			}else{
				pubComm(userToken,studyID,cont,reciveID);
			}			
		}	
	});
	
	
	//添加获取更多评论功能，每次点击都会判断是否还有更多
	$("#btn_get_more_comm").click(function(){
		//alert(totalPage);
		if(totalPage>1){  //如果总页数大于1
			currentPage++; //当前页数+1
			if(currentPage<=totalPage){  //如果当前页数小于或等于总页数，则可以继续获取 ，否则不会再获取
				getComments(studyID,currentPage);
			}else{
				$(this).text("没有啦！");
				currentPage=totalPage;
			}				    
		}
	});
	
	
	
	
	
	
})//ready end;

//绑定作业发布者信息
function getStudyDetail(sid){
	$.get(APIurl+"study/userStudyDetail",{id:sid}).done(function(res){
		//console.log(res);
		if(res.code==200){
			var o=res.data;
			document.title=o.userName+"的第"+o.studyNumber+"次作业";
			$("#link_uname").text(o.userName);
			$('#s_uname').text(o.userName);
			$("#s_num").text(o.studyNumber);
			$("#study_pic").attr("src",o.pic);
			$("#au_tx").attr("src",o.headPortrait);
			$("#link_tx,#link_uname").attr("href","usercenter.html?sid="+o.userId);
			$("#au_user h2.man-name").text(o.userName);
			$("#au_user h3.pub-time").text("发表于"+getDateDiff(o.createTime));	
			
			//私信按钮事件
			if(o.userId==loginUserId){
				$("#btn_sixin").click(function(){
					alert("你不能自己给自己发私信~");
				})
			}else{
				$("#btn_sixin").attr("href","privateletter.html?action=send&uid="+o.userId+"&uname="+ encodeURI(o.userName)+"&uavatar="+encodeURI(o.headPortrait));
			}
			
			//privateletter.html?action=send&
			studyUserId=o.userId;
			
			getFocusStat();
			
		}	
	})
}

var focusStat;

//获取关注状态
function getFocusStat(){
	$.get(APIurl+"user/homePageInfo",{token:userToken,userId:studyUserId}).done(function(res){
						//console.log(res);
						if(res.code==200){
						 	focusStat=res.data.followTag;
							
							if(focusStat==1){
								$("#btn_guanzhu").text('已关注');
							}else{
								$("#btn_guanzhu").text('加关注');
							}
							
						   //绑定关注按钮功能，需要获取完成发布者信息后绑定
							$("#btn_guanzhu").click(function(){
								if(focusStat=='0'){
									$.post(APIurl+"user/follow",{token:userToken,followedUserId:studyUserId}).done(function(res){
										console.log(res);
										if(res.code==200){
											alert('关注成功');
											$("#btn_guanzhu").text("已关注");	
											focusStat=1;
										}else
										{
											alert(res.message);
										}
									});
								}else{
									$.post(APIurl+"user/cancelFollow",{token:userToken,followedUserId:studyUserId}).done(function(res){
										if(res.code==200){
											alert('已取消关注');
											$("#btn_guanzhu").text("加关注");	
											focusStat=0;
										}else
										{
											alert(res.message);
										}
										
									})
									
								}

							});	

						}
						
					});

}


//获取当前作业的评论，hwid
function getComments(hwid,pNo){
	$.get(APIurl+"study/userStudyComments",{userStudyId:hwid,pageNo:pNo,pageSize:20}).done(function(res){
		//console.log(res);
		if(res.code==200){  //当请求成功时
			
			$("#comm-count").text(res.data.totalCount);  //显示总共的评论条数
			totalPage=res.data.totalPage; //设置全局变量，总共的页数
			//currentPage=res.data.pageNo;
			if(totalPage>1){//如果页数大于1，则显示加载更多
				$("#btn_get_more_comm").show();
			}
			
			if(res.data.totalCount>0){  //如果评论记录数大于0，说明有评论
				$.each(res.data.rows,function(i,o){  //遍历返回数据的记录条数
					if(o.receiveUserId==null){ // 当非回复类型的记录
						
						$("#comment_list").append('<li class="c-item" data-commid="'+o.commentId+'" data-puid="'+o.sendUserId+'">\
														<div class="comment-user">\
   			   	     										<a href="#" class="avatar-href">\
																<img src="'+o.sendHeadPortrait+'" width="56" height="56"/>\
   			   	     										</a>\
															<a href="#" class="name-href">'+o.sendUserName+'</a>\
   			   	     										<span class="pubtime">'+getDateDiff(o.createTime)+'</span>\
    			   										</div>\
    			   										<div class="comment-text">\
    			   	  										'+o.content+'\
														</div> \
														<a href="#comment_wrap" class="btn-reply" data-utx="'+o.sendHeadPortrait+'" data-replayid="'+o.sendUserId+'" data-uname="'+o.sendUserName+'" onclick="pubReply($(this))">回复</a>\
    												</li>\
    												<li><i class="split-line"></i></li>');
					}else{ //回复类型的记录
						
						$("#comment_list").append('<li class="c-item" data-commid="'+o.commentId+'" data-puid="'+o.sendUserId+'">\
														<div class="comment-user">\
   			   	     										<a href="#" class="avatar-href">\
																<img src="'+o.sendHeadPortrait+'" width="56" height="56"/>\
   			   	     										</a>\
															<a href="#" class="name-href">'+o.sendUserName+'</a>\
															<span class="name-href" style="margin:0;">回复</span>\
															<a href="#" class="name-href">'+o.receiveUserName+'</a>\
   			   	     										<span class="pubtime">'+getDateDiff(o.createTime)+'</span>\
    			   										</div>\
    			   										<div class="comment-text">\
    			   	  										'+o.content+'\
														</div> \
														<a href="#comment_wrap" class="btn-reply" data-utx="'+o.sendHeadPortrait+'" data-replayid="'+o.sendUserId+'" data-uname="'+o.sendUserName+'" onclick="pubReply($(this))">回复</a>\
    												</li>\
    												<li><i class="split-line"></i></li>');
					}

					//如果发表评论的ID和登录用户的ID一样，则加入删除按钮和移除回复按钮
					if(o.sendUserId==loginUserId){
						
						$("#comment_list li.c-item").last().find('div.comment-user').append('<span class="btn-delcomm" onclick="delcomm(\''+o.commentId+'\')">删除</span>');
						$("#comment_list li.c-item").last().find('a.btn-reply').remove();
					}

				});
				
			}else{  //没有评论
				$("#comment_list").append('<li><img src="../images/nocomments.gif"/></li>');
			}
		}else{  //请求失败
			alert("服务器错误，请联系管理员！");
			
		}
	})
}

//发表评论
function pubComm(utoken,sid,commCon,rid){
	$.post(APIurl+"study/sendComment",{token:utoken,userStudyId:studyID,content:commCon,receiveUserId:rid}).done(function(res){
		console.log(res);
		if(res.code==200){
			$("#iptcomm").val('');
			$("#num_indicate").text('0/1000');
			$("#comment_list").empty();
			getComments(studyID,1);
		}
	})
}


//删除评论
function delcomm(commID){
	var msg = "您真的确定要删除这条评论吗？\n\n请确认！"; 
 	if (confirm(msg)==true){ 
		$.post(APIurl+"study/deleteComment",{token:userToken,commentId:commID}).done(function(res){
			//console.log(res);
			if(res.code==200){
				alert("删除成功");
				$("#comment_list").empty();
				getComments(studyID,1);	
			}
		})
 	}else{ 
  		return false; 
	}	 
}


function pubReply(obj){
	//console.log(obj.data('uname'));
	isReply=true;
	reciveID=obj.data('replayid');
	$("#btn_replay").show();
	$("#iptcomm").attr('placeholder',"回复"+obj.data('uname'));
	
}


function cancelReplay(){
	isReply=false;
	$("#iptcomm").attr('placeholder',"");
	$("#btn_replay").hide();
	reciveID="";
}

