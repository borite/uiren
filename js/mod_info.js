
//存储每个输入框的验证状态，0默认，-1错误 1正确
var ItemStat = {
    nickname: 1,
    phone: 1,
    //password:0,
	//repwd:0,
	email:1
}

var uToken,uID,uName; //当前登录用户的信息

var jcrop_api;   //头像裁剪插件对象

var qiniuToken="";  //获取上传头像用到的七牛Token

var base64_upload_data; //上传头像的图片base64编码

var fileType;  //上传头像的图片类型

var upLoadUrl;

$(function(){
	
	if(checkLogin()){
		uToken=localStorage.getItem('uirenToken');
		uID=localStorage.getItem("uirenUID");  
		$.get(APIurl+"user/homePageInfo",{userId:uID}).done(function(res){
			if(res.code==200){
				$("#avatar_img").attr('src',res.data.headPortrait);
				$("#nickname").val(res.data.userName);
			}
		});
	}else{
		alert("请先登录");
		window.location.href="new_login.html"; 	  
	}
	
	$("#register_wrap input.ipt-txt").on({
		'focus':function(){
			if($(this).hasClass('err-ipt')){
				showMsg($(this).data('errmsg'),"err_msg");
			}else{
				$("#reg_noti_msg").removeClass();
				showMsg($(this).data('msg'));
			}	
		},
		'blur':function(){
			var iptID = $(this).attr("id");
            var iptVal = $(this).val();
			checkForm(iptID, iptVal);           
		},
		'keyup':function(){
			if($(this).hasClass('err-ipt')){
				$(this).removeClass('err-ipt');
			}
		}
	});
	
	
	//选择图片窗口
	$("#avatar").click(function(){
		$("#avatar_select").click();
	});
	
	//弹出裁剪窗口的按钮点击事件
	$("#btn_save").click(function () {
        var imgSrc = document.getElementById("avatat_prev").toDataURL("image/png");
        document.getElementById("avatar_img").src = imgSrc;
	    base64_upload_data = imgSrc.replace(/^.*?base64,/, '');		
		$("#ipt_avatar").val(base64_upload_data);
		ItemStat.portrait=1;
		$("#reg_noti_msg").removeClass().css('visibility','hidden');
        $.closePopLayer();
    });

	//当选择头像原始文件时执行，也就是值改变的时候
	$("#avatar_select").change(function(){
		var size = 5 * 1024 * 1024;
        var file = this.files[0];
        var fileName = file.name;
        var fileSize = file.size;
        fileType = fileName.substring(fileName.lastIndexOf('.'), fileName.length).toLowerCase();
        if (fileType != '.gif' && fileType != '.jpeg' && fileType != '.png' && fileType != '.jpg') {
            alert("上传失败，请上传jpg,png格式的图片");
            return;
        }
        if (fileSize > size) {
            alert("上传失败，请上传5MB以内的图片。");
            return;
        }
        var reader = new FileReader();
        reader.readAsDataURL(file);
		reader.onload = function () {
			 // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
			$("#cropbox").attr("src", url);
            initJcrop();
            $.showPopLayer({
                target: "uppic_wrap",
                animate: false,
                onPop: function () {
					
					
                    if (jcrop_api != null) {
                        jcrop_api.setImage(url, function () {
                            var bb = this.getBounds();
                            var bWidth = Number(bb[0]) / 2;
                            var bHeight = Number(bb[1]) / 2;
                            this.setSelect([0, 0, bWidth, bHeight]);
                            var ss = this.getWidgetSize();
                            var aheight = (300 - Number(ss[1])) / 2 + "px";
                            $(".jcrop-holder").css({ "margin": aheight + " auto" });
                        })
                    }
                },
                onClose: function () {
                    $('#avatar_select').prop('value', '');
                }
            });
		}
	})	
});


//表单验证
function checkForm(id,val){
	var regExp;
	switch (id) {
        case "ipt_email":
            regExp = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
            if (!regExp.test(val)&&val!="") {
                ItemStat.email = -1;
				$("#"+id).addClass('err-ipt');
                showMsg("请输入正确的邮箱地址","err_msg");
            } else {
                $("#reg_noti_msg").css('visibility','hidden');
                ItemStat.email = 1;
            }
            break;

		case "ipt_phone":
			regExp=/^[1][34578][0-9]{9}$/;
            if (!regExp.test(val)&&val!="") {
                ItemStat.phone = -1;
				$("#"+id).addClass('err-ipt');
                showMsg("请输入正确的手机号码","err_msg");
            } else {
                $("#reg_noti_msg").css('visibility','hidden');
                ItemStat.phone = 1;
            }
            break;
		case "nickname":
			regExp=/^[\u4e00-\u9fa5_a-zA-Z0-9-]{2,15}$/
			if (!regExp.test(val)&&val!="") {
                ItemStat.nickname = -1;
				$("#"+id).addClass('err-ipt');
                showMsg("请输入2-15个字符，只接受汉子，字母，数字，下划线，减号","err_msg");
            } else {
                $("#reg_noti_msg").css('visibility','hidden');
                ItemStat.nickname = 1;
            }
			break;
        default:
            break;
    }
}

//显示提示信息
function showMsg(msg,errClass) {
	if(typeof(errClass)=='undefined'){
    	$("#reg_noti_msg").css('visibility','visible');
		$("#reg_noti_msg").text(msg);   
	}else{
		$("#reg_noti_msg").addClass(errClass).css('visibility','visible');
		$("#reg_noti_msg").text(msg);  
	}
}

//重新检查表单，用于提交按钮的事件
function reCkeckForm(){
	
	var isOK=true;
	
	for(var item in ItemStat){
		if(ItemStat[item]==0 || ItemStat[item]==-1 ){
			isOK=false;
			$("#register_wrap input[data-myid="+item+"]").addClass("err-ipt");
		}
	}
	if(isOK==false){
		showMsg("您的注册信息有误，请检查","err_msg");
	}
	else //如果表单验证成功
	{
		var portraitVal=$("#ipt_avatar").val()  //检查是否选择了头像
		var currentStep=0;  //注册执行的逻辑步骤  1-验证邮箱和手机是否注册  2-获取7牛的上传Token  3-上传图片  4-所有信息调用该API提交，完成注册
		disableBtn(true);
		checkExist().then(function(res){
				currentStep=1;
				if(res.code=="200"){
					currentStep=2;
					return $.get(APIurl+"uptoken",{bucket:"uiren-user-image"});
				}else
				{
					disableBtn(false);
					showMsg(res.message,"err_msg");
					if(res.message=="该邮箱已注册"){
						$("#ipt_email").addClass("err-ipt");
					}else if(res.message=="该手机号已注册"){
						$("#ipt_phone").addClass("err-ipt");
					}		
				}
		}).then(function(data){
				if(currentStep==2){
					if(data!=null && data.uptoken!=""){
						currentStep=3
						qiniuToken=data.uptoken;
						return upLoadToQiniu();
					}else{
						disableBtn(false);
						alert("服务器出现错误！");
					}
				}
		}).then(function(res){
				if(currentStep==3){
					//console.log(res);
					if(res.key==""){
						disableBtn(false);
						alert("上传图片出现异常，请联系技术人员");
					}else{
						currentStep=4;
						//console.log(portraitVal);
						if(portraitVal!="-1"){
							upLoadUrl="http://user.img.uiren.net/"+res.key;
						}else{
							upLoadUrl="";
						}
						var regUrl=APIurl+"user/modify";
						var regformStr="token="+uToken+"&"+$("#reg_form").serialize()+"&userName="+$("#nickname").val()+"&portrait="+upLoadUrl;
						//console.log(regformStr);
						return $.post(regUrl,regformStr);
					}
				}
		}).then(function(res){
				if(currentStep==4){
					if(res.code=="200"){
						alert("修改成功！");
						window.location.href="default.html"; 
					}else
					{
						alert("修改失败！"+res.message);		
					}
				}
		}).always(function(){
				disableBtn(false);
		})
	
	}

}


function checkExist(){
	var checkUrl=APIurl+"user/checkExist";
	var email=$.trim($("#ipt_email").val());
	var phone=$.trim($("#ipt_phone").val());
	return $.get(checkUrl,{"email":email,"mobile":phone});
	
}

	
//头像裁剪方法
function initJcrop() {
    $('#cropbox').Jcrop({
        onSelect: updateCoords,
        onChange: updateCoords,
        aspectRatio: 1,
        boxWidth: 400,
        boxHeight: 300,
        minSize: [150, 150]
    }, function () {
        jcrop_api = this;
        //图片实际尺寸
        var bb = this.getBounds();
        var bWidth = Number(bb[0]) / 2;
        var bHeight = Number(bb[1]) / 2;
        this.setSelect([0, 0, bWidth, bHeight]);
        var ss = this.getWidgetSize();
        var aheight = (300 - Number(ss[1])) / 2 + "px";
        $(".jcrop-holder").css({ "margin": aheight + " auto" });

    });
}
function updateCoords(c) {
    var img = document.getElementById("cropbox");
    var ctx = document.getElementById("avatat_prev").getContext("2d");

    //img,开始剪切的x,Y坐标宽高，放置图像的x,y坐标宽高。
    ctx.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, 200, 200);
}



//上传到7牛云存储
function upLoadToQiniu(){	
	  var b = new Base64();  
	  var destination_file_name = 'portrait/' + moment().format('YMDhms') + Math.ceil(Math.random() * 1000) + fileType;  
			//console.log(destination_file_name);
	  destination_file_name=b.encode(destination_file_name);
	  var url = 'http://upload-z1.qiniu.com/putb64/-1/key/'+destination_file_name;  
      return $.ajax({
                headers: {  
                    'Content-Type': 'application/octet-stream',  
                    'Authorization': 'UpToken ' + qiniuToken,    // UpToken后必须有一个 ' '(空格)  
                },  
                type: 'POST',  
                url: url,  
                dataType: 'json',  
                data: base64_upload_data	
      }); 
}


function disableBtn(isTrue){
	if(isTrue){
		$("#btn_doreg").val("修改中...").attr('disabled',true);
	}else
	{
		$("#btn_doreg").val("修改").attr('disabled',false);	
	}
}


