
var pTypeID, subTypeID,pTypeName,sTypeName;
var pageNo,
	_psize=24,  //默认每页记录条数
	totalPage,
	_totalCount //所有记录数

$(function(){
	 $("#video_list img.video-img").lazyload({ 
                effect : "fadeIn",
		        placeholder : "images/bg_gray.gif"
             }); 
			
	$("#pager li").click(function(){
				$("#pager li").removeClass('selected');
				$(this).addClass('selected');
			});
	
	setSelectPage();
	
	pTypeID=GetQueryString('pt');
	
	subTypeID=GetQueryString('st');
	
	pTypeName=GetQueryString('pname');
	
	sTypeName=GetQueryString('sname');
	
	if(pTypeID!=""&&subTypeID!=""){
		
		BindVideoLessonType(false);
		
		$("#pagination").whjPaging({
				css: 'css-2',
				showPageNum: 8,
				isShowFL:true,
				isShowPageSizeOpt: false,
				isShowRefresh: false,
				callBack: function (currPage, pageSize) {
					//getStudyList("",currPage,_psize);
					console.log(currPage);
					BindLessonsByAllType(pTypeID,subTypeID,currPage);
				}
			});	
		
		BindLessonsByAllType(pTypeID,subTypeID,1);
		
		
	}else
	{
		BindVideoLessonType(true);		
	}
	
	
	
	//getStudyList(userToken,1,_psisze);
	  
	   /*$("#pagination").whjPaging({
				css: 'css-2',
				showPageNum: 8,
				isShowFL:true,
				isShowPageSizeOpt: false,
				isShowRefresh: false,
				callBack: function (currPage, pageSize) {
                	//console.log('currPage:' + currPage + '     pageSize:' + pageSize);
					//getStudyList("",currPage,)
					//getStudyList("",currPage,_psize);
					BindLessonsByType(_typeID)
				}
			});	*/
})




//绑定视频课程类型，参数标识是否绑定类型下的课程

function BindVideoLessonType(bindLesson)
{
	$.get(APIurl+"lesson/lessonTypes").done(function(res){
		//console.log(res);
		$.each(res.data,function(i,o){
			$("#class_nav").append('<div id="lt_'+o.id+'" class="nav-item">\
				<p><a class="nav-title">'+o.name+'</a></p>\
				<p></p>\
			</div>');
			
			$.each(o.subList,function(si,so){
				$("#class_nav div.nav-item p").last().append('<a href="videolist.html?pt='+o.id+'&st='+so.id+'&pname='+o.name+'&sname='+so.name+'" class="nav-subtitle">'+so.name+'</a>'); //导航二级分类绑定
			})
			
			if(bindLesson){
			  $("#video_list").append('<section id="vl_'+o.id+'" class="video-section clearfix"><i class="small-title-red">'+o.name+'</i></section>');//根据一级分类放置视频内容显示区	
			  BindLessonsByType(o.id);
			}
			
		});	
	})
}

//仅绑定一级分类的视频，第一次进入页面执行
function BindLessonsByType(_typeID){

		$.get(APIurl+"lesson/lessons",{parentLessonTypeId:_typeID,pageSize:8}).done(function(res){
		        if(res.code==200){
					//console.log(res);
					if(res.data.rows.length>0){
						$.each(res.data.rows,function(li,lo){
							$("#video_list section#vl_"+_typeID).append('<div class="video-item">\
									  			  <a href="video.html?vid='+lo.id+'">\
 		          	 								<img class="video-img" src="'+lo.cover+'" width="290" height="180" alt="'+lo.name+'"/>\
									  			  </a>\
									  			  <div class="video-info">\
	 		       	  								<a href="video.html?vid='+lo.id+'" class="video-title">'+lo.name+'</a>\
									  				<a href="#" class="video-author">'+lo.authorName+'</a>\
									  				<a href="#" class="video-price">'+formatPrice(lo.price)+'</a>\
									  			  </div>\
										       </div>');
						})
					}else{
						$("#video_list section#vl_"+_typeID).remove();
					}
					
				}
				
		})	
	
}


//按一级+二级分类绑定数据 
function BindLessonsByAllType(p_typeID,s_typeID,p_No){
	if($("#vl_"+p_typeID).length==0){
		$("#video_list").append('<section id="vl_'+p_typeID+'" class="video-section clearfix"><i class="small-title-red">'+decodeURI(pTypeName)+' - '+decodeURI(sTypeName)+'</i></section>');
	}
	
	$.get(APIurl+"lesson/lessons",{parentLessonTypeId:p_typeID,pageSize:_psize,lessonTypeId:s_typeID,pageNo:p_No}).done(function(res){
		console.log(res);
		if(res.code==200){
			//alert("aaa");
			$("#video_list section#vl_"+p_typeID+" div.video-item").remove();
			$.each(res.data.rows,function(li,lo){
				$("#video_list section#vl_"+p_typeID).append('<div class="video-item">\
									  			  <a href="video.html?vid='+lo.id+'">\
 		          	 								<img class="video-img" src="'+lo.cover+'" width="290" height="180" alt="'+lo.name+'"/>\
									  			  </a>\
									  			  <div class="video-info">\
	 		       	  								<a href="video.html?vid='+lo.id+'" class="video-title">'+lo.name+'</a>\
									  				<a href="#" class="video-author">'+lo.authorName+'</a>\
									  				<a href="#" class="video-price">'+formatPrice(lo.price)+'</a>\
									  			  </div>\
										       </div>');
			});
			pageNo=res.data.pageNo;
			totalPage=res.data.totalPage;
			_totalCount=res.data.totalCount;
			if(totalPage==1){
				totalPage=0;
			}
			$("#pagination").whjPaging("setPage", pageNo, totalPage);
			
		}
		
	})
	
}

/*parentLessonTypeId	
课程父类别id

query	integer
lessonTypeId	
课程类别id

query	integer
pageNo	
页码,默认1

query	integer
pageSize	
每页记录数,默认500

query	integer*/


