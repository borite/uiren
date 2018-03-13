// JavaScript Document
	  var userToken,loginUserId;
	  $(function(){
		  if(checkLogin()){
			userToken=localStorage.getItem("uirenToken");
			loginUserId=localStorage.getItem("uirenUID");
		
		  }else{
			alert("请先登录");
			window.location.href="new_login.html"; 	
		  }
		  
		  //<input id="ipt_new_pwd" type="password" class="ipt-txt" data-myid="password" data-msg="6~18位密码" data-errmsg="请输入6-18位密码" placeholder="新的密码"/>
			 // <input id="ipt_repwd"
		  $("#btn_domodify").click(function(){
			  var repwd_val=$("#ipt_repwd").val();
			  var new_pwd=$("#ipt_new_pwd").val();
			  var old_pwd=$.trim($("#ipt_old_pwd").val());
			  if(repwd_val=="" || new_pwd=="" || old_pwd==""){
				  alert("请输入相关信息");
			  }else if(repwd_val!=new_pwd){
				  alert("你两次输入的新密码不一致！");
			  }else{
				  $.post(APIurl+"user/changePwd",{token:userToken,oldPwd:old_pwd,newPwd:new_pwd}).done(function(res){
					  if(res.code==200){
						  alert("修改密码成功，请重新登录");
						  window.location.href="new_login.html"; 	 
					  }else{
						  alert(res.message);
					  }
				  })
			  }
 
		  })
	  })