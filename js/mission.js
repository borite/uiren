// JavaScript Document

var jcrop_api; 

var qiniuToken="";  //获取上传头像用到的七牛Token

var base64_upload_data; //上传头像的图片base64编码

var fileType;  //上传头像的图片类型

var userToken; //用户登录token

var userCurrentStudy; //用户当前的闯关进度

var stat,studyNo,userimg;  //页面进入判断是不是编辑状态，study-要编辑的第几次作业，用来获取作业要求 ,当前的作业图片

//Document Ready Begin
$(function(){
		
   if(checkLogin()!=true)//检查登录状态,没有登录的话跳转到登录页面
   {
	   window.location.href="new_login.html"; 	
   }else
   {
	   userToken=localStorage.getItem("uirenToken");
	   stat=GetQueryString('o');
	   studyNo=GetQueryString('sno');
	   userimg=GetQueryString('uimg');
	   
	   if(stat==""){
		   getCurrentStudy();
	   } 
	   
	   if(stat=="edit"){
		   if(studyNo=="" || userimg==""){
			   alert('参数错误,请联系管理员');
		   }else{
			   userCurrentStudy=studyNo;
			   getEditStudy(studyNo,userimg);		   
		   }
	   } 
	
   }
	
	
    //选择图片窗口
	$("#upload_btn").click(function(){
		$("#avatar_select").click();
	});
	
	//弹出裁剪窗口的按钮点击事件
	$("#btn_save").click(function () {
        var imgSrc = document.getElementById("avatat_prev").toDataURL("image/png");
        document.getElementById("img_work").src = imgSrc;
		$("#upload_btn").hide();
		$("#save_study").show();
        $.closePopLayer();
    });
	
	
	//保存作业
	$("#save_study").click(function(){
		$(this).attr('disabled',true);
	    var imgSrc=document.getElementById("img_work").src;
	    base64_upload_data = imgSrc.replace(/^.*?base64,/, '');	
		getToken().then(function(res){   //获取7牛上传图片的token后
			if(res!=null){
				qiniuToken=res.uptoken;
				return upLoadToQiniu(); //上传图片到7牛	
			}else{
				$(this).attr('disabled',false);
			}
		      
		}).then(function(res){   
			if(res!=null){
				var studyPicUrl="http://user.img.uiren.net/"+res.key;
				return uploadStudy(studyPicUrl);  //上传闯关的作业
			}else
			{
				$(this).attr('disabled',false);
			}
			
		}).done(function(res){
			if(stat=="edit"){
				alert('修改作业成功~');
				window.location.href='myhw.html';
			}else{
				getCurrentStudy();
			}
			
		}).always(function(){
			$(this).attr('disabled',false);
		})
	})

	//当选择头像原始文件时执行，也就是input值改变的时候
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
	
}) //ready结束


function getEditStudy(sno,uimg){
	$.get(APIurl+"study/studyDetail",{studyNumber:sno}).done(function(res){
		 console.log(res);
		 var sNum=res.data.studyNumber;
	  	 if(sNum<10){
		   sNum="0"+sNum;
		 }
		 $("#info-title").html('<a id="info-number">'+sNum+'</a>&nbsp;'+res.data.title);
	     $("#info-content").text(res.data.studyDesc);
	     $("#img_work").attr("src", decodeURI(uimg));
		
	})
	
}



//图片剪裁方法
function initJcrop() {
    $('#cropbox').Jcrop({
        onSelect: updateCoords,
        onChange: updateCoords,
        aspectRatio: 4/3,
        boxWidth: 400,
        boxHeight: 300,
		minSize: [160,120]
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
    ctx.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, 800, 600);
}


//上传到7牛
function upLoadToQiniu(){	
	  var b = new Base64();  
	  var destination_file_name = 'study/' + moment().format('YMDhms') + Math.ceil(Math.random() * 1000) + fileType;  
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


//获取当前用户的作业完成进度
function getCurrentStudy(){
  $.get(APIurl+"study/getCurrentStudyByUser",{token:userToken}).done(function(res){
	  var sNum=res.data.studyNumber;
	  userCurrentStudy=sNum;
	  if(sNum<10){
		  sNum="0"+sNum;
	  }
	  $("#info-title").html('<a id="info-number">'+sNum+'</a>&nbsp;'+res.data.title);
	  $("#info-content").text(res.data.studyDesc);
	  $("#img_work").attr("src",res.data.pic);
	  $("#upload_btn").show();
	  $("#save_study").hide();

  })
}

//上传闯关作业
function uploadStudy(studyUrl){
  return $.post(APIurl+"study/uploadWork",{token:userToken,studyNumber:userCurrentStudy,pic:studyUrl})
}





