// JavaScript Document
var videoID;
var uToken,LoginUserID;
var isReply=false;
$(function(){
	 $("#video_nav > li").click(function(){
		   $("#video_nav > li").removeClass('selected');
		   $(this).addClass('selected');  
		   var s_index=$(this).index();
		   $("#video_left_part > section").css('display','none');
		   $("#video_left_part > section").eq(s_index).css('display','block');
	 });
	    
	 videoID=GetQueryString('vid');

	 if(checkLogin()){
		 uToken=localStorage.getItem("uirenToken");
		 LoginUserID=localStorage.getItem("uirenUID");
		 
		 //增加学习记录
		 $.post(APIurl+"lesson/studyRecord",{token:uToken,lessonId:videoID}).done(function(res){
			 if(res.code!=200){
				 alert("学习记录添加错误，请联系管理员~");
			 }
		 })
		 
	 }else
	 {
		alert("请先登录");	 
		window.location.href="new_login.html";
	 }
	 
	 if(videoID==""){
		 alert("参数错误");
	 }else{
		 count_char_num($("#iptcomm"), $("#num_indicate"), 1000);
		 bindVideoInfo(videoID);
		 getVideoComment(videoID); 
		 $("#btn_fabiao").click(function(){
			 var cont=$("#iptcomm").val();
			 cont=$.trim(cont);
			 if(cont==""){
				alert("说点什么呗~");
			 }else{
				if(isReply==false){
					pubComm(uToken,videoID,cont);
				}else{
					var reciveID=$(this).data('reciveid');
					pubComm(uToken,videoID,cont,reciveID);
				}			
			 }	
		 })
	 }
	
})




//绑定视频作者信息
function bindVideoInfo(vid){
	$.get(APIurl+"lesson/lessonDetail",{ lessonId:vid,token:uToken }).done(function(res){
		if(res.code==200){
			$("#class_intr").text(res.data.lessonDesc);
			document.title=res.data.name;
			var class_price=res.data.price;
			if(res.data.price>0 && res.data.buyTag==0){
				$.post(APIurl+"order/unifiedorder",{token:uToken,productId:videoID,orderType:"lesson",payMethod:"wx_web_scan_code"}).done(function(res){
					console.log(res);
					if(res.code==200){
						$.showPopLayer({
							target: "pay_wrap",
							screenLock: true,
							screenLockBackground: "#000",
							screenLockOpacity: "0.5",
							fixedPosition: true,
							onPop: function () {
								var c_url=window.location.href;
								$("#qr_code").qrcode({width:256,height:256,text:res.data.codeUrl});
								$("#btn_paid").attr('href',c_url);
								$("#p_price").text(class_price+"元");
							},
							animate: true	
						})
					}
				})
			}else{
				var videoURL=res.data.videos[0].url;
				if(videoURL!=""){
					var player='<iframe id="play_video" frameborder="0" src="" allowfullscreen></iframe>'
					if(videoURL.indexOf("http://system.video.uiren.net/")!=-1){
						player='<video id="play_video" src="" autoplay controls controlsList="nodownload foobar"></video>'
					}
					$("#content .video-warp").append(player);

					$("#play_video").attr('src', videoURL);
			   }
			}
			
			if(res.data.buyTag==0){
				$("#video_right_part .btn-price").text(formatPrice(res.data.price));
			}else{
				$("#video_right_part .btn-price").text("已购买");
			}
			$("#auth_name").text(res.data.authorName);   //绑定作者视频发布者名字
			$("#auth_intr").text(res.data.authorIntroduction);  //绑定视频作者介绍
			$("#auth_avatar").attr('src',res.data.authorHeadPortrait); //绑定作者头像
			//$("#play_video").attr('poster',res.data.cover);  //绑定视频封面
			
		}else{
			alert(res.message);
		}
	})
}

//获取视频评论
function getVideoComment(vid,pNo){
	
	$.get(APIurl+"lesson/comments",{lessonId:vid,pageNo:pNo,PageSize:15}).done(function(res){
		//console.log(res);
		if(res.code==200){
			$("#video_nav li:last-child").text("评论("+res.data.totalCount+")").click();
			
			if(res.data.rows.length>0){
				$.each(res.data.rows,function(i,o){
					$("#comment_list").append('<div id="comm'+o.commentId+'" class="msg-wrap clearfix">\
						 <img class="msg-user-head" src="'+o.sendHeadPortrait+'" />\
						 <div class="msg-content">\
							<p class="msg-name">'+o.sendUserName+' <span class="msg-time">'+getDateDiff(o.createTime)+'</span></p>\
							<p class="msg-text">'+o.content+'</p>\
							<a href="#comment_wrap" class="btn-reply" onClick="replyComm(\''+o.sendUserName+'\',\''+o.sendUserId+'\')">回复</a>\
						 </div>\
					  </div>');
					if(o.receiveUserId!=null){ //如果receiveUserId不为空，则说明是一个回复
						$("#comm"+o.commentId+" p.msg-name").html('回复 '+o.receiveUserName+'<span class="msg-time">'+getDateDiff(o.createTime)+'</span>');				
					}
					if(LoginUserID==o.sendUserId){  //如果是同一个人，显示删除按钮，隐藏回复按钮
						$("#comm"+o.commentId+" p.msg-name").append('<span class="btn_del_comm" onClick="delComm(\''+o.commentId+'\')">删除</span>');
						$("#comm"+o.commentId+" a.btn-reply").css('visibility','hidden');
					}
					
				})		
			}else{
				$("#comment_list").html('<img src="../images/nocomments.gif" />');
				$("#btn_more_comm").hide();
			}
		}
		
	})
}


//发表评论。rid不为空时，表示回复某个用户
function pubComm(userToken,videoID,cont,rID){
	$.post(APIurl+"lesson/sendComment",{token:userToken,lessonId:videoID,content:cont,receiveUserId:rID}).done(function(res){
		console.log(res);
		if(res.code==200){
			$("#iptcomm").val('');
			$("#num_indicate").text('0/1000');
			$("#comment_list").empty();
			getVideoComment(videoID,1);
		}
	})
}

function delComm(cid){
	var msg = "您真的确定要删除这条评论吗？\n\n请确认！"; 
 	if (confirm(msg)==true){ 
		  $.post(APIurl+"lesson/deleteComment",{token:uToken,commentId:cid}).done(function(res){
		  if(res.code==200){
				alert("删除成功");
				$("#comment_list").empty();
				getVideoComment(videoID,1);	
		  }
		})
 	}else{ 
  		return false; 
	}	 
}


function replyComm(uname,uid){
	isReply=true;
	$("#iptcomm").attr('placeholder','#回复'+uname+'#');
	$("#btn_fabiao").attr('data-reciveid',uid);
	$("#btn_replay").show();
	
}

function cancelReplay(){
	isReply=false;
	$("#iptcomm").attr('placeholder','');
	$("#btn_fabiao").attr('data-reciveid','-1');
	$("#btn_replay").hide();
}

