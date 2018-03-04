// JavaScript Document


APIurl="http://47.93.84.249:30000/";


$(function(){
	getArticleTypes();
})


function getArticleTypes(){
	
	var listItemHtml="<li><a></a></li> "

	$.get(APIurl+"article/articleTypes").done(function(res){
	 
		if(res.code==200){
			console.log(res);
			$("#artical_list").empty();
			if(res.data.length==0){
				alert("还没有文章信息");
			}
			else{
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
function getArticleByTypeID(){
	var typeID=GetQueryString('typeid');
	if(typeID=="" && $("#artical_list > li").length > 0){
		typeID=$("#artical_list > li:first-child").data('tid');
	}else{
		alert("获取文章列表出错~");
		return;
	}
	
	var artiListItemHtml='<div class="arri-block">\
		     <img class="arti-pic" src="images/111.jpg" width="290" height="170" />\
		     <a class="arti-title" href="#">文章标题</a> <br>\
			 <a class="arti-auth" href="#">作者</a>\
			 <div class="block-bottom">\两天前 </div>\
		   </div>'
	
	$.get(APIurl+"article/articles",{articleTypeId:typeID,pageNo:1,pageSize:30}).done(function(res){
		
		if(res.code==200){
			$("#right_content").empty();
			if(res.data.rows.length==0){
				alert("该分类下还没有文章");
			}else{
				$.each(res.data.rows,function(i,o){
					$("#right_content").append(artiListItemHtml);
					$("#right_content > div").find('img.arti-pic').attr('src',o.coverUrl)
						.end().find('a.arti-title').text(o.title)
						.end().find('a.arti-auth').text(o.userName)
					    .end().find('div.block-bottom').text(getDateDiff(o.createTime));
				})
			}
			
		}else{
			alert("出错了~~~"+res.message);
		}
	})
	
}


