// JavaScript Document


$(function(){
	$("#content img.video-img").lazyload({ 
          effect : "fadeIn",
		  placeholder : "images/bg_gray.gif"
    }); 
	BindRollImgs(1);
	checkLogin();
	BindVideoLesson();
	getStudyList();
}) 


function BindRollImgs(i_type){
	
	var api=APIurl+"banners";
	$.get(api,{type:i_type}).done(function(res){
		
	    if(res.code=="500"){   //当返回码为500时，表示不成功
			alert("请求数据失败，服务器内部异常");
		}else if(res.code=="200"){  //当反悔吗为200时，表示成功
			var imgs=res.data;
			
			//向页面中插入图片
			for(i=0;i<imgs.length;i++){
				$("#slider").append('<a href="'+imgs[i].linkUrl+'"><img src="'+imgs[i].picUrl+'" width="1200" height="350" alt=""/></a>');
			}
			
			//给图片设置切换效果
			$('#slider').nivoSlider({
					effect: 'fade',   // 效果
					animSpeed: 500,        // 动画速度
					pauseTime: 3500       // 暂停时间
			});
			// 设置小圆点偏移值，使居中
			var sliderOffset = $(".nivo-controlNav").width() * (-0.5) - 16;
			$(".nivo-controlNav").css("marginLeft", sliderOffset);
		}

	});
	
}



function BindVideoLesson()
{
	$.get(APIurl+"lesson/lessonTypes").done(function(res){
		console.log(res.data);
		$.each(res.data,function(i,o){
			$("#video_list").append('<section class="video-wrap"><i class="video-type-tit">'+o.name+'</i><div id="vt_'+o.id+'" class="video-list clearfix"></div></section>');
			$("#video_list i.video-type-tit:even").css('border-left-color','#FF355B');
			$.get(APIurl+"lesson/lessons",{parentLessonTypeId:o.id,pageSize:8}).done(function(res){
				if(res.data.rows.length>0){
					$.each(res.data.rows,function(li,lo){
						$("#vt_"+o.id).append('<div class="video-item">\
									  		 <a href="video.html?vid='+lo.id+'">\
 		          	 							<img class="video-img" src="'+lo.cover+'" width="290" height="180" alt="'+lo.name+'"/>\
									  		</a>\
									  		<div class="video-info">\
	 		       	  							<a href="video.html?vid='+lo.id+'" class="video-title">'+lo.name+'</a>\
									  			<a href="#" class="video-author">'+lo.authorName+'</a>\
									  			<a href="#" class="video-price">'+lo.price+'</a>\
									  		</div>\
                                         </div>');
						})
					
				}else{
					$("#vt_"+o.id).parent().remove();
				}

			})
		});
	})
}



function getStudyList(){
	//GET /study/userStudies
	$.get(APIurl+"study/userStudies",{token:'',pageNo:1,pageSize:10}).done(function(res){
		if(res.code==200){
			$("#hw_list").empty();
			$.each(res.data.rows,function(i,o){
			//console.log(o.createTime);
			$("#hw_list").append('<div class="hw-cell">\
                        						<a href="hw_detail.html?sid='+o.userStudyId+'" target="_blank" class="hw-pic"><img src="'+o.pic+'" style="width:230px;height:170px;" /></a>\
												<a href="hw_detail.html?sid='+o.userStudyId+'" target="_blank" class="hw-name">'+o.userName+'的第'+o.studyNumber+'次作业</a>\
												<p><a href="#" class="mission-teach-name">'+o.userName+'</a></p>\
                        						<p class="hw-date">'+getDateDiff(o.createTime)+'</p>\
											</div>');
			
			});
		}else{
			alert("服务器获取数据失败，请联系管理员");
		}
	})
}



