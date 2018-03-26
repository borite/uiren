// JavaScript Document


//APIurl="http://47.93.84.249:30000/";

var pageNo,
	_psize=9,  //默认每页记录条数
	totalPage,
	_totalCount //所有记录数

$(function(){
	checkLogin();
	getArticleTypes();
	$("#pagination").whjPaging({
		css: 'css-2',
		showPageNum: 8,
		isShowFL:true,
		isShowPageSizeOpt: false,
		isShowRefresh: false,
		callBack: function (currPage, pageSize) {
			getArticleByTypeID(currPage);
		}
	});	
	   
 
    
})


function getArticleTypes(){
	
	var listItemHtml="<li><a></a></li> "

	$.get(APIurl+"article/articleTypes").done(function(res){
		if(res.code==200){
			$("#artical_list").empty();
			if(res.data.length==0){
				alert("还没有文章信息");
			}
			else{
				var allTypeNum=res.data.length;
				$.each(res.data,function(i,o){
					$("#artical_list").append(listItemHtml);
					$("#artical_list > li:last-child").attr('data-tid',o.id).find('a').attr('href','articlelist.html?typeid='+o.id).text(o.name);
				});
				getArticleByTypeID();
			}
		}else{
			alert("出错了~"+res.message);
		}
	})
}

//通过文章类型ID获取文章 
function getArticleByTypeID(pNum){
	var typeID=GetQueryString('typeid');
	if(typeID=="" && $("#artical_list > li").length > 0){
		typeID=$("#artical_list > li:first-child").data('tid');
	}
	
	var artiListItemHtml='<div class="arri-block">\
		     <a class="arti-pic-a" href=""><img class="arti-pic" src="images/111.jpg" width="290" height="170" /></a>\
		     <a class="arti-title" href="#">文章标题</a> <br>\
			 <a class="arti-auth" href="#">作者</a>\
			 <div class="block-bottom">\两天前 </div>\
		   </div>'
	
	$.get(APIurl+"article/articles",{articleTypeId:typeID,pageNo:pNum,pageSize:_psize}).done(function(res){
		console.log(res);
		if(res.code==200){
			$("#pagination").appendTo("#content");
			$("#right_content").empty();
			if(res.data.rows.length==0){
				alert("该分类下还没有文章");
			}else{
				$.each(res.data.rows,function(i,o){
					$("#right_content").append(artiListItemHtml);
					$("#right_content > div:last-child").find('img.arti-pic').attr('src',o.coverUrl)
						.end().find('a.arti-pic-a').attr('href','article.html?aid='+o.id)
						.end().find('a.arti-title').attr('href','article.html?aid='+o.id).text(o.title)
						.end().find('a.arti-auth').attr('href','usercenter.html?sid='+o.userId).text(o.userName)
					    .end().find('div.block-bottom').text(getDateDiff(o.createTime));
				});
				    
					pageNo=res.data.pageNo;
					totalPage=res.data.totalPage;
					_totalCount=res.data.totalCount;
					if(totalPage==1){
						totalPage=0;
					}
				
				    $("#right_content").append('<div class="clearboth"></div>');
					$("#pagination").appendTo("#right_content").whjPaging("setPage", pageNo, totalPage);
				}
			
		}else{
			alert("出错了~~~"+res.message);
		}
	})
	
}

//获取文章内容
function getArticleContent(aid){
		   $.get(APIurl+"article/articleDetail",{id:aid}).done(function(res){
			   //console.log(res);
			   document.title=res.data.title;
			   $("#arti_title").text(res.data.title);
			   $("#arti_info .arti-pub-time").text("发表时间："+getDateDiff(res.data.createTime));
			   $("#arti_info .arti-author").text(res.data.userName).attr("href","usercenter.html?sid="+res.data.userId);
			   $("#arti_content").html(res.data.content);
		   })
	   }


