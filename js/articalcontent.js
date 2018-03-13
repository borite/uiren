//APIurl="http://47.93.84.249:30000/";
	   
	   $(function(){
		   getArticleTypes();
		   
		   var aid=GetQueryString("aid");	 
		   
		   getArticleContent(aid);
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
					}
				}else{
					alert("出错了~"+res.message);
				}
			})
		}
	   
	   
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
	