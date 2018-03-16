// JavaScript Document

var h5TypeAPI=APIurl+"h5/h5Types";

$(function(){
	checkLogin();
	
	$.get(h5TypeAPI).done(function(res){
		var typeList=res.data;
		$.each(typeList,function(i,o){
			$("#nav_bar").append('<li id="'+o.id+'">'+o.name+'<a></a></li>');
		})
		$("#nav_bar > li:first-child").addClass("selected");
		$("#nav_bar > li").click(function () {
            $("#nav_bar li").removeClass('selected');
            $(this).addClass('selected');
			var tID=$(this).attr('id');
			var tName=$(this).text();
			getH5Products(tID,1,tName);
        })
		getH5Products(1,1,res.data[0].name);
		
	}).fail(function(){
		alert("服务器异常，请联系管理员");
	})
	
	$("#content-class").on("click",".img-href,.h5-tit",function(){
		var parent=$(this).parents('.cell');
	    var img=parent.data("img");
		var qrcod=parent.data("qrcode");
		var title=parent.attr('title');
		var popEle=$("#poplayer");
		$.showPopLayer({
                target: "poplayer",
                screenLock: true,
                screenLockBackground: "#000",
                screenLockOpacity: "0.4",
                onPop: function () {
					popEle.find("img.works-img").attr('src',img);
					popEle.find("h2.work-tit").text(title);
					popEle.find("img.work-ewm").attr('src',qrcod);
				},
                onClose: function () { 
					popEle.find("img.works-img").attr('src','http://fakeimg.pl/332x590/DBDBDB/282828');
					popEle.find("h2.work-tit").text('');
					popEle.find("img.work-ewm").attr('src','http://fakeimg.pl/170x170/DBDBDB/282828');
				},
                fixedPosition: true,
                formID: "",
                animate: true
            })
	})
	
})


//获取H5收集的作品
function getH5Products(typeID,pageNum,typeName){
	var h5ProductsAPI=APIurl+"h5/h5s";
	var pageSize=28;//固定每页20条数据
	$.get(h5ProductsAPI,{"h5TypeId":typeID,"pageNo":pageNum,"pageSize":pageSize}).done(function(res){
		if(res.code==200){
			$("#content-class").empty();
			var rows=res.data.rows;
			$.each(rows,function(i,o){
				var fullname=o.name;
				if(o.name.length>15){
					o.name=o.name.substr(0,15)+"...";
				}
				$("#content-class").append('<div id="'+o.id+'" class="cell" title="'+fullname+'" data-img="'+o.pic+'" data-qrcode="'+o.qrCode+'">\
                									<a class="img-href" ><img src="'+o.cover+'" width="290" height="350" /></a>\
									   				<div class="bottom">\
									   					<div class="bottom-top">\
                        									<a class="h5-tit">'+o.name+'</a><br />\
									   						<a class="h5-type">'+typeName+'</a>\
                    									</div>\
                    									<div class="bottom-down">\
                        									<a>'+o.author+'</a>\
                    									</div>\
									   				</div>\
									   		</div>');
			})
			
		}else{
			alert(res.message);
		}
	}).fail(function(){
		alert("服务器异常获取数据失败，请联系管理员。");
	})
}