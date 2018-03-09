// JavaScript Document

var uToken;  //用户token

var toUserID="-1";  //要发送给某个用户的ID

//用户左边的私信对话列表
var leftConvBlock='<li id="n" data-cid="-1" class="list-item">\
					<i class="read-tag"></i>\
				    <div class="item-content">\
				  	   <a class="pl-avatar">\
				      	  <img class="img-avatar" src="" width="70" height="70"></img>\
				   	   </a>\
				       <div class="item-right">\
						  <h2 class="name"><i class="send-time">14:25</i></h2>\
						  <div class="letter-summ"></div>\
				       </div>\
				    </div>\
			      </li>';

//私信右边的具体内容列表模板
var rightConvList='<li class="clearfix">\
				  <img class="conv-avatar" src="images/default_avatar.png"/>\
				  <div class="conv-info">\
					<div class="conv-top">\
					  <h2 class="name"></h2>\
					  <i class="send-time"></i>\
				    </div>\
				    <div class="conv-content">\
				    </div>\
				  </div>\
				  <img class="btn-del-letter" src="images/trash.png"/></li>';


$(function(){
	
	
	//判断是否登录
	if(checkLogin()){
		uToken=localStorage.getItem("uirenToken");
		getConversations();
	}else{
		alert("请先登录");
		window.location.href="new_login.html";
	}
	
	
	//左边的高度同右边相等
	var h=$("#conv_area").outerHeight();
	$("#letterlist").height(h);

	$("#list_pl").on('click','li',function(){
		$("#list_pl > li").removeClass('list-item-select');
		$(this).addClass('list-item-select');
		toUserID=$(this).attr('id');
		
		getLetterConv($(this));
	});
	
	
	$("#btn_send").click(function(){
		if(toUserID=="-1"){
			alert("出错啦~");
		}else{
			sendLetter(toUserID);
		}
		
	})
	
})


function getConversations(){
	$.get(APIurl+"privateLetter/conversations",{token:uToken}).done(function(res){
		console.log(res);
		if(res.code==200){
			console.log(res.data.rows);
			if(res.data.rows.length==0){
				alert("你还没有任何私信");
			}else
			{
				//绑定私信列表
				$.each(res.data.rows,function(i,o){
					$("#list_pl").append(leftConvBlock);
					$("#list_pl > li:last-child").attr('id',o.otherUserId).attr('data-cid',o.converSationId).find('.img-avatar').attr("src",o.otherHeadPortrait)
						.end().find('h2.name').html(o.otherUserName+'<i class="send-time"></i>')
						.end().find('i.send-time').text(getDateDiff(o.lastMessageTime))
						.end().find('div.letter-summ').text(o.lastContent);
					if(o.readTag==1){
						$("#list_pl > li:last-child").find("i.read-tag").hide();
					}
					
				});
				$("#list_pl > li:first-child").addClass('list-item-select');
				
				var action=GetQueryString("action");
				//如果是发送私信，从作业细节页面跳转过来
				if(action=="send"){
						toUserID=GetQueryString("uid");
						var toUserName=GetQueryString("uname");
						var uavatar=GetQueryString("uavatar");
					    $("#list_pl > li").removeClass('list-item-select');

						if($("#"+toUserID).length>0){    //当前私信列表包括该用户，将该用户的li放到最前端并设置选中状态
							$("#"+toUserID).addClass('list-item-select').prependTo($("#list_pl"));
							
						}else{
							$("#list_pl").prepend(leftConvBlock);
							$("#list_pl > li:first-child").attr('id',toUserID).addClass('list-item-select').find('.img-avatar').attr("src",decodeURI(uavatar))
							.end().find('h2.name').text(decodeURI(toUserName))
							.end().find('i.send-time').text('');
						}
		
				}
				
				//getLetterConv(toUserID);
				$("#list_pl > li:first-child").click();
				
				
				
					
			}
		}else{
			alert("出错了！"+res.message);
		}
	})
}




//发送私信
function sendLetter(toUID){
	var letterContent=$("#ipt_text").val();
	if($.trim(letterContent)!=""){
		$.post(APIurl+"privateLetter/send",{token:uToken,receiveUserId:toUID,content:letterContent}).done(function(res){
			getLetterConv(res.data.converSationId);
		})
	}else{
		alert("写点什么吧~");
	}	
}




//获取私信内容，cid为
function getLetterConv(obj){
	var convID=obj.data('cid');
	$.get(APIurl+'privateLetter/privateLetters',{token:uToken,conversationId:cid}).done(function(res){
		console.log(res);
		if(res.code==200){
			$("#conv_list").empty();
			$.each(res.data.rows,function(i,o){
					$("#conv_list").append(rightConvList);
					$("#conv_list > li:last-child").find('img.conv-avatar').attr('src',o.sendHeadPortrait)
				     .end().find('h2.name').text(o.sendUserName)
				     .end().find('i.send-time').text(getDateDiff(o.createTime))
				     .end().find('div.conv-content').text(o.content);
			});
			
			$.post(APIurl+"privateLetter/conversation/read",{token:uToken,converSationId:cid}).done(function(res){
				if(res.code==200){
					
				}
			})
			
			
		}else{
			alert(res.message);
		}
	})
}




