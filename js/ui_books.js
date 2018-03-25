// JavaScript Document

var isLogin;
var uToken;
 $(function(){
		GetBooks();
		if(checkLogin()){
			$("#notice").hide();
			isLogin=true;
		    uToken=localStorage.getItem("uirenToken");
		}else{
			$("#notice").show();
			isLogin=false;
		}

})
function GetBooks(){ 
		var apiUrl=APIurl+"bookTypes";
		   
		$.get(apiUrl).done(function(res){
			   if(res.code=="200"){
				   var book_list_html="";
				   $.each(res.data,function(i,v,a){
					   book_list_html="";
					   $("#content").append('<section><i class="green-title">'+v.typeName+'</i><div class="books-wrap"></div<section>');
					   $.each(v.books,function(oi,ov,a){
						   var imgUrl;
						   if(ov.readTag==0){
							   imgUrl="images/no_see.png";
						   }else{
							   imgUrl="images/saw.png";
						   }
						   book_list_html+='<div class="books-cell">\
						   						<a href="'+ov.buyUrl+'" target="_blank" class="book-pic"><img src="'+ov.coverUrl+'" height="180" width="141" /></a>\
						   						<a href="'+ov.buyUrl+'" target="_blank" class="book-name">'+ov.bookName+'</a>\
						   						<img id="'+ov.id+'" class="read-noti" data-read="'+ov.readTag+'" onClick="readBook('+ov.id+')" src="'+imgUrl+'" />\
	   										</div>';
						   
						   
					   })
					   $("#content > section:last-child > div.books-wrap").append(book_list_html);
				   });
				   
				   $(".books-wrap img.read-noti[data-read='1']").attr("src","images/saw.png");
				   
			   }else{
				   alert(res.message);
			   }
		})
}


function readBook(bookID){
	//console.log(bookID);
	$.post(APIurl+"book/read",{token:uToken,bookId:bookID}).done(function(res){
		//console.log(res);
		if(res.code==200){
		  var obj=$("#"+bookID);
		  obj.attr('src','images/saw.png').attr('data-read','1');
		  
		}else{
			//console.log(res.message);
		}
		
	})
}
	