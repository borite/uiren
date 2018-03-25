// JavaScript Document

var uToken;  //用户token

var toUserID="-1";  //要发送给某个用户的ID

var currentConv=-1;  //当前选中的会话

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
	
	

	$("#list_pl").on('click','li',function(){
		$("#list_pl > li").removeClass('list-item-select');
		$(this).addClass('list-item-select');
		toUserID=$(this).attr('id');
		var action=GetQueryString("action");
		if(action=="send")   //如果是发送情况，将会判断首个对话
		{
			if($(this).index()>0){
				getLetterConv($(this));
			}else if($(this).data('cid')=="-1"){  //说明没有对话
				$("#conv_list").empty();
			}else{  //说明已经发表了私信
				getLetterConv($(this));
			}	
		}else{
			getLetterConv($(this));
		}
		
	});
	
	//删除私信
	$("#conv_list").on('click','img.btn-del-letter',function(){
		//console.log($(this).attr('data-id'));
		var letterID=$(this).attr('data-id');
		$.post(APIurl+"/privateLetter/delete",{token:uToken,privateLetterId:letterID}).done(function(res){
			if(res.code==200){
				getLetterConv(currentConv);		
			}
			else{
				console.log(res);
				alert("出错了，请联系管理员");
			}
		})
	})
	
	
	$("#btn_send").click(function(){
		if(toUserID=="-1"){
			alert("出错啦~");
		}else{
			sendLetter(toUserID);
		}
		
	})
	
})

//获取左边私信列表
function getConversations(){
	$.get(APIurl+"privateLetter/conversations",{token:uToken}).done(function(res){
		if(res.code==200){
			//console.log(res.data.rows);
			if(res.data.rows.length==0){
				
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
					
				$("#list_pl > li:first-child").addClass('list-item-select').click();
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
			//getLetterConv(res.data.converSationId);
			//alert(res.data.converSationId);
			$("#ipt_text").val('');
			if($("#"+toUID).data('cid')=="-1"){
				$("#"+toUID).attr('data-cid',res.data.converSationId);
			}
			//alert($("#"+toUID).attr('data-cid'));
			getLetterConv($("#"+toUID));
		})
	}else{
		alert("写点什么吧~");
	}	
}




//获取私信内容，cid为
function getLetterConv(obj){
	var cid=obj.attr('data-cid');
	currentConv=obj;
			$.get(APIurl+'privateLetter/privateLetters',{token:uToken,conversationId:cid}).done(function(res){
				//console.log(res);
				if(res.code==200){
					$("#conv_list").empty();
					if(res.data.rows.length==0){
						obj.find('i.send-time').text('').end().find('div.letter-summ').text('');
						return false;
					}
					
					$.each(res.data.rows,function(i,o){
							$("#conv_list").append(rightConvList);
							$("#conv_list > li:last-child").find('img.conv-avatar').attr('src',o.sendHeadPortrait)
							 .end().find('h2.name').text(o.sendUserName)
							 .end().find('i.send-time').text(getDateDiff(o.createTime))
							 .end().find('div.conv-content').text(o.content)
						     .end().find('img.btn-del-letter').attr('data-id',o.letterId);
							if(o.sysInfo!=null){
							    var a=JSON.parse(o.sysInfo);
								var t=o.content;
								t+="<br/><a href=\"http://www.uiren.net/hw_detail.html?sid="+a.userStudyId+"\">http://www.uiren.net/hw_detail.html?sid="+a.userStudyId+"</a>";
								$("#conv_list > li:last-child").find('div.conv-content').html(t);
							}
					});

					//状态设置为已读
					$.post(APIurl+"privateLetter/conversation/read",{token:uToken,converSationId:cid}).done(function(res){
						if(res.code==200){
							obj.find("i.read-tag").hide();
							getPrivateLetter(uToken);
						}
					})


				}else{
					alert(res.message);
				}
			});

	
}




