// JavaScript Document

var userToken="";

var isMyhw=false;

var pageNo,
	_psize=30,  //默认每页记录条数
	totalPage,
	_totalCount //所有记录数

$(function(){
	var tUrl=window.location.href;
	if(checkLogin()!=true)//检查登录状态,没有登录的话跳转到登录页面
   {
	   window.location.href="new_login.html"; 	
   }else
   {
	   
	   if(tUrl.indexOf("myhw")!=-1){
		   isMyhw=true;
		   userToken=localStorage.getItem("uirenToken");
		   
	   }
	   
	   getStudyList(userToken,1,_psize);
	  
	   $("#pagination").whjPaging({
				css: 'css-2',
				showPageNum: 8,
				isShowFL:true,
				isShowPageSizeOpt: false,
				isShowRefresh: false,
				callBack: function (currPage, pageSize) {
					getStudyList("",currPage,_psize);
				}
			});	
	   
   }
	
	
})


/*					<div class="hw-cell">
						<a href="hw_detail.html?sid=6864" target="_blank" class="hw-pic"><img src="http://user.img.uiren.net/study/20182595240708.jpg" style="width:230px;height:170px;"></a>												<a href="hw_detail.html?sid=6864" target="_blank" class="hw-name">nmdigboy的第6次作业</a>												
						<p class="clearfix">
							<a href="#" class="mission-teach-name">nmdigboy</a><a class="edit-study" href="myhw.html?o=edit&sid=6848">修改</a>
						</p>       
						
						<p class="hw-date">1天前</p>											
					</div>
*/


function getStudyList(uToken,pNum,pSize){
	//GET /study/userStudies
	$.get(APIurl+"study/userStudies",{token:uToken,pageNo:pNum,pageSize:pSize}).done(function(res){
		if(res.code==200){
			$("#content div.hw-row").empty();
			$.each(res.data.rows,function(i,o){
			   //console.log(o.createTime);
			   $("#content div.hw-row").append('<div class="hw-cell">\
                        						<a href="hw_detail.html?sid='+o.userStudyId+'" target="_blank" class="hw-pic"><img src="'+o.pic+'" style="width:230px;height:170px;" /></a>\
												<a href="hw_detail.html?sid='+o.userStudyId+'" target="_blank" class="hw-name">'+o.userName+'的第'+o.studyNumber+'次作业</a>\
												<p class="clearfix"><a href="#" class="mission-teach-name">'+o.userName+'</a><a class="edit-study" href="mission.html?o=edit&sno='+o.studyNumber+'&uimg='+encodeURI(o.pic)+'">修改</a></p>\
                        						<p class="hw-date">'+getDateDiff(o.createTime)+'</p>\
											</div>');
				
				
			   if(isMyhw==false){
			     $("#content div.hw-row div.hw-cell:last-child a.edit-study").remove();	
			   }
			});
			
			
			
			pageNo=res.data.pageNo;
			totalPage=res.data.totalPage;
			_totalCount=res.data.totalCount;
			if(totalPage==1){
				totalPage=0;
			}
			$("#pagination").whjPaging("setPage", pageNo, totalPage);
			$("#hw-number").text(_totalCount);
		}else{
			alert("服务器获取数据失败，请联系管理员");
		}
	})
}


